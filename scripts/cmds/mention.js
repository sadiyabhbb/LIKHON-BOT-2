const fs = require("fs-extra");

module.exports = {
  config: {
    name: "badol",
    version: "1.0",
    author: "MOHAMMAD-BADOL",
    countDown: 5,
    role: 0,
    shortDescription: "Admin mention reply",
    longDescription: "Replies when specific users are mentioned",
    category: "fun",
    guide: {
      en: "{p}badol"
    }
  },

  onStart: async function () {
    
  },

  onChat: async function ({ api, event, usersData }) {
    const moment = require("moment-timezone");
    const time = moment.tz("Asia/Dhaka").format("HH:mm:ss");

    console.log(`🔁 [badol.js] Triggered at ${time} by: ${event.senderID}`);

    const { threadID, messageID, mentions, senderID } = event;

    const targetMentions = ["1086955587", "61572915213085"]; 

    const mentionedIDs = Object.keys(mentions || {});
    const isMentioned = targetMentions.some(id => mentionedIDs.includes(id));

    if (!isMentioned) return;

    
    if (!global.badolCooldown) global.badolCooldown = new Set();

    if (global.badolCooldown.has(threadID)) {
      console.log("⛔ Cooldown active, skipping reply.");
      return;
    }

    
    global.badolCooldown.add(threadID);
    setTimeout(() => global.badolCooldown.delete(threadID), 5000);

    const userData = await usersData.get(senderID);
    const name = userData?.name || "বন্ধু";

    const messages = [
      "Mantion_দিস না _বাদল চৌধুরী এর মন মন ভালো নেই আস্কে-!💔🥀",
      "- আমার সাথে কেউ সেক্স করে না থুক্কু টেক্স করে নাহ🫂💔",
      "আমার একটা প্রিয়র খুব দরকার কারন আমার চোখে পানি আসার আগে নাকে সর্দি চলে আসে🤣🤣",
      "এত মেনশন না দিয়ে বক্স আসো হট করে দিবো🤷‍ঝাং 😘🥒",
      "Mantion_দিলে চুম্মাইয়া ঠুটের কালার change কইরা,লামু 💋😾😾🔨",
      "এতু ইমুশানাল কথা বলো তল দেশ দিয়ে অজরে বৃষ্টি হচ্ছে আমার 😭😭",
      "বাদল চৌধুরী এখন বিজি জা বলার আমাকে বলতে পারেন_!!😼🥰",
      "এতো মিনশন নাহ দিয়া সিংগেল বাদল চৌধুরী রে একটা গফ দে 😒 😏",
      "Mantion_না দিয়ে সিরিয়াস প্রেম করতে চাইলে ইনবক্স",
      "মেনশন দিসনা পারলে একটা গফ দে",
      "Mantion_দিস না বাঁলপাঁক্না বাদল চৌধুরী প্রচুর বিজি 🥵🥀🤐",
      "চুমু খাওয়ার বয়স টা  চকলেট🍫খেয়ে উড়িয়ে দিলাম🤗"
    ];

    const images = [
      "https://drive.google.com/uc?export=view&id=1KCBrBYAY3fV-XL62VMJni2h2r4bcckVF"
    ];

    const msg = {
      body: `𝐇𝐞𝐲 ${name}\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n${messages[Math.floor(Math.random() * messages.length)]}\n\n▬▬▬▬▬▬▬▬▬▬▬▬`,
      attachment: await global.utils.getStreamFromURL(images[Math.floor(Math.random() * images.length)])
    };

    return api.sendMessage(msg, threadID, messageID);
  }
};
