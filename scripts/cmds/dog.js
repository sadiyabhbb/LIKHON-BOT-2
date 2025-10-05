// commands/dog.js

const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

const VIP_FILE = path.join(__dirname, "vip.json");

module.exports = {
  config: {
    name: "dog",
    version: "1.2.0",
    author: "Kakashi + VIP Lock",
    countDown: 5,
    role: 0,
    shortDescription: "Turns someone into a dog (VIP only)",
    longDescription: "Puts the tagged/replied user's face on a dog template, VIP users only.",
    category: "fun",
    guide: {
      en: "{pn} @mention or reply"
    }
  },

  langs: {
    en: {
      noTag: "🐶 You must tag or reply to someone to dogify them!",
      notVip: "❌ | You are not a VIP user. Type !vip to see how to get VIP access."
    }
  },

  onStart: async function ({ event, message, api, getLang }) {
    try {
      // === VIP check ===
      let vipDB = [];
      if (fs.existsSync(VIP_FILE)) {
        try {
          vipDB = JSON.parse(fs.readFileSync(VIP_FILE));
        } catch {
          vipDB = [];
        }
      }

      const senderID = event.senderID;
      const isVip = vipDB.some(
        user =>
          user.uid === senderID &&
          (user.expire === 0 || user.expire > Date.now())
      );

      if (!isVip) return message.reply(getLang("notVip"));
      // =================

      let targetID = Object.keys(event.mentions || {})[0];
      if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
      }
      if (!targetID) return message.reply(getLang("noTag"));

      const baseFolder = path.join(__dirname, "DOG_RESOURCES");
      const bgPath = path.join(baseFolder, "dog.png");
      const avatarPath = path.join(baseFolder, `avatar_${targetID}.png`);
      const outputPath = path.join(baseFolder, `dog_result_${targetID}.png`);

      if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder);

      // Download dog template if missing
      if (!fs.existsSync(bgPath)) {
        const url =
          "https://raw.githubusercontent.com/kakashiNN/FUNNY-PHOTOS-/main/Dog2.jpeg";
        const res = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(bgPath, res.data);
      }

      // Download avatar
      const avatarBuffer = (
        await axios.get(
          `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;
      fs.writeFileSync(avatarPath, avatarBuffer);

      const bg = await jimp.read(bgPath);
      const avatar = await jimp.read(avatarPath);
      avatar.resize(200, 200).circle();

      // Place avatar on dog's head
      const x = 280;
      const y = 400;
      bg.composite(avatar, x, y);

      await bg.writeAsync(outputPath);

      const userInfo = await api.getUserInfo(targetID);
      const name = userInfo[targetID]?.name || "Someone";

      await message.reply(
        {
          body: `🤣 ${name} এখন একেবারে আসল কুকুর! 🐶`,
          mentions: [{ tag: name, id: targetID }],
          attachment: fs.createReadStream(outputPath)
        },
        () => {
          fs.unlinkSync(avatarPath);
          fs.unlinkSync(outputPath);
        }
      );
    } catch (err) {
      console.error("🐶 Dog command error:", err);
      return message.reply("❌ Error while turning into dog.");
    }
  }
};
