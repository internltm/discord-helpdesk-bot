const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

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

  if (/^(รับ|ปิด)\s+IT\d{2}-\d{3}$/i.test(text)) {

    try {
      await axios.post(process.env.GAS_WEBHOOK, {
        source: "discord",
        message: text,
        admin: message.author.username
      });

      await message.reply("อัปเดตสถานะเรียบร้อย ✅");

    } catch (err) {
      await message.reply("เกิดข้อผิดพลาด ❌");
    }
  }
});

client.login(process.env.BOT_TOKEN);
