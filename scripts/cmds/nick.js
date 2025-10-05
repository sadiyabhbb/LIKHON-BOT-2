module.exports = {
  config: {
    name: "nick",
    version: "1.0",
    author: "AhMED",
    countDown: 5,
    role: 0,
    description: "Check a user's nickname in this group",
    category: "utility",
    guide: {
      en: "{pn} <userID | @tag>: Check nickname of a user in this group"
    }
  },

  onStart: async function ({ api, event, args, usersData, message }) {
    try {
      let targetId;

      // Check mentions
      if (Object.keys(event.mentions).length > 0) {
        targetId = Object.keys(event.mentions)[0];
      }
      // Check reply
      else if (event.messageReply) {
        targetId = event.messageReply.senderID;
      }
      // Otherwise use argument as ID
      else if (args[0]) {
        targetId = args[0];
      } else {
        return message.reply("❌ Please provide a userID, tag, or reply to a user's message.");
      }

      // Get fresh thread info
      const threadInfo = await api.getThreadInfo(event.threadID, { force: true });
      const nicknames = threadInfo.nicknames || {};
      const nickname = nicknames[targetId] || "(No nickname set)";

      // Get user's actual name
      const name = await usersData.getName(targetId);

      return message.reply(`🐥_Nickname:\n\n ${nickname}`);

    } catch (error) {
      console.error(error);
      return message.reply("❌ Failed to fetch nickname. Maybe invalid ID or API issue.");
    }
  }
};
