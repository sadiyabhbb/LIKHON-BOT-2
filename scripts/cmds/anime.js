const axios = require("axios");

module.exports = {
  config: {
    name: "anime",
    aliases: ["ani"],
    version: "1.0",
    author: "‎MAHABUB + modified by NIROB",
    countDown: 10,
    role: 0,
    shortDescription: "anime videos",
    longDescription: "anime videos from mahabub",
    category: "user",
    guide: "{p}{n}rv",
  },

  onStart: async function ({ api, event, message }) {
    const senderID = event.senderID;

    // লোডিং মেসেজ পাঠানো
    const loadingMessage = await message.reply({
      body: `Loading random video... Please wait! (up to 5 sec)...
𝐍𝐨𝐰 𝐥𝐨𝐚𝐝𝐢𝐧𝐠. . .
█▒▒▒▒▒▒▒▒▒
███▒▒▒▒▒▒▒
█████▒▒▒▒▒
██████▒▒▒▒
████████▒▒
██████████`,
    });

    // JSON ফাইলের URL
    const jsonUrl = "https://raw.githubusercontent.com/nirob-kakashi66/anime_json/main/NIROB.json";

    try {
      // JSON ফাইল থেকে ডাটা নিয়ে আসা
      const response = await axios.get(jsonUrl);
      const data = response.data;

      if (!data.videos || data.videos.length === 0) {
        return message.reply("No videos available.");
      }

      // এলোমেলো একটি ভিডিও লিংক নির্বাচন
      const randomVideo = data.videos[Math.floor(Math.random() * data.videos.length)];

      // এলোমেলো একটি মেসেজ নির্বাচন (যদি থাকে)
      const randomMessage = data.messages && data.messages.length > 0
        ? data.messages[Math.floor(Math.random() * data.messages.length)]
        : "❰ ANIME VIDEO ❱"; // ডিফল্ট মেসেজ

      // ভিডিও পাঠানো
      message.reply({
        body: randomMessage,
        attachment: await global.utils.getStreamFromURL(randomVideo),
      });

    } catch (error) {
      console.error("Error fetching video links:", error);
      return message.reply("Failed to load video. Please try again later.");
    }
  }
};
