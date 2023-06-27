// deno-lint-ignore no-explicit-any
export const log = (...args: any) => {
    console.log(new Date().toLocaleString(), ...args)
}

export const isBotNameMessage = (botName: string, messageText = "") => {
    return messageText.startsWith(`@${botName}`);
}

export const trimMessage = (botName: string, messageText = "") => {
    return messageText.replace(`@${botName}`, "").trim()
}
