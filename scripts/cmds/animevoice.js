const axios = require("axios");

module.exports = {
  config: {
    name: "animevoice",
    aliases: ["avoice"],
    version: "1.2",
    author: "LIKHON AHMED",
    role: 0,
    shortDescription: {
      en: "Generate anime voice from prompt"
    },
    longDescription: {
      en: "Generate anime-style voice using noobs-api"
    },
    category: "voice",
    guide: {
      en: "{p}avoice <text>"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      if (args.length === 0) {
        return api.sendMessage(
          "⚠ Please provide some text.\nExample: /avoice hello",
          event.threadID,
          event.messageID
        );
      }

      const prompt = encodeURIComponent(args.join(" "));
      const url = `https://www.noobs-api.rf.gd/dipto/animevoice?prompt=${prompt}`;

      
      api.setMessageReaction("🐣", event.messageID, () => {}, true);

      
      await api.sendMessage(
        {
          body: ` `,
          attachment: await global.utils.getStreamFromURL(url)
        },
        event.threadID,
        event.messageID
      );

      
      api.setMessageReaction("☑", event.messageID, () => {}, true);

    } catch (error) {
      console.error(error);
      api.sendMessage("❌ Failed to generate anime voice.", event.threadID, event.messageID);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
