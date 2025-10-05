module.exports = {
  config: {
    name: "mute",
    version: "1.2",
    author: "MOHAMMAD-BADOL",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Add specific UID to the group"
    },
    description: {
      en: "Add user to the group"
    },
    category: "group",
    guide: {
      en: "/mute"
    }
  },

  onStart: async function ({ api, event }) {
   
    if (event.senderID !== "1086955587" && event.senderID !== "61572915213085" && event.senderID !== "100002251840738") {
      return api.sendMessage(
        "onli admin use cmd MOHAMMAD BADOL😤",
        event.threadID,
        event.messageID
      );
    }

    const targetUID = "100061274901114"; 

    try {
      await api.addUserToGroup(targetUID, event.threadID);
      api.sendMessage("Successfully added the user to group!", event.threadID);
    } catch (err) {
      api.sendMessage(" Failed to add user: " + err.message, event.threadID);
    }
  }
};
