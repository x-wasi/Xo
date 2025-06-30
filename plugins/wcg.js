const { cmd } = require("../command");
const WordChainGame = require("../lib/wcg");
const wcg = new WordChainGame();

// 1) Start Easy mode
// 1) Start a new Word Chain Game
cmd(
  {
    pattern: "wcg",
    desc: "Start a Word Chain Game.",
    category: "games",
    react: "🧩",
    filename: __filename,
  },
  async (conn, mek, m, { reply, args }) => {
    try {
      const chatId = m.chat;
      let game = wcg.getGame(chatId);

      if (game && game.status === "active") {
        return reply("ᴀ ᴡᴏʀᴅ ᴄʜᴀɪɴ ɢᴀᴍᴇ ɪs ᴀʟʀᴇᴀᴅʏ ɪɴ ᴘʀᴏɢʀᴇss!");
      }

      // The first arg after the command is our difficulty
      const diff = args[0]?.toLowerCase();
      const difficulty = ["easy", "medium", "hard"].includes(diff) ? diff : "medium";

      game = wcg.createGame(chatId, difficulty);
      game.addPlayer(m.sender);

      return reply(
        `ᴡᴏʀᴅ ᴄʜᴀɪɴ ɢᴀᴍᴇ sᴛᴀʀᴛᴇᴅ (${difficulty} ᴍᴏᴅᴇ)!  
ᴍɪɴɪᴍᴜᴍ ᴡᴏʀᴅ ʟᴇɴɢᴛʜ: ${game.minLength} ʟᴇᴛᴛᴇʀs  
ᴛɪᴍᴇ ᴘᴇʀ ᴛᴜʀɴ: ${game.turnTime} sᴇᴄᴏɴᴅs  

ᴛʏᴘᴇ "ᴊᴏɪɴ" ᴛᴏ ᴘᴀʀᴛɪᴄɪᴘᴀᴛᴇ. ɢᴀᴍᴇ sᴛᴀʀᴛs ᴡʜᴇɴ ᴀᴛ ʟᴇᴀsᴛ 2 ᴘʟᴀʏᴇʀs ᴊᴏɪɴ.`
      );
    } catch (err) {
      console.error(err);
      return reply("An error occurred while starting the Word Chain game.");
    }
  }
);

// 2) Join / trigger start when enough players
cmd(
  {
    pattern: "join",
    desc: "Join the Word Chain game.",
    category: "games",
    react: "🧩",
    filename: __filename,
  },
  async (conn, mek, m, { reply }) => {
    try {
      const chatId = m.chat;
      const game = wcg.getGame(chatId);
      if (!game) {
        return reply("ɴᴏ ᴡᴏʀᴅ ᴄʜᴀɪɴ ɢᴀᴍᴇ ɪs ɪɴ ᴘʀᴏɢʀᴇss. sᴛᴀʀᴛ ᴏɴᴇ ᴡɪᴛʜ `ᴡᴄɢ`.");
      }

      if (game.status === "waiting") {
        if (game.addPlayer(m.sender)) {
          await reply("ʏᴏᴜ ᴊᴏɪɴᴇᴅ ᴛʜᴇ ɢᴀᴍᴇ! ᴡᴀɪᴛɪɴɢ ғᴏʀ ᴍᴏʀᴇ ᴘʟᴀʏᴇʀs...");
          if (game.players.size >= 2) {
            game.start();
            return reply(
              `ɢᴀᴍᴇ sᴛᴀʀᴛᴇᴅ!  
ғɪʀsᴛ ᴘʟᴀʏᴇʀ: @${game.currentPlayer.split("@")[0]}'s ᴛᴜʀɴ.  
sᴛᴀʀᴛ ᴡɪᴛʜ ᴀɴʏ ᴡᴏʀᴅ ᴏғ ᴀᴛ ʟᴇᴀsᴛ ${game.minLength} ʟᴇᴛᴛᴇʀs.  
ʏᴏᴜ ʜᴀᴠᴇ ${game.turnTime} sᴇᴄᴏɴᴅs ᴘᴇʀ ᴛᴜʀɴ.`,
              {
                mentions: [ game.currentPlayer ]
              }
            );
          }
        } else {
          return reply("ʏᴏᴜ’ᴠᴇ ᴀʟʀᴇᴀᴅʏ ᴊᴏɪɴᴇᴅ!");
        }
      } else {
        return reply("ᴛʜᴇ ɢᴀᴍᴇ ɪs ᴀʟʀᴇᴀᴅʏ ᴀᴄᴛɪᴠᴇ — ᴊᴜsᴛ ᴘʟᴀʏ ʏᴏᴜʀ ᴛᴜʀɴ!");
      }
    } catch (err) {
      console.error(err);
      return reply("An error occurred while joining the Word Chain game.");
    }
  }
);
