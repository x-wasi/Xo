const { cmd } = require('../command');
const config = require('../config');


cmd({
    pattern: "anti-call",
    react: "💫",
    alias: ["anticall"],
    desc: "Enable or disable welcome messages for new members",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("*🫟σɴℓу тнє σωɴєʀ ¢αɴ ᴜѕє тнιѕ ¢σммαɴ∂!*");

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ANTI_CALL = "true";
        return reply("*✅ αɴтι-¢αℓℓ нαѕ вєєɴ єɴαвℓє∂*");
    } else if (status === "off") {
        config.ANTI_CALL = "false";
        return reply("*❌ αɴтι-¢αℓℓ нαѕ вєєɴ ∂ιѕαвℓє∂*");
    } else {
        return reply(`*🏷️ єχαмρℓє: αɴтι-¢αℓℓ σɴ/σff*`);
    }
});
