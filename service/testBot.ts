// @deno-types="npm:@types/node-telegram-bot-api@0.61.6";
import TelegramBot from "npm:node-telegram-bot-api@0.61.0";

import { CHAT_MESSAGES, TelegramActions } from "../shared/constants.ts";

export const testBot = async (msg: TelegramBot.Message, bot: TelegramBot) => {
    const {
        chat: {
            id: chatId,
        },
        message_id: messageId,
    } = msg;

    const respMsg = await bot.sendMessage(chatId, CHAT_MESSAGES.thinking, {
        reply_to_message_id: messageId,
    });

    bot.sendChatAction(chatId, TelegramActions.TYPING);

    const fetchJoke = await fetch('https://api.chucknorris.io/jokes/random');
    const result = await fetchJoke.json();

    await bot.editMessageText(result.value, {
        chat_id: chatId,
        message_id: respMsg.message_id,
    });

    return true;
}
