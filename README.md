## Telegram chatbot for openAI

Chatbot powered by ChatGPT

---

### Table of Contents

- [Environment variables](#environment)
- [Installation](#installation)
- [Usage](#usage)
- [Automation](#automation)

---

### Environment

Environment variables are stored inside `.env` file in the root folder.

```dotenv
TOKEN=XXX
OPENAI_API_KEY=XXX
CHAT_ID=9999
CHAT_ID_VERIFICATION=true
```

---

### Installation

Install [Deno](https://deno.land/).

```bash
# arch based
pacman -Sy deno
# or debian
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

---

### Usage
1. Setup environment.
2. Fill required `.env` data.
3. Cache dependencies.
4. Execute `chatbot`.

```bash
# Cache dependencies and check integrity
deno cache --lock=lock.json chatbot.ts
# Run chatbot
deno run --allow-read --allow-env --allow-net chatbot.ts
```

---

### Automation

Running with `pm2`.

```bash
pm2 start chatbot.ts --interpreter="deno" --interpreter-args="run -allow-read --allow-env --allow-net" --name "dustie-chatbot"
# or
pm2 start ./run.sh --name "dustie-chatbot"
```
