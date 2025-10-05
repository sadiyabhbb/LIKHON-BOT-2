const axios = require("axios");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "catbox",
    aliases: ["cb", "cat"],
    version: "1.2",
    author: "LIKHON AHMED",
    countDown: 5,
    role: 0,
    shortDescription: "Upload file/image/video/audio to Catbox",
    longDescription: "Upload a file either by replying to it or using a direct URL and get the Catbox link",
    category: "utility",
    guide: {
      en: "{pn} (reply to a file/image OR provide a URL)"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      let fileUrl, filename;

      
      if (event.messageReply && event.messageReply.attachments?.length) {
        const file = event.messageReply.attachments[0];
        fileUrl = file.url;
        filename = file.filename || "upload";
      } 
      
      else if (args.length && args[0].startsWith("http")) {
        fileUrl = args[0];
        filename = fileUrl.split("/").pop().split("?")[0] || "upload";
      } 
      else {
        return api.sendMessage("❌ Please reply to a file or provide a direct URL to upload.", event.threadID, event.messageID);
      }

      
      const fileData = (await axios.get(fileUrl, { responseType: "arraybuffer" })).data;

      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("fileToUpload", Buffer.from(fileData, "binary"), { filename });

      const res = await axios.post("https://catbox.moe/user/api.php", form, { headers: form.getHeaders() });

      if (res.data.startsWith("http")) {
        return api.sendMessage(`${res.data}`, event.threadID, event.messageID);
      } else {
        return api.sendMessage(`⚠ Upload failed: ${res.data}`, event.threadID, event.messageID);
      }

    } catch (err) {
      return api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
    }
  }
};
