export const THROTTLE_DELAY = 4000;

export const CHAT_GPT_MODEL = "gpt-3.5-turbo";

export const LOG_MESSAGES = {
    startup: "🔮 Bot started...",
    editMessageError: "⛔️ Edit message error:",
    tokenError: "⛔️ TOKEN and OPENAI_API_KEY must be set",
    telegramError: "⛔️ Telegram API error:",
    reset: "🔄 Conversation has been reset",
    response: "📨 Response:",
    error: "⛔️ ChatGPT API error:",
    chatGptError: "⛔️ ChatGPT API error:",
    from: (chatId: string) => `📩 Message from ${chatId}:`
}

export const CHAT_MESSAGES = {
    startup: "Bot started...",
    reset: "🔄 Conversation has been reset, enjoy!",
    help: (chatId: string, chatGptModel: string) => {
        return `🤖 This is a chatbot powered by ChatGPT. You can use the following commands:\n\n chat id: ${chatId} \n\n chat gpt model: ${chatGptModel} \n\n/reload - Reset the conversation\n/help - Show this message`
    },
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
    // deno-lint-ignore no-explicit-any
} as any;

export const TelegramActions = {
    TYPING: "typing"
} as const;

export type TelegramActions = typeof TelegramActions[keyof typeof TelegramActions];
