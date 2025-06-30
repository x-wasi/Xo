const { cmd } = require("../command");

// Word Chain Game (lib/wcg.js exports the class)
const WordChainGame = require("../lib/wcg");
const wcg = new WordChainGame();

// Trivia (lib/trivia.js exports the class)
const TriviaGame = require("../lib/trivia");
const triviaGame = new TriviaGame();

// Your Mongo helper & newsletter context
const { connectDB } = require("../lib/db");


// Tic‑Tac‑Toe


// Word Chain Game Command
// 1) Start a new Word Chain Game
cmd(
  {
    pattern: "wg",
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
        return reply(
          "ᴀ ᴡᴏʀᴅ ᴄʜᴀɪɴ ɢᴀᴍᴇ ɪs ᴀʟʀᴇᴀᴅʏ ɪɴ ᴘʀᴏɢʀᴇss!"
        );
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
      return reply(
        "An error occurred while starting the Word Chain game."
      );
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
        return reply(
          "ɴᴏ ᴡᴏʀᴅ ᴄʜᴀɪɴ ɢᴀᴍᴇ ɪs ɪɴ ᴘʀᴏɢʀᴇss. sᴛᴀʀᴛ ᴏɴᴇ ᴡɪᴛʜ `ᴡᴄɢ`."
        );
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
          return reply("ʏᴏᴜ’ᴠᴇ ᴀʟʀᴇᴀᴅʏ ᴊᴏɪɴᴇᴅ!" );
        }
      } else {
        return reply("ᴛʜᴇ ɢᴀᴍᴇ ɪs ᴀʟʀᴇᴀᴅʏ ᴀᴄᴛɪᴠᴇ — ᴊᴜsᴛ ᴘʟᴀʏ ʏᴏᴜʀ ᴛᴜʀɴ!");
      }
    } catch (err) {
      console.error(err);
      return reply(
        "An error occurred while joining the Word Chain game."
      );
    }
  }
);


// Trivia Game Command
cmd(
  {
    pattern: "trivia ?(.*)",
    desc: "Play Trivia Game (easy/medium/hard)",
    category: "games",
    react: "🧠",
    filename: __filename,
  },
  async (conn, mek, m, { from, reply }) => {
    try {
      const chatId = m.chat;
      const difficulty = m.text.split(" ")[1];
      if (triviaGame.isGameActive(chatId)) return reply("*_A trivia game is already in progress! Answer the current question or use \"trivia end\" to end it._*");
      
      if (!['easy', 'medium', 'hard'].includes(difficulty)) return reply('*_Choose difficulty: easy, medium, or hard_*');
      
      const questionMsg = await triviaGame.startGame(chatId, difficulty);
      await reply(questionMsg);
    } catch (error) {
      console.error(error);
      return reply("An error occurred while starting the trivia game.");
    }
  }
);

// Trivia Answer Command
cmd(
  {
    pattern: "answer ?(.*)",
    desc: "Answer a trivia question.",
    category: "games",
    react: "🧠",
    filename: __filename,
  },
  async (conn, mek, m, { from, reply }) => {
    try {
      const chatId = m.chat;
      const userAnswer = m.text.split(" ")[1];
      if (!triviaGame.isGameActive(chatId)) return;

      const game = triviaGame.activeGames.get(chatId);
      if (!game) return;

      const result = triviaGame.checkAnswer(chatId, userAnswer);
      if (result.includes("Correct!")) {
        await reply(result, );
        setTimeout(async () => {
          if (triviaGame.isGameActive(chatId)) {
            const newQuestion = await triviaGame.startGame(chatId, game.difficulty);
            await reply(newQuestion);
          }
        }, 2000);
      } else {
        await reply(result);
      }
    } catch (error) {
      console.error(error);
      return reply("An error occurred while answering the trivia question.");
    }
  }
);
