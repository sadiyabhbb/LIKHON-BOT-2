const { commands } = global.GoatBot;
const { getPrefix } = global.utils;

module.exports = {
  config: {
    name: "help",
    version: "2.4",
    author: "MODIFIED LIKHON AHMED",
    countDown: 5,
    role: 0,
    shortDescription: "Show all bot commands in styled format",
    longDescription: "Display help menu in category style like a guide book",
    category: "info",
    guide: {
      en: "{pn} [page | command name]"
    }
  },

  onStart: async function ({ message, args, event }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);

    if (args.length > 0 && isNaN(args[0])) {
      const flagIndex = args.indexOf("-f");
      const useNewDesign = flagIndex !== -1;

      const filteredArgs = args.filter(arg => arg !== "-f");
      const name = filteredArgs[0].toLowerCase();

      const cmd =
        commands.get(name) ||
        [...commands.values()].find(c => c.config.aliases?.includes(name));

      if (!cmd) return message.reply(`❌ Command not found: ${name}`);

      const c = cmd.config;

      const info = `
╔══ 『 COMMAND: ${c.name.toUpperCase()} 』 ═╗
║ 📜 Name      : ${c.name}
║ 🪶 Aliases   : ${c.aliases?.join(", ") || "None"}
║ 👤 Credits   : ${c.author || "Unknown"}
║ 🔑 Permission: ${c.role == 0 ? "Everyone" : (c.role == 1 ? "Group Admin" : "Bot Admin Only")}
╠═════════════════╣
║ ℹ INFORMATION
║ ─────────────────
║ Cost        : Free
║ Description :
║   ${c.longDescription || c.shortDescription || "No description"}
║ Guide       : ${c.guide?.en || `${prefix}${c.name}`}
╠════════════════╣
║ ⚙ SETTINGS
║ ────────────────
║ 🚩 Prefix Required : ✓ Required
║ ⚜ Premium         : ✗ Free to Use
╚════════════════╝
`;
      return message.reply(info);
    }

    const allCommands = [...commands.values()]
      .filter(cmd => cmd.config?.name)
      .sort((a, b) => a.config.name.localeCompare(b.config.name));

    const perPage = 20;
    const totalPages = Math.ceil(allCommands.length / perPage);
    const page = parseInt(args[0]) || 1;

    if (page < 1 || page > totalPages) {
      return message.reply(`❌ Page ${page} does not exist. Total pages: ${totalPages}`);
    }

    const start = (page - 1) * perPage;
    const end = start + perPage;
    const cmdsToShow = allCommands.slice(start, end);

    let msg = `╭─────────────◊\n`;
    cmdsToShow.forEach((cmd, index) => {
      const number = start + index + 1;
      msg += `│ ${number} ✧ /${cmd.config.name}\n`;
    });
    msg += `╰───────────────◊\n\n`;

    msg += `╭─✦『 LIKHON BOT 』✦────────╮\n`;
    msg += `│                              │\n`;
    msg += `│ ✦ Total commands: ${allCommands.length.toString().padEnd(15, " ")}│\n`;
    msg += `│ ✦ Page: ${page.toString().padEnd(22, " ")}│\n`;
    msg += `│ ✦ A Personal Facebook Bot     │\n`;
    msg += `│ ✦ ADMIN: 𝐋𝐈𝐊𝐇𝐎𝐍 𝐀𝐇𝐌𝐄𝐃        │\n`;
    msg += `│                              │\n`;
    msg += `│ ✦ Type ${prefix}help [commandName] for details. │\n`;
    msg += `╰──────────────────────╯`;

    return message.reply(msg);
  }
};
