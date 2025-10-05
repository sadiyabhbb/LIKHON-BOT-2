const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const request = require("request");

module.exports.config = {
  name: "rosmalai",
  version: "1.0.0",
  permission: 2,
  credits: "LIKHON AHMED",
  description: "Random image from JSON",
  prefix: true,
  category: "user",
  usages: "",
  cooldowns: 5,
  dependencies: {}
};

module.exports.onStart = async function({ api, event }) {
  const jsonPath = path.join(__dirname, "assets_json/bdsex.json");
  
  if (!fs.existsSync(jsonPath)) {
    return api.sendMessage("Image JSON file not found!", event.threadID);
  }

  const links = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  if (!links.length) {
    return api.sendMessage("No image links found in JSON!", event.threadID);
  }

  const imageLink = links[Math.floor(Math.random() * links.length)];
  const cachePath = path.join(__dirname, "cache/1.jpg");

  request(encodeURI(imageLink))
    .pipe(fs.createWriteStream(cachePath))
    .on("close", () => {
      api.sendMessage({
        body: "লে বাড়া 🥵 গিয়ে copyright মার : ",
        attachment: fs.createReadStream(cachePath)
      }, event.threadID, () => fs.unlinkSync(cachePath));
    });
};
