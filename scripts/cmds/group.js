const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "group",
    aliases: ["grp"],
    version: "1.1",
    author: "LIKHON AHMED",
    countDown: 5,
    role: 1, 
    description: "Group Manage",
    category: "group",
    guide: {
      en: "{pn} info\n{pn} list\n{pn} emoji 🐥\n{pn} pp (reply image)\n{pn} name (new group name)"
    }
  },

  onStart: async function ({ message, args, event, api }) {
    const threadID = event.threadID;

    if (!args[0]) return message.reply("uses: info | list | emoji | pp | name");

    // --------- Group Info ---------
    if (args[0].toLowerCase() === "info") {
      try {
        const info = await api.getThreadInfo(threadID);

        const groupName = info.threadName || "Unnamed Group";
        const groupID = threadID;
        const memberCount = info.participantIDs.length;
        const adminIDs = info.adminIDs.map(a => a.id).join(", ");
        const emoji = info.emoji || "❌";
        const approvalMode = info.approvalMode ? "✅ On" : "❌ Off";
        const messageCount = info.messageCount || 0;

        let imgPath = null;
        if (info.imageSrc) {
          const img = await axios.get(info.imageSrc, { responseType: "arraybuffer" });
          imgPath = path.join(__dirname, "cache", `group_${threadID}.png`);
          fs.writeFileSync(imgPath, Buffer.from(img.data, "binary"));
        }

        let msg = `📌 Group Info
──────────────────
👥 Name: ${groupName}
🆔 ID: ${groupID}
👤 Members: ${memberCount}
👑 Admins: ${adminIDs}
😀 Emoji: ${emoji}
📝 Message Count: ${messageCount}
✔ Approval: ${approvalMode}`;

        if (imgPath) {
          return message.reply({ body: msg, attachment: fs.createReadStream(imgPath) });
        } else {
          return message.reply(msg);
        }
      } catch (e) {
        return message.reply("❌ Group info ");
      }
    }

    
    if (args[0].toLowerCase() === "list") {
      try {
        const allThreads = await api.getThreadList(100, null, ["INBOX"]);
        const groupThreads = allThreads.filter(t => t.isGroup);

        let msg = `📌 Bot Groups (${groupThreads.length})\n──────────────────\n`;
        groupThreads.forEach((g, i) => {
          msg += `${i + 1}. ${g.name || "Unnamed"} | ${g.threadID} | 👤 ${g.participantIDs.length}\n`;
        });

        return message.reply(msg);
      } catch (e) {
        return message.reply("");
      }
    }

    
    if (args[0].toLowerCase() === "emoji") {
      const emoji = args[1];
      if (!emoji) return message.reply("❌ no emoji !");
      try {
        await api.changeThreadEmoji(emoji, threadID);
        return message.reply(``);
      } catch (e) {
        return message.reply("");
      }
    }

    
    if (args[0].toLowerCase() === "pp") {
      if (event.type !== "message_reply" || !event.messageReply.attachments[0]) {
        return message.reply("❌ reply on photo!");
      }
      const photo = event.messageReply.attachments[0].url;
      try {
        const img = await axios.get(photo, { responseType: "stream" });
        await api.changeGroupImage(img.data, threadID);
        return message.reply("");
      } catch (e) {
        return message.reply("");
      }
    }

    
    if (args[0].toLowerCase() === "name") {
      const newName = args.slice(1).join(" ");
      if (!newName) return message.reply("");
      try {
        await api.setTitle(newName, threadID);
        return message.reply(``);
      } catch (e) {
        return message.reply("");
      }
    }
  }
};
