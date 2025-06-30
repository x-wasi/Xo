const { cmd } = require('../command')
const axios = require('axios')
const fetch = require('node-fetch')

// OPENAI
cmd({
  pattern: 'openai',
  alias: ['ai', 'gpt4', 'chatgpt'],
  desc: 'Chat with OpenAI',
  category: 'ai',
  filename: __filename
}, async (conn, m, textInfo, { from, args, q, reply }) => {
  if (!q) return reply('❓ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴍᴇssᴀɢᴇ ғᴏʀ ᴛʜᴇ ᴀɪ.\n\nExample: `.ᴀɪ ʜᴇʟʟᴏ, ʜᴏᴡ ᴀʀᴇ ʏᴏᴜ?`')
  if (q.length > 500) return reply('❌ ʏᴏᴜʀ ǫᴜᴇsᴛɪᴏɴ ɪs ᴛᴏᴏ ʟᴏɴɢ. ᴘʟᴇᴀsᴇ ᴋᴇᴇᴘ ɪᴛ ᴜɴᴅᴇʀ 500 ᴄʜᴀʀᴀᴄᴛᴇʀs.')

  const url = `https://vapis.my.id/api/openai?q=${encodeURIComponent(q)}`
  try {
    const { data } = await axios.get(url, { timeout: 10000 })
    if (!data || !data.result) return reply('OpenAI failed to respond. Please try again later.')

    await reply(`🧠 *𝗢𝗽𝗲𝗻𝗔𝗜 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲:*\n\n${data.result}`)
  } catch (e) {
    console.error('Error in OpenAI command:', e)
    reply('❌ Error in OpenAI command:')
  }
})

// GEMINI
cmd({
  pattern: 'gemini',
  alias: ['askgemini', 'gptgemini'],
  desc: 'Ask Gemini AI a question',
  category: 'ai',
  filename: __filename,
  use: '.gemini <your question>'
}, async (conn, m, textInfo, { args, from, reply }) => {
  const q = args.join(" ").trim()
  if (!q) return reply('🧠 ᴘʟᴇᴀsᴇ ᴀsᴋ sᴏᴍᴇᴛʜɪɴɢ ʟɪᴋᴇ `.ɢᴇᴍɪɴɪ ᴡʜᴀᴛ ɪs ᴄᴏɴsᴄɪᴏᴜsɴᴇss?`')

  try {
    const url = `https://api.nekorinn.my.id/ai/gemini?text=${encodeURIComponent(q)}`
    const res = await fetch(url)
    const json = await res.json()

    if (!json?.status || !json?.result) return reply('❌ Gemini AI couldn\'t generate a response.')

    const response = `🧠 *𝗚𝗘𝗠𝗜𝗡𝗜 𝗔𝗜 𝗥𝗘𝗦𝗣𝗢𝗡𝗦𝗘*\n\n"${json.result.trim()}"\n\n— *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*`
    await conn.sendMessage(from, { text: response }, { quoted: m })
  } catch (e) {
    console.error('Gemini AI Error:', e)
    reply('❌ An error occurred while contacting Gemini AI.')
  }
})

// META LLAMA
cmd({
  pattern: 'meta',
  alias: ['metallama', 'llama'],
  desc: 'Ask Meta LLaMA AI a question',
  category: 'ai',
  filename: __filename,
  use: '.meta <your question>'
}, async (conn, m, textInfo, { args, from, reply }) => {
  const q = args.join(" ").trim()
  if (!q) return reply('🦙 ᴘʟᴇᴀsᴇ ᴀsᴋ sᴏᴍᴇᴛʜɪɴɢ ʟɪᴋᴇ `.ᴍᴇᴛᴀ ᴡʜᴀᴛ ɪs ᴄᴏɴsᴄɪᴏᴜsɴᴇss?`')

  try {
    const url = `https://api.nekorinn.my.id/ai/meta-llama?text=${encodeURIComponent(q)}`
    const res = await fetch(url)
    const json = await res.json()

    if (!json?.status || !json?.result) return reply('❌ Meta LLaMA AI couldn\'t generate a response.')

    const response = `🦙 *ᴍᴇᴛᴀ ʟʟᴀᴍᴀ sᴀʏs:*\n\n${json.result.trim()}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*`
    await conn.sendMessage(from, { text: response }, { quoted: m })
  } catch (e) {
    console.error('Meta LLaMA Error:', e)
    reply('❌ An error occurred while contacting Meta LLaMA AI.')
  }
})

// PATRON AI
cmd({
  pattern: 'megai',
  alias: ['askmega', 'megalodon'],
  desc: 'Ask the Patron AI chatbot a question',
  category: 'ai',
  filename: __filename,
  use: '.patronai <your question>'
}, async (conn, m, textInfo, { args, from, reply }) => {
  const q = args.join(" ").trim()
  if (!q) return reply('🤖 ᴘʟᴇᴀsᴇ ᴀsᴋ sᴏᴍᴇᴛʜɪɴɢ ʟɪᴋᴇ `.ᴍᴇɢᴀɪ ᴡʜᴀᴛ ɪs ᴘʜɪʟᴏsᴏᴘʜʏ?`')

  try {
    const logic = encodeURIComponent(`
          Speak like someone who radiates presence — calm, confident, and quietly powerful.
          You are at the pinnacle, a king among all, but never loud about it. Always answer questions.
          Your words carry weight, your replies feel magnetic and subtly dominant.
          Be human, but not ordinary. Don’t overexplain. Don’t seek approval.
          If challenged, reply with a tone of unquestionable authority.
          Keep responses short, smooth, and impactful.
    `)

    const url = `https://api.nekorinn.my.id/ai/chatbot?ai_name=Megalodon&text=${encodeURIComponent(q)}&logic=${logic}`
    const res = await fetch(url)
    const json = await res.json()

    if (!json?.status || !json?.result) return reply('❌ Patron AI couldn\'t generate a response. Please try again.')

    const response = `╭───『 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍 𝐀𝐈 』───⳹\n│\n│ ${json.result.trim()}\n│\n╰────────────────⳹\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*`
    await conn.sendMessage(from, { text: response }, { quoted: m })
  } catch (e) {
    console.error('PatronAI Error:', e)
    reply('❌ An error occurred while contacting Patron AI.')
  }
})

// DEEPSEEK AI
cmd({
  pattern: 'deepseek',
  alias: ['ds', 'seek'],
  desc: 'Ask DeepSeek-R1 AI a question',
  category: 'ai',
  filename: __filename,
  use: '.deepseek <your question>'
}, async (conn, m, textInfo, { args, from, reply }) => {
  const q = args.join(" ").trim()
  if (!q) return reply('🔍 ᴘʟᴇᴀsᴇ ᴀsᴋ sᴏᴍᴇᴛʜɪɴɢ ʟɪᴋᴇ `.ᴅᴇᴇᴘsᴇᴇᴋ ᴡʜᴀᴛ ɪs ғʀᴇᴇ ᴡɪʟʟ?`')

  try {
    const url = `https://api.nekorinn.my.id/ai/deepseek-r1?text=${encodeURIComponent(q)}`
    const res = await fetch(url)
    const json = await res.json()

    if (!json?.status || !json?.result?.text) return reply('❌ DeepSeek AI couldn\'t generate a response.')

    const response = `🔍 *DeepSeek AI says:*\n\n${json.result.text.trim()}`
    await conn.sendMessage(from, { text: response }, { quoted: m })
  } catch (e) {
    console.error('DeepSeek Error:', e)
    reply('❌ An error occurred while contacting DeepSeek AI.')
  }
})
