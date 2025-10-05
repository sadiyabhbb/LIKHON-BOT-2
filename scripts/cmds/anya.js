const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const OWNER_ID = "100069254151118"; // ← Your UID
const CACHE_DIR = path.join(__dirname, "cache");
fs.ensureDirSync(CACHE_DIR);

// === Unicode bold converter ===
function toBoldUnicode(name) {
  const boldAlphabet = {
    "a": "𝐚","b": "𝐛","c": "𝐜","d": "𝐝","e": "𝐞","f": "𝐟","g": "𝐠","h": "𝐡","i": "𝐢","j": "𝐣",
    "k": "𝐤","l": "𝐥","m": "𝐦","n": "𝐧","o": "𝐨","p": "𝐩","q": "𝐪","r": "𝐫","s": "𝐬","t": "𝐭",
    "u": "𝐮","v": "𝐯","w": "𝐰","x": "𝐱","y": "𝐲","z": "𝐳",
    "A": "𝐀","B": "𝐁","C": "𝐂","D": "𝐃","E": "𝐄","F": "𝐅","G": "𝐆","H": "𝐇","I": "𝐈","J": "𝐉",
    "K": "𝐊","L": "𝐋","M": "𝐌","N": "𝐍","O": "𝐎","P": "𝐏","Q": "𝐐","R": "𝐑","S": "𝐒","T": "𝐓",
    "U": "𝐔","V": "𝐕","W": "𝐖","X": "𝐗","Y": "𝐘","Z": "𝐙",
    "0": "0","1": "1","2": "2","3": "3","4": "4","5": "5","6": "6","7": "7","8": "8","9": "9",
    " ": " ","'": "'",
    ",": ",",".": ".","-": "-","!": "!","?": "?"
  };
  return name.split("").map(ch => boldAlphabet[ch] || ch).join("");
}

// get display name
async function getDisplayName(api, senderID) {
  if (String(senderID) === String(OWNER_ID)) return toBoldUnicode("Aru");
  try {
    const info = await api.getUserInfo(senderID);
    const name = info?.[senderID]?.firstName || "Senpai";
    return toBoldUnicode(name);
  } catch {
    return toBoldUnicode("Senpai");
  }
}

// translate helper
async function translateTo(text, targetLang) {
  try {
    const res = await axios.get("https://translate.googleapis.com/translate_a/single", {
      params: { client: "gtx", sl: "auto", tl: targetLang, dt: "t", q: text },
      timeout: 20000
    });
    const chunk = res?.data?.[0]?.[0]?.[0];
    return typeof chunk === "string" ? chunk : text;
  } catch {
    return text; // fallback: return original text
  }
}

// === TTS ENGINES ===
async function ttsJapanese(text, fileName) {
  const ttsUrl = "https://api.tts.quest/v3/voicevox/synthesis";
  const tts = await axios.get(ttsUrl, { params: { text, speaker: 3 }, timeout: 25000 });
  const audioUrl = tts?.data?.mp3StreamingUrl;
  if (!audioUrl) return null;

  const audioResp = await axios.get(audioUrl, { responseType: "arraybuffer" });
  fs.writeFileSync(fileName, Buffer.from(audioResp.data));
  return fileName;
}

async function ttsGoogle(text, lang, fileName) {
  const gttsUrl = "https://translate.google.com/translate_tts";
  const resp = await axios.get(gttsUrl, {
    params: { ie: "UTF-8", tl: lang, client: "tw-ob", q: text },
    responseType: "arraybuffer", timeout: 25000
  });
  fs.writeFileSync(fileName, Buffer.from(resp.data));
  return fileName;
}

// === CORE HANDLER ===
async function handleAnya({ api, event, message, inputText }) {
  const { threadID, senderID } = event;
  const displayName = await getDisplayName(api, senderID);

  // greet if empty after "anya"
  if (!inputText) {
    return message.reply(`> 🎀 𝐊𝐨𝐧𝐢𝐜𝐡𝐢𝐰𝐚 ${displayName} 𝐬𝐞𝐧𝐩𝐚𝐢 🐱`);
  }

  // detect language flag
  const match = inputText.match(/^(en|hi|ja)\s+/i);
  let lang = "ja"; // default
  let text = inputText;
  if (match) {
    lang = match[1].toLowerCase();
    text = inputText.replace(/^(en|hi|ja)\s+/i, "");
  }

  // translate if needed
  const output = lang === "en" ? text : await translateTo(text, lang);
  const finalText = `${displayName}, ${output}`;
  const filePath = path.join(CACHE_DIR, `${threadID}_${senderID}_${lang}.mp3`);

  let audioPath = null;
  try {
    if (lang === "ja") {
      audioPath = await ttsJapanese(output, filePath);
    } else {
      audioPath = await ttsGoogle(output, lang, filePath);
    }
  } catch (e) {
    console.error("TTS error:", e?.message);
  }

  if (audioPath) {
    try {
      const stream = fs.createReadStream(audioPath);
      message.reply({ body: finalText, attachment: stream }, () => {
        fs.unlink(audioPath).catch(() => {});
      });
      return;
    } catch (e) {
      console.error("Send/cleanup error:", e?.message);
    }
  }

  // fallback: text only
  return message.reply(finalText);
}

module.exports = {
  config: {
    name: "anya",
    aliases: [],
    author: "kshitiz + modified by Arijit",
    version: "6.3",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Chat with Anya (EN/HI/JA TTS + Bold Names)" },
    longDescription: {
      en: "Talk with Anya Forger in English, Hindi or Japanese. Names are styled in bold. Includes TTS voice output with fallback."
    },
    category: "ai",
    guide: {
      en: "{pn} [lang] [text]\nLanguages: en, hi, ja\nExamples:\n• anya en Hello Anya\n• anya hi Tum kaise ho?\n• anya ja I love you"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const inputText = (args || []).join(" ").trim();
    return handleAnya({ api, event, message, inputText });
  },

  onChat: async function ({ api, event, message }) {
    const body = (event.body || "").trim();
    if (!/^anya\b/i.test(body)) return;
    const inputText = body.replace(/^anya\b/i, "").trim();
    return handleAnya({ api, event, message, inputText });
  }
};
