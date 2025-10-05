const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "emojimix",
        version: "1.1",
        author: "LIKHON AHMED",
        countDown: 5,
        role: 0,
        shortDescription: { en: "Combine two emojis into one image" },
        description: { en: "Generate an emojimix image from two emojis or codepoints" },
        category: "fun",
        guide: { en: "{pn} <emoji1> <emoji2> - Example: {pn} 🥹 😗" }
    },

    langs: {
        en: {
            missingArgs: " Please provide 2 emojis or codepoints to mix.\nExample: emojimix 🥹 😗",
            error: " Failed to fetch emojimix image",
            success: ""
        }
    },

    onStart: async function({ api, event, args, getLang }) {
        if (!args[0] || !args[1])
            return api.sendMessage(getLang("missingArgs"), event.threadID);

        const emoji1 = encodeURIComponent(args[0]);
        const emoji2 = encodeURIComponent(args[1]);
        const size = 128;
        const url = `https://emojik.vercel.app/s/${emoji1}_${emoji2}?size=${size}`;

        try {
            
            const res = await axios.get(url, { responseType: "arraybuffer" });
            const imageBuffer = Buffer.from(res.data, "binary");

            
            const filePath = path.join(__dirname, `emojimix_${Date.now()}.png`);
            fs.writeFileSync(filePath, imageBuffer);

            
            api.sendMessage({ body: getLang("success"), attachment: fs.createReadStream(filePath) }, event.threadID, () => {
                
                fs.unlinkSync(filePath);
            });
        } catch (err) {
            console.error(err);
            api.sendMessage(getLang("error"), event.threadID);
        }
    }
};
