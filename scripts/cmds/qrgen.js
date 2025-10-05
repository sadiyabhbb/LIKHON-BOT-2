const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "qrgen",
    version: "1.3",
    author: "LIKHON AHMED",
    countDown: 5,
    role: 0,
    description: "Generate a CanaryTokens QR with email + memo",
    category: "utility",
    guide: {
      en: "{pn} <email> <memo>\nExample: {pn} user@example.com myMemo"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      const { threadID, messageID } = event;

      const email = args[0];
      const memo = args.slice(1).join(" ") || `memo_${Date.now()}`;

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return message.reply("❌ Use: /gen user@example.com memoText");
      }

      api.setMessageReaction("⌛", messageID, () => {}, true);

      // CanaryTokens API
      const endpoint = "https://canarytokens.org/d3aece8093b71007b5ccfedad91ebb11/generate";
      const form = new FormData();
      form.append("email", email);
      form.append("memo", memo);
      form.append("token_type", "qr_code");

      const resp = await axios.post(endpoint, form, { headers: form.getHeaders() });
      const data = resp.data;

      if (!data.qrcode_png) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return message.reply(`❌ API did not return QR. Response:\n${JSON.stringify(data, null, 2)}`);
      }

      // Convert base64 QR code to file
      const base64Data = data.qrcode_png.replace(/^data:image\/png;base64,/, "");
      const tmpDir = path.join(__dirname, "cache");
      await fs.ensureDir(tmpDir);
      const tmpPath = path.join(tmpDir, `qr_${Date.now()}.png`);
      fs.writeFileSync(tmpPath, Buffer.from(base64Data, "base64"));

      api.setMessageReaction("☑", messageID, () => {}, true);
      await api.sendMessage({
        body: ``,
        attachment: fs.createReadStream(tmpPath)
      }, threadID, messageID);

      setTimeout(() => fs.unlink(tmpPath).catch(() => {}), 5000);

    } catch (err) {
      console.error("gen.js error:", err?.response?.data || err.message);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply("❌ Failed to generate token.");
    }
  }
};
