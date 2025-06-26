const { cmd } = require('../command')

// In-memory configs
const antiMentionSettings = new Map()
const warnCounters = new Map()

// .antigpmention [warn/remove/counter]
cmd({
  pattern: "antigpmention",
  alias: ["agpm"],
  desc: "Enable anti group status mention system.",
  react: "🔒",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, args, reply }) => {
  if (!isGroup) return reply("❌ This command can only be used in groups.")
  if (!isAdmins) return reply("❌ Only group admins can use this command.")

  const mode = (args[0] || "").toLowerCase()
  if (!["warn", "remove", "counter"].includes(mode))
    return reply("⚠️ Usage: .antigpmention [warn|remove|counter]")

  antiMentionSettings.set(from, mode)
  reply(`✅ Anti group mention activated in *${mode.toUpperCase()}* mode.`)
})

// .agpmoff
cmd({
  pattern: "agpmoff",
  desc: "Disable anti group status mention system.",
  react: "🔕",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, reply }) => {
  if (!isGroup) return reply("❌ This command can only be used in groups.")
  if (!isAdmins) return reply("❌ Only group admins can use this command.")

  antiMentionSettings.delete(from)
  reply("🚫 Anti group mention has been *disabled*.")
})

// 👀 Listen to group status mention
cmd({
  on: "messages.upsert",
  filename: __filename
}, async (conn, m, store, { ms, isGroup, sender, isAdmins }) => {
  try {
    if (!isGroup) return
    if (!ms?.message?.groupStatusMentionMessage) return
    if (isAdmins || ms.key.fromMe) return

    const mode = antiMentionSettings.get(m.chat)
    if (!mode) return

    const senderId = sender || ms.key.participant
    const keyMsg = {
      remoteJid: m.chat,
      fromMe: false,
      id: ms.key.id,
      participant: senderId
    }

    if (mode === "remove") {
      await conn.groupParticipantsUpdate(m.chat, [senderId], "remove")
      await conn.sendMessage(m.chat, { delete: keyMsg })
      await conn.sendMessage(m.chat, {
        text: `⛔ @${senderId.split("@")[0]} has been removed for status mention.`,
        mentions: [senderId]
      })
    }

    else if (mode === "warn") {
      await conn.sendMessage(m.chat, { delete: keyMsg })
      await conn.sendMessage(m.chat, {
        text: `⚠️ @${senderId.split("@")[0]}, do not mention the group status.`,
        mentions: [senderId]
      })
    }

    else if (mode === "counter") {
      const key = `${m.chat}:${senderId}`
      const current = (warnCounters.get(key) || 0) + 1
      warnCounters.set(key, current)
      const max = 3

      if (current >= max) {
        await conn.sendMessage(m.chat, {
          text: `⛔ @${senderId.split("@")[0]} has been removed after ${max} warnings.`,
          mentions: [senderId]
        })
        await conn.groupParticipantsUpdate(m.chat, [senderId], "remove")
        await conn.sendMessage(m.chat, { delete: keyMsg })
        warnCounters.delete(key)
      } else {
        await conn.sendMessage(m.chat, {
          text: `⚠️ @${senderId.split("@")[0]} Warning ${current}/${max}`,
          mentions: [senderId]
        })
        await conn.sendMessage(m.chat, { delete: keyMsg })
      }
    }
  } catch (err) {
    console.error("AntiGPMention error:", err)
  }
})
