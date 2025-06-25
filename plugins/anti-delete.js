const config = require("../config");
const { cmd } = require('../command');
const { getAnti, setAnti, initializeAntiDeleteSettings } = require('../data/antidel');

initializeAntiDeleteSettings();

cmd({
    pattern: "antidelete",
    alias: ['antidel', 'antid'],
    desc: "Configure the AntiDelete system",
    category: "misc",
    filename: __filename
},
async (conn, mek, m, { reply, q, isOwner, from }) => {
    if (!isOwner) {
      return await conn.sendMessage(from, {
        text: "*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ-ᴏɴʟʏ ᴄᴏᴍᴍᴀɴᴅ.*"
      }, { quoted: mek });
    }
    try {
        const command = q?.toLowerCase();

        switch (command) {
            case 'on':
                await setAnti('gc', true);
                await setAnti('dm', true);
                return reply('_ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴇɴᴀʙʟᴇᴅ ғᴏʀ ɢʀᴏᴜᴘs ᴀɴᴅ ᴘʀɪᴠᴀᴛᴇ ᴍᴇssᴀɢᴇs._');

            case 'off gc':
                await setAnti('gc', false);
                return reply('_ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴅɪsᴀʙʟᴇᴅ ғᴏʀ ɢʀᴏᴜᴘs._');

            case 'off dm':
                await setAnti('dm', false);
                return reply('_ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴅɪsᴀʙʟᴇᴅ ғᴏʀ ᴘʀɪᴠᴀᴛᴇ ᴍᴇssᴀɢᴇs._');

            case 'set gc':
                const gcStatus = await getAnti('gc');
                await setAnti('gc', !gcStatus);
                return reply(`_ɢʀᴏᴜᴘ ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ɪs ɴᴏᴡ ${!gcStatus ? 'enabled' : 'disabled'}._`);

            case 'set dm':
                const dmStatus = await getAnti('dm');
                await setAnti('dm', !dmStatus);
                return reply(`_ᴅᴍ ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ɪs ɴᴏᴡ ${!dmStatus ? 'enabled' : 'disabled'}._`);

            case 'set all':
                await setAnti('gc', true);
                await setAnti('dm', true);
                return reply('_ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴇɴᴀʙʟᴇᴅ ғᴏʀ ᴀʟʟ ᴄʜᴀᴛs._');

            case 'status':
                const currentDmStatus = await getAnti('dm');
                const currentGcStatus = await getAnti('gc');
                return reply(`_ᴀɴᴛɪᴅᴇʟᴇᴛᴇ sᴛᴀᴛᴜs_\n\n*ᴅᴍ:* ${currentDmStatus ? 'Enabled' : 'Disabled'}\n*ɢʀᴏᴜᴘs:* ${currentGcStatus ? 'Enabled' : 'Disabled'}`);

            default:
                return reply(`-- *αηтι∂єℓєтє ¢σммαη∂ gυι∂є* --
• \`\`.ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴏɴ\`\` – ᴇɴᴀʙʟᴇ αηтι∂єℓєтє gℓσвαℓℓу
• \`\`.ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴏғғ ɢᴄ\`\` – ∂ιѕαвℓє ƒσя gяσυρ ¢нαтѕ
• \`\`.ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴏғғ ᴅᴍ\`\` – Disable for DMs
• \`\`.ᴀɴᴛɪᴅᴇʟᴇᴛᴇ sᴇᴛ ɢᴄ\`\` – Toggle for groups
• \`\`.ᴀɴᴛɪᴅᴇʟᴇᴛᴇ sᴇᴛ ᴅᴍ\`\` – Toggle for DMs
• \`\`.ᴀɴᴛɪᴅᴇʟᴇᴛᴇ sᴇᴛ ᴀʟʟ\`\` – ᴇɴᴀʙʟᴇ ғᴏʀ ᴀʟʟ ᴄʜᴀᴛs
• \`\`.ᴀɴᴛɪᴅᴇʟᴇᴛᴇ sᴛᴀᴛᴜs\`\` – ᴄʜᴇᴄᴋ ᴄᴜʀʀᴇɴᴛ sᴛᴀᴛᴜs`);
        }
    } catch (e) {
        console.error("AntiDelete error:", e);
        return reply("An error occurred while processing the command.");
    }
});
