const axios = require("axios");

module.exports = {
  config: {
    name: "sendtogroup",
    aliases: ["stg", "forwardgroup"],
    version: "3.0",
    author: "LIKHON AHMED",
    countDown: 5,
    role: 0,
    description:
      "Forward any replied message (text/photo/video/audio/voice/file) to a group. Replies on forwarded message will return to you.",
    category: "utility",
    guide: {
      en: "{pn} <groupID> [message]\nReply to a message (any type) or send custom text.",
    },
  },

  onStart: async function ({ api, event, message, args, usersData }) {
    try {
      const target = args[0];
      if (!target) return message.reply("❌ Usage: /stg <groupID> [message]");

      const customMessage = args.slice(1).join(" ");
      const senderName =
        (await usersData.getName(event.senderID)) || "Unknown";

      let body = `📤 Forwarded by ${senderName}`;
      if (customMessage) body += `\n💬 ${customMessage}`;

      let attachments = [];

      if (event.messageReply) {
        const reply = event.messageReply;

        
        if (reply.attachments?.length > 0) {
          for (const att of reply.attachments) {
            try {
              const res = await axios.get(att.url, { responseType: "stream" });

              
              let ext = "";
              if (att.type === "audio") ext = ".mp3";
              else if (att.type === "video") ext = ".mp4";
              else if (att.type === "photo") ext = ".png";
              else ext = ".dat";

              res.data.path = `file${ext}`;
              attachments.push(res.data);
            } catch (e) {
              console.error("Attachment fetch error:", e.message);
            }
          }
        }

        
        if (!reply.attachments?.length && reply.body) {
          body += `\n\n📝 Replied text:\n${reply.body}`;
        }
      }

      
      const sent = await api.sendMessage(
        { body, attachment: attachments },
        target
      );

      
      global.stgMap = global.stgMap || {};
      global.stgMap[sent.messageID] = {
        originalSender: event.senderID,
      };

      return message.reply("✅ Forwarded successfully.");
    } catch (err) {
      console.error("stg.js error:", err);
      return message.reply("❌ Failed to forward.");
    }
  },

  onReply: async function ({ api, event }) {
    try {
      if (
        !global.stgMap ||
        !global.stgMap[event.messageReply?.messageID]
      )
        return;

      const original = global.stgMap[event.messageReply.messageID];
      if (!original) return;

      let body = `↩ Reply from group:\n${event.body || ""}`;
      let attachments = [];

      if (event.attachments?.length > 0) {
        for (const att of event.attachments) {
          try {
            const res = await axios.get(att.url, { responseType: "stream" });

            let ext = "";
            if (att.type === "audio") ext = ".mp3";
            else if (att.type === "video") ext = ".mp4";
            else if (att.type === "photo") ext = ".png";
            else ext = ".dat";

            res.data.path = `reply${ext}`;
            attachments.push(res.data);
          } catch (e) {
            console.error("Reply attachment error:", e.message);
          }
        }
      }

      await api.sendMessage(
        { body, attachment: attachments },
        original.originalSender
      );
    } catch (e) {
      console.error("stg.js reply error:", e);
    }
  },
};
