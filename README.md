#### Environment variables

Stored inside `.env` file in the root folder.
```dotenv
TOKEN=XXX
OPENAI_API_KEY=XXX
CHAT_ID=9999
CHAT_ID_VERIFICATION=true
```

#### Installation

```bash
pacman -Sy deno
# or
cd /tmp
curl -Lo "deno.zip" "https://github.com/denoland/deno/releases/latest/download/deno-x86_64-unknown-linux-gnu.zip"

sudo apt update
sudo apt install unzip

sudo unzip -d /usr/local/bin /tmp/deno.zip
ls -al /usr/local/bin/deno
# example output: -rwxr-xr-x 1 root root 87007232 Aug 23 21:06 /usr/local/bin/deno
deno --version
# example output: deno 1.13.2 (release, x86_64-unknown-linux-gnu)
```

#### Usage
```bash
deno cache --lock=lock.json chatbot.ts
deno run --allow-read --allow-env --allow-net chatbot.ts
```
