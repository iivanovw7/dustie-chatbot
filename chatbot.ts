import _ from "npm:lodash@4.17.15";
import { ChatGPTAPI, ChatMessage } from "npm:chatgpt@5.2.5";

// @deno-types="npm:@types/node-telegram-bot-api@0.61.6";
import TelegramBot from "npm:node-telegram-bot-api@0.61.0";

import "https://deno.land/x/dotenv@v3.2.0/load.ts";

import { testBot } from "./service/testBot.ts"
import { isBotNameMessage, log, trimMessage } from "./shared/utils.ts";
import {
    CHAT_GPT_MODEL,
    CHAT_MESSAGES,
    Commands,
    CONTROLS,
    LOG_MESSAGES,
    TelegramActions,
    THROTTLE_DELAY
} from "./shared/constants.ts";

const { throttle, isObject } = _;

const TOKEN = Deno.env.get("TOKEN");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const CHAT_ID = Deno.env.get("CHAT_ID");
const CHAT_ID_VERIFICATION = Deno.env.get("CHAT_ID_VERIFICATION");

if (! TOKEN || ! OPENAI_API_KEY) {
    log(LOG_MESSAGES.tokenError);
    Deno.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });
const botInfo = await bot.getMe();
const botName = botInfo.username || "";

let chatGPTAPI: ChatGPTAPI;
let conversationId: string | null = null;
let parentMessageId: string | null = null;

try {
    chatGPTAPI = new ChatGPTAPI({
        apiKey: OPENAI_API_KEY,
        completionParams: {
            model: CHAT_GPT_MODEL,
        }
    });
}
catch (err) {
    log(LOG_MESSAGES.chatGptError, err.message);
    Deno.exit(1);
}

log(LOG_MESSAGES.startup);

bot.on("message", async (chatMessage: TelegramBot.Message) => {
    await handleMessage(chatMessage)
});

type TEditMessageParams = {
    chatMessage: TelegramBot.Message;
    text: string;
    withParsing?: boolean
}

const editMessage = async (params: TEditMessageParams) => {
    const {
        chatMessage,
        text,
        withParsing
    } = params;

    const {
        chat: {
            id: chatId,
        },
        message_id: messageId,
        text: messageText
    } = chatMessage;

    if (messageText === text || ! text || text.trim() === "") return chatMessage;

    try {
        const response = await bot.editMessageText(text, {
            chat_id: chatId,
            message_id: messageId,
            ...(withParsing && {
                parse_mode: "Markdown",
            })
        })

        return isObject(response)
            ? response as TelegramBot.Message
            : chatMessage
    }
    catch (err) {
        log(LOG_MESSAGES.editMessageError, err.message);
        return chatMessage;
    }
}

const handleCommand = async (chatMessage: TelegramBot.Message) => {
    const {
        chat: {
            id: chatId,
        },
        text: chatMessageText
    } = chatMessage;

    const trimmedText = trimMessage(botName, chatMessageText);

    const send = (message: string) => {
        bot.sendMessage(chatId, message, CONTROLS);

        return true;
    }

    switch (trimmedText) {
        case Commands.START: {
            return send(CHAT_MESSAGES.startup);
        }
        case Commands.RELOAD:
        case Commands.RESET: {
            conversationId = null;
            parentMessageId = null;

            return send(CHAT_MESSAGES.reset);
        }
        case Commands.HELP: {
            return send(CHAT_MESSAGES.help(String(chatId), CHAT_GPT_MODEL));
        }
        case Commands.TEST: {
            return await testBot(chatMessage, bot);
        }
        default: {
            return false;
        }
    }
}

const handleMessage = async (chatMessage: TelegramBot.Message) => {
    const {
        chat: {
            id: chatId,
            type: chatType
        },
        message_id: messageId,
        text: messageText
    } = chatMessage;

    if (! messageText) return;

    if (["group", "supergroup"].includes(chatType) && ! isBotNameMessage(messageText, botName)) {
        await handleCommand(chatMessage);
        return;
    }

    if (await handleCommand(chatMessage)) return;

    const trimmedText = trimMessage(botName, messageText);

    if (trimmedText === "") return;

    log(LOG_MESSAGES.from(String(chatId)), trimmedText);

    let respMsg: TelegramBot.Message;

    try {
        respMsg = await bot.sendMessage(chatId, CHAT_MESSAGES.thinking, {
            reply_to_message_id: messageId,
        });

        bot.sendChatAction(chatId, TelegramActions.TYPING);
    }
    catch (err) {
        log(LOG_MESSAGES.telegramError, err.message);
        return;
    }

    if (CHAT_ID_VERIFICATION && CHAT_ID !== String(chatId)) {
        bot.sendMessage(chatId, CHAT_MESSAGES.wrongChatId)
        return;
    }

    try {
        const response: ChatMessage = await chatGPTAPI.sendMessage(trimmedText, {
            ...(conversationId && parentMessageId && {
                conversationId,
                parentMessageId,
            }),
            onProgress: throttle(async ({ text }: ChatMessage) => {
                    respMsg = await editMessage({
                        chatMessage: respMsg,
                        text: text
                    });

                    bot.sendChatAction(chatId, TelegramActions.TYPING);
                },
                THROTTLE_DELAY,
                {
                    leading: true,
                    trailing: false
                }
            ),
        });

        conversationId = response?.conversationId || null;
        parentMessageId = response?.id || null;

        await editMessage({
            chatMessage: respMsg,
            text: response.text,
            withParsing: true
        });

        log(LOG_MESSAGES.response, response);
    }
    catch ({ message }) {
        log(LOG_MESSAGES.error, message);

        bot.sendMessage(chatId, message.includes("session token may have expired")
            ? CHAT_MESSAGES.expiredToken
            : CHAT_MESSAGES.unknownError
        )
    }
}
