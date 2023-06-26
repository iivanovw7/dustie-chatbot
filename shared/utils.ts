// deno-lint-ignore no-explicit-any
export const log = (...args: any) => {
    console.log(new Date().toLocaleString(), ...args)
}
