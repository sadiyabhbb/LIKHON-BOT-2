const axios = require("axios");

module.exports = {
  config: {
    name: "sms",
    version: "1.3",
    author: "LIKHON AHMED",
    countDown: 5,
    role: 2,
    description: {
      en: "Send OTP SMS or check API status",
      bn: "OTP SMS Sending API Check"
    },
    category: "utility",
    guide: {
      en: "{pn} <number> <count>\n{pn} <apiname> <number> <count>",
      bn: "{pn} <number> <count>\n{pn} <apiname> <number> <count>"
    }
  },

  onStart: async function ({ message, args }) {
    if (args.length < 2) {
      return message.reply("Uses : /sms <number> <count> Or /sms <apiname> <number> <count>");
    }

    let url = "";
    let number = "";
    let count = 1;

    if (args.length === 2) {
      [number, count] = args;
      url = `https://update-bomb.onrender.com/ck?phone=${number}&count=${count}`;
    } else if (args.length === 3) {
      const [api, num, cnt] = args;
      number = num;
      count = cnt;
      url = `https://update-bomb.onrender.com/check?api=${api}&phone=${number}&count=${count}`;
    }

    try {
      await axios.get(url);

    
      const hideNumber = number.replace(/(\d{5})(\d{4})(\d?)/, (_, p1, p2, p3) => {
        return p1 + "****" + (p3 || "");
      });

    
      const output = `{
  "number": "${hideNumber}",

  "OTP": ${parseInt(count)},

  "author": "LIKHON AHMED"
}`;

      return message.reply(output);
    } catch (e) {
      return message.reply("⚠️ API call failed: " + e.message);
    }
  }
};
