const speakeasy = require('speakeasy');

module.exports = {
  config: {
    name: "2fa",
    aliases: ["totp"],
    version: "1.0",
    author: "LIKHON AHMED",
    countDown: 3,
    role: 0,
    description: "Generate 2FA code from any secret",
    category: "utility",
    guide: "{pn} <secret> – Generate 2FA code from secret"
  },

  onStart: async function({ message, args }) {
    if (!args[0]) return message.reply(" Use: /2fa <secret>");

    
    const secret = args.join('').replace(/[^A-Z2-7]/gi, '').toUpperCase();

    try {
      
      const token = speakeasy.totp({
        secret: secret,
        encoding: 'base32',
        digits: 6,
        step: 30
      });

      return message.reply(`${token}`);
    } catch (e) {
      return message.reply(" Sorry For Genarating Codes\nError: " + e.message);
    }
  }
};
