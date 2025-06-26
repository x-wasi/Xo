const { cmd } = require('../command');
const activeGames = {};

cmd({
  pattern: "ttt",
  alias: ["tictactoe", "xo"],
  desc: "Start a Tic Tac Toe game",
  category: "game",
  filename: __filename,
}, async (conn, mek, m, { from, sender, reply, isGroup }) => {
  if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴏɴʟʏ ᴡᴏʀᴋs ɪɴ ɢʀᴏᴜᴘ ᴄʜᴀᴛs.");
  if (activeGames[from]) return reply("🎮 ᴀ ɢᴀᴍᴇ ɪs ᴀʟʀᴇᴀᴅʏ ʀᴜɴɴɪɴɢ ɪɴ ᴛʜɪs ɢʀᴏᴜᴘ.");

  const playerX = sender;
  const game = {
    board: ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"],
    playerX,
    playerO: null,
    currentTurn: "X",
    active: true,
    timeout: null,
    handler: null,
  };

  const drawBoard = () => {
    const b = game.board;
    return `\n${b[0]} ${b[1]} ${b[2]}\n${b[3]} ${b[4]} ${b[5]}\n${b[6]} ${b[7]} ${b[8]}`;
  };

  const winCheck = (b, s) => {
    const winPatterns = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    return winPatterns.some(([a,b1,c]) => b[a] === s && b[b1] === s && b[c] === s);
  };

  const cleanup = () => {
    clearTimeout(game.timeout);
    conn.ev.off("messages.upsert", game.handler);
    delete activeGames[from];
  };

  await conn.sendMessage(from, {
    text: `🎮 *ᴛɪᴄ ᴛᴀᴄ ᴛᴏᴇ sᴛᴀʀᴛᴇᴅ!*\n\n@${playerX.split("@")[0]} sᴛᴀʀᴛᴇᴅ ᴀ ɢᴀᴍᴇ!\nᴛʏᴘᴇ *ᴊᴏɪɴ* ᴛᴏ ᴊᴏɪɴ ᴀɴᴅ sᴛᴀʀᴛ ᴘʟᴀʏɪɴɢ.`,
    mentions: [playerX]
  }, { quoted: m });

  game.timeout = setTimeout(() => {
    if (activeGames[from]) {
      cleanup();
      conn.sendMessage(from, { text: "⏰ ɢᴀᴍᴇ ᴇɴᴅᴇᴅ ᴅᴜᴇ ᴛᴏ ɪɴᴀᴄᴛɪᴠɪᴛʏ." });
    }
  }, 5 * 60 * 1000);

  const extractText = (msg) =>
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    "";

  game.handler = async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || !activeGames[from]) return;

    const text = extractText(msg).trim();
    const fromUser = msg.key.participant || msg.key.remoteJid;

    // Handle join
    if (!game.playerO && /^join$/i.test(text) && fromUser !== game.playerX) {
      game.playerO = fromUser;
      game.currentTurn = "X";

      await conn.sendMessage(from, {
        text: `🎮 *ᴘʟᴀʏᴇʀ 2 @${fromUser.split("@")[0]} ᴊᴏɪɴᴇᴅ ᴛʜᴇ ɢᴀᴍᴇ!*\n\nᴍᴀᴛᴄʜ ʙᴇᴛᴡᴇᴇɴ:\n❌ @${game.playerX.split("@")[0]}\n⭕ @${game.playerO.split("@")[0]}\n\n@${game.playerX.split("@")[0]} ɪᴛ's ʏᴏᴜʀ ᴛᴜʀɴ! ʏᴏᴜ ᴀʀᴇ ❌\n${drawBoard()}\n\n_ʀᴇᴘʟʏ ᴡɪᴛʜ ᴀ ɴᴜᴍʙᴇʀ (1-9) ᴛᴏ ᴍᴀᴋᴇ ʏᴏᴜʀ ᴍᴏᴠᴇ._`,
        mentions: [game.playerX, game.playerO]
      }, { quoted: msg });
      return;
    }

    // If game not ready or inactive
    if (!game.playerO || !game.active) return;

    const move = parseInt(text);
    if (isNaN(move) || move < 1 || move > 9) return;

    const isX = game.currentTurn === "X";
    const expectedPlayer = isX ? game.playerX : game.playerO;
    if (fromUser !== expectedPlayer) {
      return conn.sendMessage(from, {
        text: `⛔ ɪᴛ's ɴᴏᴛ ʏᴏᴜʀ ᴛᴜʀɴ. ɪᴛ's @${expectedPlayer.split("@")[0]}'s ᴛᴜʀɴ.`,
        mentions: [expectedPlayer]
      }, { quoted: msg });
    }

    const index = move - 1;
    if (["❌", "⭕"].includes(game.board[index])) {
      return conn.sendMessage(from, {
        text: "⚠️ That cell is already taken."
      }, { quoted: msg });
    }

    const symbol = isX ? "❌" : "⭕";
    game.board[index] = symbol;

    // Win
    if (winCheck(game.board, symbol)) {
      await conn.sendMessage(from, {
        text: `🎉 *ɢᴀᴍᴇ ᴏᴠᴇʀ!*\n\n@${fromUser.split("@")[0]} (${symbol}) wins!\n───────────────\n${drawBoard()}\n───────────────`,
        mentions: [fromUser]
      });
      cleanup();
      return;
    }

    // Draw
    if (!game.board.some(cell => !["❌", "⭕"].includes(cell))) {
      await conn.sendMessage(from, {
        text: `🤝 *ɪᴛ's ᴀ ᴅʀᴀᴡ!*\n───────────────\n${drawBoard()}\n───────────────`
      });
      cleanup();
      return;
    }

    // Next turn
    game.currentTurn = isX ? "O" : "X";
    const nextPlayer = game.currentTurn === "X" ? game.playerX : game.playerO;

    await conn.sendMessage(from, {
      text: `@${nextPlayer.split("@")[0]}, ɪᴛ's ʏᴏᴜʀ ᴛᴜʀɴ! ʏᴏᴜ ᴀʀᴇ ${game.currentTurn === "X" ? "❌" : "⭕"}\n${drawBoard()}\n\n_ʀᴇᴘʟʏ ᴡɪᴛʜ ᴀ ɴᴜᴍʙᴇʀ (1-9) ᴛᴏ ᴘʟᴀʏ ʏᴏᴜʀ ᴍᴏᴠᴇ._`,
      mentions: [nextPlayer]
    }, { quoted: msg });
  };

  conn.ev.on("messages.upsert", game.handler);
  activeGames[from] = game;
});
