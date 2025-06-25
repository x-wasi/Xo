const { cmd } = require('../command');
const { getAnti, setAnti } = require('../data/antidel');

cmd({
    pattern: "antidelete",
    alias: ['antidel'],
    desc: "Toggle anti-delete feature",
    category: "misc",
    filename: __filename
},
async (conn, mek, m, { from, reply, text, isCreator }) => {
    if (!isCreator) return reply('This ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ');
    
    try {
        const currentStatus = await getAnti();
        
        if (!text || text.toLowerCase() === 'status') {
            return reply(`*ᴀɴᴛɪᴅᴇʟᴇᴛᴇ sᴛᴀᴛᴜs:* ${currentStatus ? '✅ ON' : '❌ OFF'}\n\nUsage:\n• .ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴏɴ - ᴇɴᴀʙʟᴇ\n• .ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴏғғ - ᴅɪsᴀʙʟᴇ`);
        }
        
        const action = text.toLowerCase().trim();
        
        if (action === 'on') {
            await setAnti(true);
            return reply('✅ ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ ʜᴀs ʙᴇᴇɴ ᴇɴᴀʙʟᴇᴅ');
        } 
        else if (action === 'off') {
            await setAnti(false);
            return reply('❌ ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ ʜᴀs ʙᴇᴇɴ ᴅɪsᴀʙʟᴇᴅ');
        } 
        else {
            return reply('Invalid ᴄᴏᴍᴍᴀɴᴅ. ᴜsᴀɢᴇ:\n• .ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴏɴ\n• .ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴏғғ\n• .ᴀɴᴛɪᴅᴇʟᴇᴛᴇ sᴛᴀᴛᴜs');
        }
    } catch (e) {
        console.error("Error in antidelete command:", e);
        return reply("An error occurred while processing your request.");
    }
});
