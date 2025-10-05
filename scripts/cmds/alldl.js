const axios = require("axios");
const fs = require("fs-extra");

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`
  );
  return base.data.api;
};

module.exports = {
  config: {
    name: "alldl",
    version: "1.0.6",
    author: "Dipto",
    countDown: 2,
    role: 0,
    description: {
      en: "Download videos from TikTok, Facebook, Instagram, YouTube, and more",
    },
    category: "MEDIA",
    guide: {
      en: "[video_link]",
    },
  },
  onStart: async function ({ api, args, event }) {
    const videoLink = event.messageReply?.body || args[0];
    if (!videoLink) {
      return api.setMessageReaction("❌", event.messageID, () => {}, true);
    }

    api.setMessageReaction("🐥", event.messageID, () => {}, true);

    try {
      const { data } = await axios.get(
        `${await baseApiUrl()}/alldl?url=${encodeURIComponent(videoLink)}`
      );

      const cacheDir = __dirname + "/cache";
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const filePath = cacheDir + "/vid.mp4";
      const vidData = (await axios.get(data.result, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(filePath, Buffer.from(vidData, "utf-8"));

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      api.sendMessage(
        { attachment: fs.createReadStream(filePath) },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );

      // Special case for direct Imgur links
      if (videoLink.startsWith("https://i.imgur.com")) {
        const ext = videoLink.substring(videoLink.lastIndexOf("."));
        const imgPath = cacheDir + `/img${ext}`;
        const response = await axios.get(videoLink, { responseType: "arraybuffer" });
        fs.writeFileSync(imgPath, Buffer.from(response.data, "binary"));
        api.sendMessage(
          { attachment: fs.createReadStream(imgPath) },
          event.threadID,
          () => fs.unlinkSync(imgPath),
          event.messageID
        );
      }
    } catch (error) {
      api.setMessageReaction("❎", event.messageID, () => {}, true);
    }
  },
};
