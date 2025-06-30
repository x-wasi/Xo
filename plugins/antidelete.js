const { cmd } = require('../command');
const { getAnti, setAnti } = require('../data/antidel');

cmd({
    pattern: "antidelete",
    alias: ['antidel', 'del'],
    desc: "Toggle anti-delete feature",
    category: "misc",
    filename: __filename
},
async (conn, mek, m, { from, reply, text, isCreator }) => {
    if (!isCreator) return reply('ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ');
    
    try {
        const currentStatus = await getAnti();
        
        if (!text || text.toLowerCase() === 'status') {
            return reply(`*ᴀɴᴛɪᴅᴇʟᴇᴛᴇ sᴛᴀᴛᴜs:* ${currentStatus ? '✅ ON' : '❌ OFF'}\n\nUsage:\n• .ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴏɴ - ᴇɴᴀʙʟᴇ\n• .ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴏғғ - ᴅɪsᴀʙʟᴇ`);
        }
        
        const action = text.toLowerCase().trim();
        
        if (action === 'on') {
            await setAnti(true);
            return reply('✅ ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ ʜᴀs ʙᴇᴇɴ ᴇɴᴀʙʟᴇᴅ sᴜᴄᴄᴇssғᴜʟ');
        } 
        else if (action === 'off') {
            await setAnti(false);
            return reply('❌ ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ ʜᴀs ʙᴇᴇɴ ᴅɪsᴀʙʟᴇᴅ');
        } 
        else {
            return reply('ɪɴᴠᴀʟɪᴅ ᴄᴏᴍᴍᴀɴᴅ. ᴜsᴀɢᴇ:\n• .ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴏɴ\n• .ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴏғғ\n• .ᴀɴᴛɪᴅᴇʟᴇᴛᴇ sᴛᴀᴛᴜs');
        }
    } catch (e) {
        console.error("ᴇʀʀᴏʀ ɪɴ ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴄᴏᴍᴍᴀɴᴅ:", e);
        return reply("An error occurred while processing your request.");
    }
});
