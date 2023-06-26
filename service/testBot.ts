import { CHAT_MESSAGES } from "../shared/constants.ts";

export const testBot = async (msg: TelegramBot.Message, bot: TelegramBot) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, CHAT_MESSAGES.typing);

    const fetchJoke = await fetch('https://api.chucknorris.io/jokes/random');
    const result = await fetchJoke.json();

    bot.sendMessage(chatId, result.value);
}
