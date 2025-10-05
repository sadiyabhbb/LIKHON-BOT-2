module.exports = {
  config: {
    name: "owner",
    version: "1.4",
    author: "Tokodori_Frtiz // remodified by cliff",
    countDown: 5,
    role: 0,
    shortDescription: "no prefix owner info",
    longDescription: "Responds with detailed owner info when 'kakashi' is typed without prefix",
    category: "auto 🪐",
    noPrefix: true,
  },

  onStart: async function() {},

  onChat: async function({ event, message, getLang }) {
    if (event.body && event.body.toLowerCase() === "owner") {
      return message.reply({
        body: `
╔════════════════════╗
║     🌟 𝗢𝘄𝗻𝗲𝗿 𝗜𝗻𝗳𝗼 🌟     ║
╚════════════════════╝

👑 𝗡𝗮𝗺𝗲       : 𝐋𝐢𝐤𝐡𝐨𝐧
🏡 𝗔𝗱𝗱𝗿𝗲𝘀𝘀   : 🌚🤌🏻, 𝗕𝗮𝗻𝗴𝗹𝗮𝗱𝗲𝘀𝗵  
⚧ 𝗚𝗲𝗻𝗱𝗲𝗿    : 𝗠𝗮𝗹𝗲  
🎂 𝗔𝗴𝗲        : 𝟭𝟴+
🦸 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲  : 𝗢𝗬𝗼𝗻

💼 𝗢𝗰𝗰𝘂𝗽𝗮𝘁𝗶𝗼𝗻: 𝗦𝗼𝗳𝘁𝘄𝗮𝗿𝗲 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿  
📧 𝗘𝗺𝗮𝗶𝗹      : 𝗟𝟭𝟰𝗛𝟬𝗡𝗕𝟬𝗧@𝗴𝗺𝗮𝗶𝗹.𝗰𝗼𝗺  
📱 𝗖𝗼𝗻𝘁𝗮𝗰𝘁    : +8801XXXXXXXXX  

═══════════════════════════  
💬 𝗧𝗮𝗹𝗸 𝘁𝗼 𝗞𝗮𝗸𝗮𝘀𝗵𝗶 𝗕𝗼𝘁:  
⇨ 𝘀𝗶𝗺𝗽𝗹𝘆 𝘀𝗮𝘆 "𝗯𝗼𝘁" 𝗼𝗿 "𝗯𝗯𝘆"  
⇨ 𝗮𝗻𝗱 𝗵𝗮𝘃𝗲 𝗳𝘂𝗻!  | (• ◡•)|ꨄ︎  
═══════════════════════════
      `,
        attachment: await global.utils.getStreamFromURL("https://drive.google.com/uc?export=view&id=1uy4zwYba6RRWDOvqWxDxWACLjbWRNmgP")
      });
    }
  }
}
