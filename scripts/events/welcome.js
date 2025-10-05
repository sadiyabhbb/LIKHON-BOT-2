const { getTime } = global.utils;
const axios = require("axios");

if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.1",
		author: "NTKhang + Modified by BADOL",
		category: "events"
	},

	langs: {
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối"
		},
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening"
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe") {
			return async function () {
				const hours = getTime("HH");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;

				if (dataAddedParticipants.some(item => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					return message.send(`🤖 ধন্যবাদ আমাকে গ্রুপে অ্যাড করার জন্য!\nPrefix: ${prefix}\nলিস্ট দেখতে লিখুন: ${prefix}help`);
				}

				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};

				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);
					if (threadData.settings.sendWelcomeMessage == false)
						return;

					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const dataBanned = threadData.data.banned_ban || [];
					const threadName = threadData.threadName;

					const userName = [];
					const mentions = [];

					const addedByID = event.logMessageData.author;
					const addedByInfo = await api.getUserInfo(addedByID);
					const addedByName = addedByInfo[addedByID]?.name || "Unknown";
					const addedByMention = { tag: addedByName, id: addedByID };

					for (const user of dataAddedParticipants) {
						if (dataBanned.some(item => item.id == user.userFbId)) continue;
						userName.push(user.fullName);
						mentions.push({ tag: user.fullName, id: user.userFbId });
					}

					if (userName.length === 0) return;

					const session =
						hours <= 10
							? getLang("session1")
							: hours <= 12
								? getLang("session2")
								: hours <= 18
									? getLang("session3")
									: getLang("session4");

					const threadInfo = await api.getThreadInfo(threadID);
					const totalMembers = threadInfo.participantIDs.length;

					const welcomeMessage = `
🎉 স্বাগতম ${userName.join(", ")}!
📌 গ্রুপ: ${threadName}
👥 মোট সদস্য: ${totalMembers} জন
🕒 সময়: ${session}
😊 শুভ সময় কাটুক!

➕ Added by: ${addedByName}
`;

					const form = {
						body: welcomeMessage.trim(),
						mentions: [...mentions, addedByMention]
					};

					const welcomeGifUrl = "https://drive.google.com/uc?export=view&id=15Fo07tRpUXjATufcKnF7rciLGnp4JeFI";

					try {
						const response = await axios.get(welcomeGifUrl, { responseType: "stream" });
						form.attachment = response.data;
					} catch (err) {
						console.error("GIF লোড করতে সমস্যা হয়েছে:", err.message);
					}

					message.send(form);
					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
		}
	}
};
