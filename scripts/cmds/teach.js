const axios = require("axios");

module.exports = {
  config: {
    name: "teach",
    version: "1.0.0",
    author: "LIKHON AHMED",
    cooldowns: 3,
    role: 0,
    category: "chat",
    description: "Teach the bot new responses",
    usages: "Use : /teach [question] | [answer]"
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      const input = args.join(" ");
      if (!input.includes("|")) {
        return message.reply("⚠ Usage: teach [question] | [answer]");
      }

      const [ask, ans] = input.split("|").map(s => s.trim());
      if (!ask || !ans) {
        return message.reply("⚠ You must provide both a question and an answer.");
      }

      const url = `http://65.109.80.126:20392/sim?type=teach&ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`;
      const res = await axios.get(url);

      if (res.data) {
        return message.reply(`✅ Learned!\n\n❓ ${ask}\n➡ ${ans}`);
      } else {
        return message.reply("❌ Failed to teach.");
      }
    } catch (err) {
      console.error(err);
      return message.reply("❌ Error teaching the bot.");
    }
  }
};
