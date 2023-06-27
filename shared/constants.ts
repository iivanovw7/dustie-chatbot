export const THROTTLE_DELAY = 4000;

export const LOG_MESSAGES = {
    startup: "🔮 Bot started...",
    editMessageError: "⛔️ Edit message error:",
    tokenError: "⛔️ TOKEN and OPENAI_API_KEY must be set",
    telegramError: "⛔️ Telegram API error:",
    reset: "🔄 Conversation has been reset",
    response: "📨 Response:",
    error: "⛔️ ChatGPT API error:",
    from: (chatId: string) => `📩 Message from ${chatId}:`
}

export const CHAT_MESSAGES = {
    startup: "Bot started...",
    reset: "🔄 Conversation has been reset, enjoy!",
    help: (chatId: string) => `🤖 This is a chatbot powered by ChatGPT. You can use the following commands:\n\n chat id: ${chatId} \n\n/reload - Reset the conversation\n/help - Show this message`,
    chatGptError: "⛔️ ChatGPT API error:",
    typing: "typing...",
    thinking: "thinking...",
    expiredToken: "🔑 Token has expired, please update the token.",
    unknownError: "🤖 Sorry, I'm having trouble connecting to the server, please try again later.",
    wrongChatId: "Wrong chat id"
}

export const Commands = {
    START: '/start',
    TEST: '/test',
    RELOAD: '/reload',
    RESET: '/reset',
    HELP: '/help'
}

export type Commands = typeof Commands[keyof typeof Commands];

export const CONTROLS = {
    reply_markup: JSON.stringify({
        keyboard: [
            [{ text: Commands.START }],
            [{ text: Commands.TEST }],
            [{ text: Commands.RELOAD }],
            [{ text: Commands.HELP }],
        ]
    })
};

