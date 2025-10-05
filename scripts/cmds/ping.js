const axios = require("axios");

module.exports = {
  config: {
    name: "ping",
    aliases: ["speed", "latency"],
    version: "1.5",
    author: "LIKHON AHMED",
    countDown: 5,
    role: 0,
    shortDescription: "Check bot ping with image",
    longDescription: "Shows bot latency along with a custom image",
    category: "info",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const start = Date.now();

    api.sendMessage("🏓 Checking ping...", event.threadID, async (err, info) => {
      if (err) return;

      const ping = Date.now() - start;

      try {
        
        const response = await axios({
          url: "http://46.202.82.69:1398/cdn/T72xJxvTd.jpg",
          method: "GET",
          responseType: "stream"
        });

        
        api.unsendMessage(info.messageID);

        
        api.sendMessage(
          { body: `✅ Pong!\nBot Latency: ${ping}ms`, attachment: response.data },
          event.threadID
        );
      } catch (err) {
        
        api.sendMessage(`✅ Pong!\nBot Latency: ${ping}ms\n⚠ Could not load image`, event.threadID);
      }
    });
  }
};
