const fs = require("fs");

module.exports = {
  config: {
    name: "bank",
    version: "1.4",
    description: "Deposit or withdraw money from the bank and earn interest",
    guide: {
      en: "{pn}Bank:\nDeposit - Withdraw - Balance - Transfer - Interest - Richest - Loan - PayLoan - Add (owner only)"
    },
    category: "💰 Economy",
    countDown: 3,
    role: 0,
    author: "Loufi | SiAM | Samiul | Fixed By LIKHON AHMED"
  },

  onStart: async function ({ args, message, event, api, usersData }) {
    const { getPrefix } = global.utils;
    const p = getPrefix(event.threadID);

    const userMoney = await usersData.get(event.senderID, "money");
    const user = parseInt(event.senderID);
    const info = await api.getUserInfo(user);
    const username = info[user].name;

    const bankDataPath = 'scripts/cmds/bankData.json';
    if (!fs.existsSync(bankDataPath)) fs.writeFileSync(bankDataPath, JSON.stringify({}), "utf8");
    const bankData = JSON.parse(fs.readFileSync(bankDataPath, "utf8"));

    if (!bankData[user]) {
      bankData[user] = { bank: 0, lastInterestClaimed: Date.now() };
      fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");
    }

    let bankBalance = bankData[user].bank || 0;
    const command = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);
    const recipientUID = parseInt(args[2]);

    switch (command) {

      
      case "add": {
        const ownerUID = "61572915213085";
        if (event.senderID.toString() !== ownerUID)
          return message.reply("❌ Only the owner can use this command!");

        if (isNaN(amount) || amount <= 0) return message.reply("❌ Enter a valid amount to add.");

        let targetID = user;

        if (Object.keys(event.mentions).length > 0) targetID = Object.keys(event.mentions)[0];
        else if (event.type === "message_reply") targetID = event.messageReply.senderID;
        else if (args[1] && !isNaN(args[1])) targetID = args[1];

        if (!bankData[targetID]) {
          bankData[targetID] = { bank: 0, lastInterestClaimed: Date.now() };
        }

        bankData[targetID].bank += amount;
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");

        const targetName = (await usersData.getName(targetID)) || "User";
        return message.reply(`✅ Added $${amount} to ${targetName}'s bank balance.`);
      }

      
      case "deposit": {
        if (isNaN(amount) || amount <= 0) return message.reply("❌ Enter valid amount to deposit.");
        if (bankBalance >= 1e104) return message.reply("❌ Bank balance maxed at 1e104.");
        if (userMoney < amount) return message.reply("❌ Not enough money to deposit.");

        bankData[user].bank += amount;
        await usersData.set(event.senderID, { money: userMoney - amount });
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");

        return message.reply(`✅ Deposited $${amount} into your bank.`);
      }

      
      case "withdraw": {
        const balance = bankData[user].bank || 0;
        if (isNaN(amount) || amount <= 0) return message.reply("❌ Enter valid amount to withdraw.");
        if (userMoney >= 1e104) return message.reply("❌ Cannot withdraw: balance maxed.");
        if (amount > balance) return message.reply("❌ Amount exceeds bank balance.");

        bankData[user].bank = balance - amount;
        await usersData.set(event.senderID, { money: userMoney + amount });
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");

        return message.reply(`✅ Withdrew $${amount} from your bank.`);
      }

      
      case "balance": {
        let targetID = user;

        if (Object.keys(event.mentions).length > 0) targetID = Object.keys(event.mentions)[0];
        else if (event.type === "message_reply") targetID = event.messageReply.senderID;
        else if (args[1] && !isNaN(args[1])) targetID = args[1];

        if (!bankData[targetID]) {
          bankData[targetID] = { bank: 0, lastInterestClaimed: Date.now() };
          fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");
        }

        const balanceCheck = bankData[targetID].bank || 0;
        const formattedBalance = formatNumberWithFullForm(balanceCheck);
        const nameTag = (await usersData.getName(targetID)) || "User";

        return message.reply(
          `╔════ஜ۩۞۩ஜ═══╗\n\n[🏦 Bank 🏦]\n\n❏『 ${nameTag} 』's bank balance: $${formattedBalance}\n\n╚════ஜ۩۞۩ஜ═══╝`
        );
      }

      
      case "interest": {
        const interestRate = 0.001;
        const lastInterestClaimed = bankData[user].lastInterestClaimed || 0;

        const currentTime = Date.now();
        const timeDiffInSeconds = (currentTime - lastInterestClaimed) / 1000;

        if (timeDiffInSeconds < 86400) {
          const remainingTime = Math.ceil(86400 - timeDiffInSeconds);
          const remainingHours = Math.floor(remainingTime / 3600);
          const remainingMinutes = Math.floor((remainingTime % 3600) / 60);
          return message.reply(`⏳ You can claim interest again in ${remainingHours}h ${remainingMinutes}m.`);
        }

        const interestEarned = bankData[user].bank * (interestRate / 970) * timeDiffInSeconds;
        if (bankData[user].bank <= 0) return message.reply("❌ No money to earn interest.");

        bankData[user].lastInterestClaimed = currentTime;
        bankData[user].bank += interestEarned;
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");

        return message.reply(`✅ Earned $${formatNumberWithFullForm(interestEarned)} interest.`);
      }

      
      case "transfer": {
        if (isNaN(amount) || amount <= 0) return message.reply("❌ Enter valid amount.");
        if (!recipientUID || !bankData[recipientUID]) return message.reply("❌ Recipient not found.");
        if (recipientUID === user) return message.reply("❌ Cannot transfer to yourself.");
        if (amount > bankData[user].bank) return message.reply("❌ Not enough money.");

        bankData[user].bank -= amount;
        bankData[recipientUID].bank += amount;
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");

        return message.reply(`✅ Transferred $${amount} to UID ${recipientUID}.`);
      }

      
      case "richest": {
        const bankDataCp = JSON.parse(fs.readFileSync(bankDataPath, 'utf8'));
        const topUsers = Object.entries(bankDataCp).sort(([, a], [, b]) => b.bank - a.bank).slice(0, 10);

        const output = (await Promise.all(topUsers.map(async ([userID, userData], index) => {
          const userName = await usersData.getName(userID);
          const formattedBalance = formatNumberWithFullForm(userData.bank);
          return `[${index + 1}. ${userName} - $${formattedBalance}]`;
        }))).join('\n');

        return message.reply("🏆 Top 10 richest users:\n" + output);
      }

      
      case "loan": {
        const maxLoanAmount = 100000000;
        const userLoan = bankData[user].loan || 0;
        const loanPayed = bankData[user].loanPayed !== undefined ? bankData[user].loanPayed : true;

        if (!amount) return message.reply("❌ Enter loan amount.");
        if (amount > maxLoanAmount) return message.reply("❌ Max loan $100000000.");
        if (!loanPayed && userLoan > 0) return message.reply(`❌ Pay current loan first: $${userLoan}`);

        bankData[user].loan = userLoan + amount;
        bankData[user].loanPayed = false;
        bankData[user].bank += amount;
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");

        return message.reply(`✅ Loan taken: $${amount}`);
      }

      
      case "payloan": {
        const loanBalance = bankData[user].loan || 0;
        if (isNaN(amount) || amount <= 0) return message.reply("❌ Enter valid amount to repay.");
        if (loanBalance <= 0) return message.reply("❌ No loan pending.");
        if (amount > loanBalance) return message.reply("❌ Amount exceeds loan.");
        if (amount > userMoney) return message.reply("❌ Not enough money.");

        bankData[user].loan = loanBalance - amount;
        if (loanBalance - amount === 0) bankData[user].loanPayed = true;

        await usersData.set(event.senderID, { money: userMoney - amount });
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");

        return message.reply(`✅ Paid $${amount} towards your loan. Remaining: $${bankData[user].loan}`);
      }

      default:
        return message.reply("❌ Use valid command: Deposit, Withdraw, Balance, Interest, Transfer, Richest, Loan, PayLoan, Add (owner only)");
    }
  }
};


function formatNumberWithFullForm(number) {
  const fullForms = ["","Thousand","Million","Billion","Trillion","Quadrillion","Quintillion","Sextillion","Septillion","Octillion","Nonillion","Decillion","Undecillion","Duodecillion","Tredecillion","Quattuordecillion","Quindecillion","Sexdecillion","Septendecillion","Octodecillion","Novemdecillion","Trigintillion","Untrigintillion","Duotrigintillion","Googol"];
  let fullFormIndex = 0;
  while (number >= 1000 && fullFormIndex < fullForms.length - 1) { 
    number /= 1000; 
    fullFormIndex++; 
  }
  return `${number.toFixed(2)} ${fullForms[fullFormIndex]}`;
}
