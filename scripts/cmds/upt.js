const { execSync } = require('child_process');

module.exports = {
  config: {
    name: 'upt',
    aliases: ['up', 'status', 'system', 'rtm'],
    version: '1.5',
    author: 'xnil',
    countDown: 15,
    role: 0,
    shortDescription: 'Display bot uptime and system stats with media ban check',
    longDescription: { id: 'Display bot uptime and system stats with media ban check', en: 'Display bot uptime and system stats with media ban check' },
    category: 'system',
    guide: { id: '{pn}: Display bot uptime and system stats with media ban check', en: '{pn}: Display bot uptime and system stats with media ban check' }
  },

  onStart: async function({ message, event, usersData, threadsData, api }) {
    if (this.config.author !== 'xnil') {
      return message.reply("⚠ Unauthorized author change detected. Command execution stopped.");
    }

    const startTime = Date.now();
    const users = await usersData.getAll();
    const groups = await threadsData.getAll();
    const uptime = process.uptime();
    const totalCommands = global.GoatBot.commands ? global.GoatBot.commands.size : "N/A";
    
    try {
      const days = Math.floor(uptime / (3600 * 24));
      const hours = Math.floor((uptime % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const totalMemory = (parseInt(execSync("grep MemTotal /proc/meminfo | awk '{print $2}'").toString().trim()) / 1024 / 1024).toFixed(2);
      const freeMemory = (parseInt(execSync("grep MemAvailable /proc/meminfo | awk '{print $2}'").toString().trim()) / 1024 / 1024).toFixed(2);
      const cpuModel = execSync("cat /proc/cpuinfo | grep 'model name' | uniq | awk -F: '{print $2}'").toString().trim();
      const cpuUsage = execSync("top -bn1 | grep '%Cpu' | awk '{print $2 + $4}'").toString().trim();
      const cpuCores = parseInt(execSync("nproc").toString().trim());

      const diskUsage = execSync("df -h / | tail -1 | awk '{print $5}'").toString().trim();
      const diskTotal = execSync("df -h / | tail -1 | awk '{print $2}'").toString().trim();
      const diskFree = execSync("df -h / | tail -1 | awk '{print $4}'").toString().trim();

      const linuxVersion = execSync("cat /etc/os-release | grep 'PRETTY_NAME' | cut -d= -f2").toString().trim().replace(/"/g, '');
      const nodeVersion = process.version;

      const endTime = Date.now();
      const botPing = endTime - startTime;

      const totalMessages = users.reduce((sum, user) => sum + (user.messageCount || 0), 0);
      const mediaBan = await threadsData.get(event.threadID, 'mediaBan') || false;
      const mediaBanStatus = mediaBan ? '🚫 Media is currently banned in this chat.' : '✅ Media is not banned in this chat.';

      const uptimeResponse = uptime > 86400 ? "💪 I've been running for quite a while now!" : "😎 Just getting started!";

      const editSegments = [
        `🌟 Bot Statistics 🌟\n` +
        `👥 Total Users: ${users.length}\n` +
        `💬 Total Groups: ${groups.length}\n` +
        `⚙ Total Commands: ${totalCommands}\n` +
        `⏱ Bot Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s\n` +
        `📶 Bot Ping: ${botPing}ms\n\n` +
        
        `🌐 Server Statistics 🌐\n` +
        `⏱ Server Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s\n` +
        `💾 Total Memory: ${totalMemory} MB\n` +
        `🆓 Free Memory: ${freeMemory} MB\n` +
        `⚙ CPU Model: ${cpuModel}\n` +
        `🔥 CPU Usage: ${cpuUsage}%\n` +
        `💽 Disk Usage: ${diskUsage} (Total: ${diskTotal}, Free: ${diskFree})\n` +
        `🖥 Linux Version: ${linuxVersion}\n` +
        `📦 Node.js Version: ${nodeVersion}`
      ];

      const loadingFrames = [
        '🔄 LOADING...\n[█▒▒▒▒▒▒▒▒▒]',
        '🔄 LOADING...\n[████▒▒▒▒▒▒]',
        '🔄 LOADING...\n[█████▒▒▒▒▒]',
        '✅ LOADED!\n[█████████]'
      ];

      let sentMessage = await message.reply("🖥 Initializing system stats...");

      let currentSegmentIndex = 0;
      const editMessageContent = async (index) => {
        if (index < loadingFrames.length) {
          const loadingProgress = loadingFrames[index];
          const currentContent = `${loadingProgress}\n\n${editSegments.slice(0, currentSegmentIndex).join('\n\n')}`;
          api.editMessage(currentContent, sentMessage.messageID);
          setTimeout(() => editMessageContent(index + 1), 600);
        } else if (currentSegmentIndex < editSegments.length) {
          const currentContent = `${loadingFrames[3]}\n\n${editSegments.slice(0, currentSegmentIndex + 1).join('\n\n')}`;
          api.editMessage(currentContent, sentMessage.messageID);
          currentSegmentIndex++;
          setTimeout(() => editMessageContent(0), 600);
        }
      };

      editMessageContent(0);
      
    } catch (err) {
      console.error(err);
      return message.reply("❌ An error occurred while fetching system statistics.");
    }
  }
};
