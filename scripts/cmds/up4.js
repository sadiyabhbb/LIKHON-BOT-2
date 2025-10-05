const os = require('os');
const moment = require('moment-timezone');
const { createCanvas } = require('canvas');
const fs = require('fs');
const GIFEncoder = require('gifencoder');

// Safe-guard (process.stderr issue fix)
if (!process.stderr.clearLine) process.stderr.clearLine = () => {};
if (!process.stderr.cursorTo) process.stderr.cursorTo = () => {};

module.exports = {
    config: {
        name: "up4",
        aliases: ["run", "stats"],
        version: "1.4",
        author: "ミ★𝐒𝐎𝐍𝐈𝐂✄𝐄𝐗𝐄 3.0★彡",
        role: 0,
        shortDescription: {
            en: "Displays bot uptime, system info, and BD time with animated colors."
        },
        longDescription: {
            en: "Shows bot uptime, server uptime, CPU speed, RAM usage, and Bangladesh time with animated text & background colors."
        },
        category: "system",
        guide: {
            en: "{p}ck"
        }
    },

    onStart: async function ({ api, event }) {
        try {
            const botUptime = process.uptime();
            const serverUptime = os.uptime();

            const formatTime = (sec) => {
                const d = Math.floor(sec / 86400);
                const h = Math.floor((sec % 86400) / 3600);
                const m = Math.floor((sec % 3600) / 60);
                const s = Math.floor(sec % 60);
                return `${d}d ${h}h ${m}m ${s}s`;
            };

            const botUptimeString = formatTime(botUptime);
            const serverUptimeString = formatTime(serverUptime);

            const totalMem = os.totalmem() / (1024 * 1024 * 1024);
            const freeMem = os.freemem() / (1024 * 1024 * 1024);
            const usedMem = totalMem - freeMem;
            const speed = os.cpus()[0].speed;

            const currentTime = moment().tz('Asia/Dhaka').format('YYYY-MM-DD HH:mm:ss');

            const encoder = new GIFEncoder(400, 320);
            const gifPath = './uptime.gif';
            const stream = fs.createWriteStream(gifPath);

            encoder.createReadStream().pipe(stream);
            encoder.start();
            encoder.setRepeat(0);   // loop forever
            encoder.setDelay(600);  // প্রতি ফ্রেমে delay (ms)
            encoder.setQuality(10);

            const canvas = createCanvas(400, 320);
            const ctx = canvas.getContext('2d');

            // Background + text colors for animation
            const bgColors = ['#ffffff', '#000000', '#2222ff', '#00aaaa'];
            const textColors = ['#000000', '#ff0000', '#00ff00', '#ffff00'];

            for (let i = 0; i < bgColors.length; i++) {
                ctx.fillStyle = bgColors[i]; // Background
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = textColors[i]; // Text color
                ctx.font = '18px Arial';
                ctx.fillText('Likhon Bot Uptime:', 10, 30);
                ctx.fillText(botUptimeString, 10, 55);
                ctx.fillText('Server Uptime:', 10, 80);
                ctx.fillText(serverUptimeString, 10, 105);
                ctx.fillText('CPU Speed:', 10, 130);
                ctx.fillText(`${speed} MHz`, 10, 155);
                ctx.fillText('Memory Usage:', 10, 180);
                ctx.fillText(`Used: ${usedMem.toFixed(2)} GB / Total: ${totalMem.toFixed(2)} GB`, 10, 205);
                ctx.fillText('Current Time (BD):', 10, 230);
                ctx.fillText(currentTime, 10, 255);
                ctx.fillText("🟢 Good System", 10, 280);

                encoder.addFrame(ctx);
            }

            encoder.finish();

            stream.on('finish', () => {
                api.sendMessage(
                    { body: '✅ System Status:', attachment: fs.createReadStream(gifPath) },
                    event.threadID
                );
            });

        } catch (error) {
            console.error('Unexpected error:', error);
            api.sendMessage(`🔴 Error: ${error.message}`, event.threadID);
        }
    }
};
