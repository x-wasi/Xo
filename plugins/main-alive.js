
const config = require('../config')
const {cmd , commands} = require('../command')



cmd({
    pattern: "test",
    alias: ["alive"],
    desc: "Check bot online or no.",
    category: "main",
    react: "👋",
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
 

 
 const botname = "𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃"; //add your name
 const ownername = "ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ"; // add your name
 const subzero = { 
 key: { 
  remoteJid: 'status@broadcast', 
  participant: '0@s.whatsapp.net' 
   }, 
message:{ 
  newsletterAdminInviteMessage: { 
    newsletterJid: '120363401051937059@newsletter', //add your channel jid
    newsletterName: "𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃", //add your bot name
    caption: '*ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*', 
    inviteExpiration: 0
  }
 }
}



let des = `*👋 Hello ${pushname}*`
return await conn.sendMessage(from,{
    image: {url: `https://files.catbox.moe/w1l8b0.jpg`},
    caption: des
},{quoted: subzero})

// {quoted: mek} ඔයාලගෙ ඔතන 👈 ඔහොම ඇත්තෙ එක උඩ විදිහට හදා ගන්න..👆

}catch(e){
console.log(e)
reply(`${e}`)
}
})
