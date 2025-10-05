const axios = require("axios");

module.exports = {
  config: {
    name: "ck",
    aliases: ["api", "testapi"],
    version: "3.0",
    author: "LIKHON AHMED",
    countDown: 5,
    role: 0,
    shortDescription: "Test API by just giving the link",
    longDescription: "Provide only the API link, bot auto detects GET/POST and returns response",
    category: "utility",
    guide: {
      en: "Usage:\n/apitest <api-link>\nBot will auto detect GET or POST based on presence of body."
    }
  },

  onStart: async function ({ api, event, args }) {
    if (!args[0]) return api.sendMessage(" Usage: /apitest <api-link>", event.threadID, event.messageID);

    const url = args[0];

    try {
      let method = "get";
      let data = null;

      if (args.length > 1) {
        try {
          data = JSON.parse(args.slice(1).join(" "));
          method = "post";
        } catch (err) {
          data = null;
          method = "get";
        }
      }

      const res = await axios({ method, url, data });

      let output = JSON.stringify(res.data, null, 2);
      if (output.length > 1500) output = output.slice(0, 1500) + "\n...output truncated...";

      
      return api.sendMessage(output, event.threadID, event.messageID);

    } catch (err) {
      let errMsg = err.response?.data || err.message;
      if (typeof errMsg !== "string") errMsg = JSON.stringify(errMsg, null, 2);
      if (errMsg.length > 1500) errMsg = errMsg.slice(0, 1500) + "\n...output truncated...";

      return api.sendMessage(errMsg, event.threadID, event.messageID);
    }
  }
};
