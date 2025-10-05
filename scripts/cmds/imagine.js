const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "imagine",
    aliases: ["img", "gen", "im"],
    version: "1.0",
    author: "LIKHON AHMED",
    countDown: 5,
    role: 0,
    description: "Generate image from prompt using Mahabub imagine API",
    category: "AI",
    guide: "{p}imagine <prompt>\nYou can also reply to a message that contains the prompt and use the command."
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      
      let prompt = args.join(" ").trim();
      if ((!prompt || prompt.length === 0) && event.messageReply && event.messageReply.body) {
        prompt = event.messageReply.body.trim();
      }

      if (!prompt) {
        return message.reply("❌ Ues: /imagine <prompt>");
      }

      
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      
      try { api.setMessageReaction("⏳", event.messageID, () => {}, true); } catch (e) { /* ignore */ }

     
      const apiUrl = `https://mahabub-imagine-api.vercel.app/api/gen`;
      const res = await axios.get(apiUrl, {
        params: { prompt },
        responseType: "arraybuffer",
        timeout: 60000
      });

      
      const contentType = (res.headers["content-type"] || "").toLowerCase();

      let filePath;
      if (contentType.includes("application/json")) {
        
        const jsonText = Buffer.from(res.data).toString("utf8");
        let json;
        try { json = JSON.parse(jsonText); } catch (err) { json = null; }

        
        let imageData = json?.image || json?.image_url || json?.data || json?.image_data || json?.result;
        if (!imageData) {
          // if json contains message/string url
          if (typeof json === "string") imageData = json;
        }

        if (!imageData) {
          // can't find image
          try { api.setMessageReaction("❌", event.messageID, () => {}, true); } catch (e) {}
          return message.reply("❌ API returned JSON but no image data/url found.");
        }

        
        if (typeof imageData === "string" && imageData.startsWith("data:image")) {
          const base64 = imageData.replace(/^data:image\/\w+;base64,/, "");
          filePath = path.join(cacheDir, `imagine_${Date.now()}.png`);
          fs.writeFileSync(filePath, Buffer.from(base64, "base64"));
        }
        // if imageData looks like a url -> fetch it
        else if (typeof imageData === "string" && /^https?:\/\//i.test(imageData)) {
          const down = await axios.get(imageData, { responseType: "arraybuffer", timeout: 60000 });
          const ext = (down.headers["content-type"] || "").includes("png") ? "png" : "jpg";
          filePath = path.join(cacheDir, `imagine_${Date.now()}.${ext}`);
          fs.writeFileSync(filePath, Buffer.from(down.data));
        } else {
          
          try { api.setMessageReaction("❌", event.messageID, () => {}, true); } catch (e) {}
          return message.reply("❌ Unexpected image data format from API.");
        }
      } else if (contentType.startsWith("image/")) {
        
        const ext = contentType.split("/")[1].split(";")[0] || "png";
        filePath = path.join(cacheDir, `imagine_${Date.now()}.${ext}`);
        fs.writeFileSync(filePath, Buffer.from(res.data));
      } else {
        
        const txt = Buffer.from(res.data).toString("utf8");
        
        const urlMatch = txt.match(/https?:\/\/\S+/);
        if (urlMatch) {
          const down = await axios.get(urlMatch[0], { responseType: "arraybuffer", timeout: 60000 });
          const ext = (down.headers["content-type"] || "").includes("png") ? "png" : "jpg";
          filePath = path.join(cacheDir, `imagine_${Date.now()}.${ext}`);
          fs.writeFileSync(filePath, Buffer.from(down.data));
        } else {
          try { api.setMessageReaction("❌", event.messageID, () => {}, true); } catch (e) {}
          return message.reply("❌ API returned unsupported response.");
        }
      }

      
      try { api.setMessageReaction("✅", event.messageID, () => {}, true); } catch (e) {}
      await message.reply(
        {
          body: `✅ Generated: ${prompt}`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => {
          
          try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {}
        },
        event.messageID
      );
    } catch (err) {
      console.error("imagine.js error:", err && err.message ? err.message : err);
      try { api.setMessageReaction("❌", event.messageID, () => {}, true); } catch (e) {}
      return message.reply("❌ Failed to generate image.");
    }
  }
};
