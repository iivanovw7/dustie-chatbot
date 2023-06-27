import _ from "npm:lodash@4.17.15";
import { ChatGPTAPI, ChatMessage } from "npm:chatgpt@5.0.6";

// @deno-types="npm:@types/node-telegram-bot-api@^0.57.6";
import TelegramBot from "npm:node-telegram-bot-api@0.61.0";

import "https://deno.land/x/dotenv@v3.2.0/load.ts";

import { testBot } from "./service/testBot.ts"
import { log } from "./shared/utils.ts";
import { CHAT_MESSAGES, Commands, CONTROLS, LOG_MESSAGES, THROTTLE_DELAY } from "./shared/constants.ts";

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
let conversationID: string | null = null;
let parentMessageID: string | null = null;

try {
    chatGPTAPI = new ChatGPTAPI({ apiKey: OPENAI_API_KEY });
}
catch (err) {
    log(MESSAGES.chatGptError, err.message);
    Deno.exit(1);
}

log(LOG_MESSAGES.startup);

bot.on("message", async (msg) => {
    await handleMessage(msg)
});

const editMessage = async (msg: TelegramBot.Message, text: string, withParsing = true) => {
    const {
        chat: {
            id: chatId,
        },
        message_id: messageId,
        text: messageText
    } = msg;

    if (messageText === text || ! text || text.trim() === "") return msg;

    try {
        const response = await bot.editMessageText(text, {
            chat_id: chatId,
            message_id: messageId,
            ...(withParsing && {
                parse_mode: "Markdown",
            })
        })

        return _.isObject(response)
            ? response as TelegramBot.Message
            : msg
    }
    catch (err) {
        log(LOG_MESSAGES.editMessageError, err.message);
        return msg;
    }
}

const handleCommand = async (msg: TelegramBot.Message) => {
    const {
        chat: {
            id: chatId,
        },
    } = msg;

    const trimmedText = msg.text?.replace(`@${botName}`, "").trim()

    const send = (message: string) => {
        bot.sendMessage(chatId, message, CONTROLS);
    }

    switch (trimmedText) {
        case Commands.START: {
            send(CHAT_MESSAGES.startup);

            return true;
        }
        case Commands.RELOAD:
        case Commands.RESET: {
            conversationID = null;
            parentMessageID = null;
            log(LOG_MESSAGES.reset);
            send(CHAT_MESSAGES.reset);

            return true;
        }
        case Commands.HELP: {
            send(CHAT_MESSAGES.help(chatId));
            return true;
        }
        case Commands.TEST: {
            await testBot(msg, bot);

            return true;
        }
        default: {
            return false;
        }
    }
}

const handleMessage = async (msg: TelegramBot.Message) => {
    const {
        chat: {
            id: chatId,
            type: chatType
        },
        message_id: messageId,
        text: messageText
    } = msg;

    if (! messageText) return;

    if (["group", "supergroup"].includes(chatType)) {
        if (! messageText.startsWith(`@${botName}`)) {
            await handleCommand(msg)
            return;
        }
    }

    if (await handleCommand(msg)) return;

    const message = messageText.replace(`@${botName}`, "").trim()

    if (message === "") return;

    log(LOG_MESSAGES.from(chatId), message);

    let respMsg: TelegramBot.Message;

    try {
        respMsg = await bot.sendMessage(chatId, CHAT_MESSAGES.thinking, {
            reply_to_message_id: messageId,
        });

        bot.sendChatAction(chatId, CHAT_MESSAGES.typing);
    }
    catch (err) {
        log(LOG_MESSAGES.tele, err.message);
        return;
    }

    if (CHAT_ID_VERIFICATION && CHAT_ID !== chatId) {
        bot.sendMessage(chatId, CHAT_MESSAGES.wrongChatId)
        return;
    }

    try {
        const response: ChatMessage = await chatGPTAPI.sendMessage(message, {
            conversationId: conversationID,
            parentMessageId: parentMessageID,
            onProgress: _.throttle(async ({ text }: ChatMessage) => {
                respMsg = await editMessage(respMsg, text, false);
                bot.sendChatAction(chatId, CHAT_MESSAGES.typing);
            }, THROTTLE_DELAY, { leading: true, trailing: false }),
        });

        conversationID = response.conversationId;
        parentMessageID = response.id;

        await editMessage(respMsg, response.text);

        log(LOG_MESSAGES.response, response);
    }
    catch (err) {
        const { message } = err;

        log(LOG_MESSAGES.error, message);

        bot.sendMessage(chatId, message.includes("session token may have expired")
            ? CHAT_MESSAGES.expiredToken
            : CHAT_MESSAGES.unknownError
        )
    }
}
