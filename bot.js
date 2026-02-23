const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.status(200).send('IT Helpdesk Bot is running');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Web server ready');
});

// ===== Discord Bot =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});


client.on('ready', () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const text = message.content.trim();

const match = text.match(/^IT\d{2}-\d{3}$/i);

if (match) {

const res = await axios.post(process.env.GAS_WEBHOOK, {
  source: "discord",
  message: text,
  admin: message.author.username
});
  
let raw = res.data;
console.log("RAW RESPONSE:", raw);

let result;

// ถ้า GAS ส่งกลับมาเป็น string
if (typeof raw === "string") {
  try {
    raw = JSON.parse(raw);
  } catch (e) {
    console.log("JSON parse error");
  }
}

result = raw?.result?.toString().trim().toUpperCase();

console.log("FINAL RESULT:", result);

  if (result === "ACCEPTED") {
    await message.reply(`✅ ${text}\nสถานะ: กำลังดำเนินการ`);
  }

  else if (result === "CLOSED") {
    await message.reply(`✅ ${text}\nสถานะ: เสร็จสิ้น`);
  }

  else if (result === "ALREADY_DONE") {
    await message.reply(`⚠️ ${text}\nเคสนี้ปิดเรียบร้อยแล้ว`);
  }

  else if (result === "NOT_FOUND") {
    await message.reply(`❌ ไม่พบ Ticket นี้`);
  }

  else {
    await message.reply(`⚠️ ไม่สามารถอัปเดตสถานะได้`);
  }
}


});

// ===== LOGIN =====
console.log("Starting Discord login...");
console.log("BOT_TOKEN exists:", !!process.env.BOT_TOKEN);

client.login(process.env.BOT_TOKEN)
  .then(() => console.log("LOGIN SUCCESS"))
  .catch(err => console.error("LOGIN ERROR:", err));
