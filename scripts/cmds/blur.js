const a = require("axios");

const u = "http://65.109.80.126:20409/aryan/blur";

module.exports = {
  config: {
    name: "blur",
    aliases: ["imageblur"],
    version: "1.0.8",
    role: 0,
    author: "ArYAN",
    countDown: 10,
    longDescription: "Blur images to hide details.",
    category: "image",
    guide: {
      en: "{pn} reply to an image to blur it"
    }
  },

  onStart: async function ({ message, event, api }) {
    try {
      if (
        !event.messageReply ||
        !event.messageReply.attachments ||
        !event.messageReply.attachments[0] ||
        event.messageReply.attachments[0].type !== "photo"
      ) {
        return message.reply("📸 Please reply to an image to blur it.");
      }

      const imageUrl = event.messageReply.attachments[0].url;

      api.setMessageReaction("⏰", event.messageID, () => {}, true);

      const response = await a.get(`${u}?image=${encodeURIComponent(imageUrl)}`, { responseType: "stream" });

      await message.reply({
        body: "✅ Here is your blurred image!",
        attachment: response.data
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (e) {
      message.reply("❌ Failed to blur the image. Please try again later.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
