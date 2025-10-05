const axios = require("axios");

module.exports = {
  config: {
    name: "monitor",
    aliases: ["uptime"],
    version: "1.8",
    author: "LIKHON AHMED",
    countDown: 5,
    role: 0,
    shortDescription: "Add/list/remove links for uptime monitoring",
    description: "Use this command to add/remove links or view all monitored links in pretty spaced JSON format with masked URLs",
    category: "admin",
    guide: "{pn} add <url> [name] | {pn} list | {pn} remove <url>"
  },

  onStart: async function({ api, event, args }) {
    const BASE_URL = "https://monitor-host.onrender.com";
    const threadID = event.threadID;
    const action = (args[0] || "").toLowerCase();

    
    function maskURL(url) {
      try {
        const u = new URL(url);
        const hostParts = u.hostname.split(".");
        const main = hostParts[0];
        const masked = main.length > 4 ? "****" : "*".repeat(main.length);
        return u.protocol + "//" + masked + "." + hostParts.slice(1).join(".");
      } catch {
        return url;
      }
    }

    try {
      
      if (action === "add") {
        const url = args[1];
        if (!url) return api.sendMessage(JSON.stringify({ error: "Usage: add <url> [name]" }, null, 2), threadID);
        const name = args.slice(2).join(" ") || url;

        await axios.post(`${BASE_URL}/add`, { url, name, author: "LIKHON AHMED" });
        return api.sendMessage(JSON.stringify({
          success: true,

          message: `Added monitor: ${name}`,

          url,

          name,

          author: "LIKHON AHMED"
        }, null, 2), threadID);

      
      } else if (action === "list") {
        const res = await axios.get(`${BASE_URL}/status`);
        if (!res.data.length) return api.sendMessage("📭 No monitored links found.", threadID);

       
        const data = res.data.map(item => ({
          name: item.name,

          url: maskURL(item.url),

          status: item.status,

          responseTime: item.responseTime || null,

          lastChecked: item.lastChecked ? new Date(item.lastChecked).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" }) : null,

          uptime: item.uptime || "0d 0h 0m",

          addedTime: item.addedTime ? new Date(item.addedTime).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" }) : null,

          author: item.author || "LIKHON AHMED"
        }));

        
        const formatted = "\n\n[\n" + data.map(d => {
          const fields = Object.entries(d).map(([key, value]) => `  "${key}": ${JSON.stringify(value)},\n`).join("\n");
          return "  {\n" + fields.replace(/,\n$/, "\n") + "  }";
        }).join(",\n\n") + "\n]";

        return api.sendMessage(formatted, threadID);

      
      } else if (action === "remove") {
        const url = args[1];
        if (!url) return api.sendMessage(JSON.stringify({ error: "Usage: remove <url>" }, null, 2), threadID);

        await axios.post(`${BASE_URL}/remove`, { url });
        return api.sendMessage(JSON.stringify({
          success: true,

          message: `Removed monitor: ${url}`
        }, null, 2), threadID);

      
      } else {
        return api.sendMessage(JSON.stringify({ error: "Invalid action! Use add/list/remove" }, null, 2), threadID);
      }

    } catch (err) {
      console.error(err);
      return api.sendMessage(JSON.stringify({ error: "Error communicating with uptime monitor server" }, null, 2), threadID);
    }
  }
};
