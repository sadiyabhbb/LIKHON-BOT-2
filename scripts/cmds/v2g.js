const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const os = require("os");

module.exports = {
  config: {
    name: "v2g",
    version: "1.4",
    author: "LIKHON AHMED",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "convert video to GIF"
    },
    description: {
      en: "generate GIF from reply/attached video using ApyHub"
    },
    category: "utility",
    guide: {
      en: "v2g <reply_with_video_or_attach_video> [start_time_seconds] [duration_seconds] [size WxH]"
    }
  },

  langs: {
    en: {
      missing: "❌ please provide a video (attach or reply with video).",
      started: "⏳ Please wait, your GIF is being created...",
      success: "✅ GIF created successfully, sending the file.",
      fail: "❌ conversion failed: %1",
      invalid: "⚠ invalid input. start_time and duration must be numbers, size must be WIDTHxHEIGHT (eg. 400x300)."
    }
  },

  onStart: async function ({ api, args, message, event, getLang }) {
    const apyToken = "APY0dnpnVT7GKXSxgIyVFFDu579m7kG1PLy5u3SLXVSjRe150QcQZgQnUvQMjGdNxND01AcJsDShEb";
    const endpoint = "https://api.apyhub.com/generate/gif/file";

    const start_time = args[0];
    const duration = args[1];
    const size = args[2];

    if ((start_time && isNaN(Number(start_time))) || (duration && isNaN(Number(duration)))) {
      return message.reply(getLang("invalid"));
    }

    if (size && !/^\d+x\d+$/.test(size)) {
      return message.reply(getLang("invalid"));
    }

    try {
      let videoStream;
      let filename = `input-${Date.now()}.mp4`;

      let attachment = null;
      if (message && message.attachments && message.attachments.length > 0) {
        attachment = message.attachments[0];
      } else if (event && event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
        attachment = event.messageReply.attachments[0];
      } else if (event && event.message && event.message.attachments && event.message.attachments.length > 0) {
        attachment = event.message.attachments[0];
      }

      if (!attachment || !attachment.url) {
        return message.reply(getLang("missing"));
      }

      const resp = await axios.get(attachment.url, { responseType: "stream", timeout: 60000 });
      videoStream = resp.data;
      const ext = path.extname(attachment.filename || attachment.url) || ".mp4";
      filename = `input-${Date.now()}${ext}`;

      message.reply(getLang("started"));

      const tempVideoPath = path.join(os.tmpdir(), filename);
      const writer = fs.createWriteStream(tempVideoPath);
      await new Promise((resolve, reject) => {
        videoStream.pipe(writer);
        writer.on("error", reject);
        writer.on("finish", resolve);
      });

      const form = new FormData();
      form.append("video", fs.createReadStream(tempVideoPath));
      if (start_time) form.append("start_time", String(start_time));
      if (duration) form.append("duration", String(duration));
      if (size) form.append("size", String(size));

      const outputName = `v2g-${Date.now()}.gif`;
      const urlWithQuery = `${endpoint}?output=${encodeURIComponent(outputName)}`;
      const headers = Object.assign({}, form.getHeaders(), { "apy-token": apyToken });

      const apiResp = await axios.post(urlWithQuery, form, { headers, responseType: "arraybuffer", timeout: 120000 });

      if (!apiResp || !apiResp.data) {
        fs.unlinkSync(tempVideoPath);
        return message.reply(getLang("fail", "no data returned"));
      }

      const outPath = path.join(os.tmpdir(), outputName);
      fs.writeFileSync(outPath, Buffer.from(apiResp.data));

      await message.reply({ attachment: fs.createReadStream(outPath) });

      try {
        fs.unlinkSync(tempVideoPath);
        fs.unlinkSync(outPath);
      } catch (e) {}
    } catch (err) {
      console.error("Error in v2g:", err);
      message.reply(getLang("fail", err.message || err.toString()));
    }
  }
};
