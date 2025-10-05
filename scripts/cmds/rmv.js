module.exports = {
  config: {
    name: "rmv",
    version: "1.0",
    author: "MOHAMMAD-BADOL",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Remove a member from any group"
    },
    description: {
      en: "Remove target member from given group UID"
    },
    category: "group",
    guide: {
      en: "/rmv <groupUID> <memberUID>"
    }
  },

  onStart: async function ({ api, event, args }) {
    
    if (event.senderID !== "1086955587" && event.senderID !== "61572915213085") {
      return api.sendMessage(
        "onli admin use cmd MOHAMMAD BADOL😤",
        event.threadID,
        event.messageID
      );
    }

    if (args.length < 2) {
      return api.sendMessage(
        "⚠ Usage: /rmv <groupUID> <memberUID>",
        event.threadID,
        event.messageID
      );
    }

    const groupUID = args[0];
    const memberUID = args[1];

    try {
      await api.removeUserFromGroup(memberUID, groupUID);
      api.sendMessage(
        `✅ Successfully removed member ${memberUID} from group ${groupUID}`,
        event.threadID
      );
    } catch (err) {
      api.sendMessage(
        `❌ Failed to remove user: ${err.message}`,
        event.threadID
      );
    }
  }
};
