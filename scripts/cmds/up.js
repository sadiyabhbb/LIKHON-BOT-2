const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "up",
    version: "5.2",
    author: "LIKHON AHMED",
    countDown: 5,
    role: 0,
    description: {
      en: "Show bot status in a clean styled card",
      bn: "বট স্ট্যাটাস একটি সুন্দর কার্ডে দেখায়"
    },
    category: "utility",
    guide: {
      en: "{pn} - Show bot uptime, ping, time, owner",
      bn: "{pn} - বটের স্ট্যাটাস দেখায়"
    }
  },

  onStart: async function ({ message, api, event }) {
    try {
      // ====== UPTIME ======
      const totalSeconds = Math.floor(process.uptime());
      const hoursUptime = Math.floor(totalSeconds / 3600);
      const minutesUptime = Math.floor((totalSeconds % 3600) / 60);
      const secondsUptime = totalSeconds % 60;
      const uptimeFormatted = `${pad(hoursUptime)}:${pad(minutesUptime)}:${pad(secondsUptime)}`;

      function pad(n) {
        return n.toString().padStart(2, "0");
      }

      // ====== PING ======
      const pingStart = Date.now();
      await api.sendTypingIndicator(event.threadID);
      const ping = Date.now() - pingStart;

      // ====== OWNER ======
      const owner = "LIKHON 6X9";

      // ====== BANGLADESH TIME (12-hour format) ======
      const nowUTC = new Date();
      const bangladeshOffset = 6 * 60; // UTC+6 in minutes
      const bangladeshTime = new Date(nowUTC.getTime() + bangladeshOffset * 60 * 1000);

      let hours = bangladeshTime.getHours();
      const minutes = bangladeshTime.getMinutes();
      const seconds = bangladeshTime.getSeconds();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      if (hours === 0) hours = 12; // 12-hour format fix

      const time = `${pad(hours)}:${pad(minutes)}:${pad(seconds)} ${ampm}`;

      // ====== CANVAS ======
      const width = 800, height = 450;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // ==== LOAD BACKGROUND IMAGE ====
      const backgroundImage = await loadImage("https://i.imgur.com/L5fxnEX.jpeg");
      ctx.drawImage(backgroundImage, 0, 0, width, height);

      // ==== DARK OVERLAY + SUBTLE GRADIENT STREAKS ====
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, width, height);

      const streakGradient = ctx.createLinearGradient(0, 0, width, height);
      streakGradient.addColorStop(0, "rgba(255,255,255,0.03)");
      streakGradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = streakGradient;
      ctx.fillRect(0, 0, width, height);

      // ==== INNER PANEL WITH SHADOW & GLOW ====
      const panelX = 50, panelY = 50, panelW = width - 100, panelH = height - 100;
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 25;
      ctx.fillStyle = "rgba(20, 25, 35, 0.95)";
      drawRounded(ctx, panelX, panelY, panelW, panelH, 25);
      ctx.fill();

      // BORDER WITH SUBTLE GLOW
      ctx.shadowBlur = 15;
      ctx.strokeStyle = "#ff6fbf";
      ctx.lineWidth = 4;
      drawRounded(ctx, panelX, panelY, panelW, panelH, 25);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // TITLE WITH SOFT SHADOW
      ctx.fillStyle = "#e0e0e0";
      ctx.font = "bold 36px Sans";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 6;
      ctx.fillText("BOT STATUS", width / 2, 110);
      ctx.shadowBlur = 0;

      // ==== VALUES ====
      ctx.textAlign = "left";
      const startY = 170;
      const gapY = 70;

      drawRow("UPTIME", uptimeFormatted, "#FFD700", startY);
      drawRow("PING", `${ping}ms`, "#00FFAA", startY + gapY);
      drawRow("TIME", time, "#66B2FF", startY + gapY * 2);
      drawRow("OWNER", owner, "#FF6FBF", startY + gapY * 3);

      // SAVE IMAGE
      const filePath = path.join(__dirname, "uptime.png");
      fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

      // ====== MESSAGE BODY ======
      return message.reply({
        body: uptimeFormatted, // শুধু uptime HH:MM:SS
        attachment: fs.createReadStream(filePath)
      });

      // ====== HELPERS ======
      function drawRounded(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      }

      function drawRow(label, value, color, y) {
        // LABEL
        ctx.font = "bold 22px Sans";
        ctx.fillStyle = color;
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 4;
        ctx.fillText(label, 120, y);

        // COLON (:) AFTER LABEL
        const colonX = 120 + ctx.measureText(label).width + 5;
        ctx.fillStyle = color;
        ctx.font = "bold 22px Sans";
        ctx.fillText(":", colonX, y);

        // VALUE
        ctx.font = "bold 28px Sans";
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 6;
        ctx.fillText(value, 320, y);
        ctx.shadowBlur = 0;
      }

    } catch (e) {
      return message.reply("⚠️ Error: " + e.message);
    }
  }
};
