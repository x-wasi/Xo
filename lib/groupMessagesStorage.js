const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../data/groupMessages.json');

function loadSettings() {
    if (!fs.existsSync(file)) return {};
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
        console.error("Failed to parse group_messages.json:", e);
        return {};
    }
}

function saveSettings(data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Failed to save group_messages.json:", e);
    }
}

module.exports = {
    loadSettings,
    saveSettings
};
