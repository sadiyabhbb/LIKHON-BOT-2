const jimp = require("jimp");
const fs = require("fs");

module.exports = {
  config: {
    name: "crush",
    aliases: [],
    version: "1.3",
    author: "Fixed by LIKHON AHMED",
    countDown: 5,
    role: 0,
    shortDescription: "Happy 😉",
    longDescription: "Wholesome avatar for crush/lover",
    category: "love",
    guide: "/crush @tag or reply to a message"
  },

  onStart: async function ({ message, event, api }) {
    let uid, name;

    
    if (event.mentions && Object.keys(event.mentions).length > 0) {
      uid = Object.keys(event.mentions)[0];
      name = event.mentions[uid];
    } 
    
    else if (event.type === "message_reply" && event.messageReply) {
      uid = event.messageReply.senderID;
      name = event.messageReply.senderName || "Unknown";
    } 
    else {
      return message.reply("❌ Please tag someone or reply to their message!");
    }

    try {
      const imagePath = await createCrushImage(uid);
      await message.reply({
        body: `「Is that true? 🥰❤」\nTag: ${name}\nUID: ${uid}`,
        attachment: fs.createReadStream(imagePath)
      });

      fs.unlinkSync(imagePath); // Send করার পরে file remove
    } catch (error) {
      console.error("Error while running command:", error);
      await message.reply("❌ An error occurred while creating the image.");
    }
  }
};

async function createCrushImage(uid) {
  const ACCESS_TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662"; // Token বসাও এখানে


  const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=${ACCESS_TOKEN}`;
  const avatar = await jimp.read(avatarUrl);

  
  const base = await jimp.read("https://i.imgur.com/BnWiVXT.jpg");
  base.resize(512, 512);

  
  base.composite(avatar.resize(173, 173), 70, 186);

  const cacheDir = __dirname + "/cache";
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  const imagePath = `${cacheDir}/crush_wholesome.png`;
  await base.writeAsync(imagePath);
  return imagePath;
}
