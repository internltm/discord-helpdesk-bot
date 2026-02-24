const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('IT Helpdesk Bot is running');
});

let isReady = false;

app.get("/health", (req, res) => {
  if (isReady) {
    res.status(200).send("OK");
  } else {
    res.status(500).send("Bot not ready");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Web server ready');
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

/* 🔥 แล้วค่อยใช้ client */
client.on("clientReady", () => {
  isReady = true;
  console.log(`Bot logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const text = message.content.trim();
  const match = text.match(/^IT\d{2}-\d{4}$/i);
  if (!match) return;

  try {
    const res = await axios.post(process.env.GAS_WEBHOOK, {
      source: "discord",
      message: text,
      admin: message.author.username
    });

    let raw = res.data;
    if (typeof raw === "string") {
      try { raw = JSON.parse(raw); } catch {}
    }

    const result = raw?.result?.toString().trim().toUpperCase();

    if (result === "ACCEPTED")
      await message.reply(`✅ ${text}\nสถานะ: กำลังดำเนินการ`);
    else if (result === "CLOSED")
      await message.reply(`✅ ${text}\nสถานะ: เสร็จสิ้น`);
    else if (result === "ALREADY_DONE")
      await message.reply(`⚠️ ${text}\nเคสนี้ปิดเรียบร้อยแล้ว`);
    else if (result === "NOT_FOUND")
      await message.reply(`❌ ไม่พบ Ticket นี้`);
    else
      await message.reply(`⚠️ ไม่สามารถอัปเดตสถานะได้`);

  } catch (err) {
    console.error("GAS ERROR:", err);
    await message.reply("❌ ติดต่อระบบไม่ได้");
  }
});

console.log("TOKEN LENGTH:", process.env.BOT_TOKEN?.length);

client.login(process.env.BOT_TOKEN)
  .then(() => console.log("LOGIN SUCCESS"))
  .catch(err => console.error("LOGIN ERROR:", err));
