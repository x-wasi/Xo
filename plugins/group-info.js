const config = require('../config')
const { cmd } = require('../command')
const { fetchJson } = require('../lib/functions')

cmd({
    pattern: "ginfo",
    react: "🥏",
    alias: ["groupinfo"],
    desc: "Get group informations.",
    category: "group",
    use: '.ginfo',
    filename: __filename
},
async (conn, mek, m, {
    from, isGroup, isAdmins, isBotAdmins, participants, groupMetadata, reply, isDev, isOwner
}) => {
    try {
        // Messages par défaut
        let msr = {
            only_gp: "ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.",
            you_adm: "ʏᴏᴜ ᴍᴜsᴛ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ ᴛᴏ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.",
            give_adm: "ᴘʟᴇᴀsᴇ ᴍᴀᴋᴇ ᴛʜᴇ ʙᴏᴛ ᴀᴅᴍɪɴ ғɪʀsᴛ."
        }

        // Essaye de charger les messages personnalisés
        try {
            const res = await fetchJson('https://raw.githubusercontent.com/JawadTech3/KHAN-DATA/refs/heads/main/MSG/mreply.json')
            if (res?.replyMsg) msr = res.replyMsg
        } catch (e) {
            console.log('⚠️ Failed to load remote messages, using default ones.')
        }

        if (!isGroup) return reply(msr.only_gp)
        if (!isAdmins && !isDev && !isOwner) return reply(msr.you_adm)
        if (!isBotAdmins) return reply(msr.give_adm)

        // Récupération de la photo du groupe
        let ppUrl
        try {
            ppUrl = await conn.profilePictureUrl(from, 'image')
        } catch {
            ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png'
        }

        const metadata = await conn.groupMetadata(from)
        const groupAdmins = participants.filter(p => p.admin)
        const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n')
        const owner = metadata.owner || groupAdmins[0]?.id || 'unknown'

        const gdata = `*「 Group Information 」*

*ɢʀᴏᴜᴘs ɴᴀᴍᴇ:* ${metadata.subject}
*ɢʀᴏᴜᴘ ᴊɪᴅ:* ${metadata.id}
*ᴘᴀʀᴛɪᴄɪᴘᴀɴᴛs:* ${metadata.size}
*ɢʀᴏᴜᴘ ᴏᴡɴᴇʀ:* ${owner !== 'unknown' ? '@' + owner.split('@')[0] : 'unknown'}
*Description:* ${metadata.desc?.toString() || 'undefined'}

*ᴀᴅᴍɪɴs:*
${listAdmin}
        `

        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption: gdata,
            mentions: groupAdmins.map(a => a.id).concat(owner !== 'unknown' ? [owner] : [])
        }, { quoted: mek })

    } catch (e) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        console.log(e)
        reply(`❌ *Error Accurated !!*\n\n${e}`)
    }
})
