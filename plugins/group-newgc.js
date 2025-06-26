const { cmd } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;

cmd({
  pattern: "newgc",
  category: "group",
  desc: "Create a group with specified members.",
  filename: __filename,
  use: `${prefix}newgc GroupName number1,number2`,
  owner: true,
}, async (conn, mek, m, { body, sender, isOwner, reply }) => {
  try {
    if (!isOwner) return reply("❌ ᴏɴʟʏ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
    if (!body.includes(" ")) return reply(`Usage: ${prefix}ɴᴇᴡɢᴄ ɢʀᴏᴜᴘɴᴀᴍᴇ ɴᴜᴍʙᴇʀ1,ɴᴜᴍʙᴇʀ2`);

    const firstSpaceIndex = body.indexOf(" ");
    const groupName = body.slice(0, firstSpaceIndex).trim();
    const numbersRaw = body.slice(firstSpaceIndex + 1).trim();

    if (!groupName) return reply("❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ɢʀᴏᴜᴘ ɴᴀᴍᴇ.");
    if (groupName.length > 30) return reply("❌ ɢʀᴏᴜᴘ ɴᴀᴍᴇ ᴛᴏᴏ ʟᴏɴɢ (ᴍᴀx 30 ᴄʜᴀʀs).");

    // Nettoyer les numéros, garder uniquement chiffres, min 10 chiffres
    let numberList = numbersRaw.split(",")
      .map(n => n.trim().replace(/\D/g, ''))
      .filter(n => n.length >= 10);

    if (numberList.length === 0) return reply("❌ ᴘʀᴏᴠɪᴅᴇ ᴀᴛ ʟᴇᴀsᴛ ᴏɴᴇ ᴠᴀʟɪᴅ ᴘʜᴏɴᴇ ɴᴜᴍʙᴇʀ (ᴅɪɢɪᴛs ᴏɴʟʏ).");

    // Inclure le bot lui-même dans le groupe
    const me = sender.split("@")[0] + "@s.whatsapp.net";

    // Préparer participants, maximum 10 au moment de la création (limite WhatsApp)
    // On met le bot + au max 9 autres membres
    const participants = [me, ...numberList.slice(0, 9).map(n => n + "@s.whatsapp.net")];

    // Créer le groupe avec le bot + max 9 membres
    const group = await conn.groupCreate(groupName, participants);

    // Ajouter les autres membres (au-delà de 9) un par un
    const failedAdds = [];
    for (let i = 9; i < numberList.length; i++) {
      const jid = numberList[i] + "@s.whatsapp.net";
      try {
        await conn.groupParticipantsUpdate(group.id, [jid], "add");
      } catch (err) {
        failedAdds.push(numberList[i]);
      }
    }

    await conn.groupUpdateDescription(group.id, `Group created by @${sender.split('@')[0]}`);

    await conn.sendMessage(group.id, {
      text: `👋 *Welcome to ${groupName}!* Group created by @${sender.split('@')[0]}`,
      mentions: [sender]
    });

    let response = `╭━━━〔 *✅ 𝐆𝐑𝐎𝐔𝐏 𝐂𝐑𝐄𝐀𝐓𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘* 〕━━⬣
┃📛 *ɢʀᴏᴜᴘ ηαмє:* ${groupName}
┃👥 *мємвєяѕ α∂∂є∂:* ${numberList.length - failedAdds.length}
┃
┃📎 *ιηνιтαтιση ℓιηк:*
┃https://chat.whatsapp.com/${await conn.groupInviteCode(group.id)}
╰━━━━━━━━━━━━━━━━━━━━⬣

✨ тнє gяσυρ is ησω яєα∂у!
👤 уσυ αяє тнє ƒσυη∂єя.
🚀 ιηνιтє мσяє ρєσρℓє ωιтн тнє ℓιηк αвσνє.
`;

    if (failedAdds.length) {
      response += `\n⚠️ Failed to add these numbers:\n${failedAdds.join(", ")}`;
    }

    return reply(response);

  } catch (e) {
    console.error(e);
    return reply(`❌ *Erreur lors de la création du groupe !*\n\n*Détail:* ${e.message}`);
  }
});
