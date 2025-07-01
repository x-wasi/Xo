const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '../data/groupMessages.json');

function loadSettings() {
    try {
        if (!fs.existsSync(FILE_PATH)) return {};
        const raw = fs.readFileSync(FILE_PATH);
        return JSON.parse(raw);
    } catch (err) {
        console.error('Failed to load groupMessages.json:', err);
        return {};
    }
}

function saveSettings(data) {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Failed to save groupMessages.json:', err);
    }
}

function setWelcomeMessage(groupId, message) {
    const data = loadSettings();
    data.welcome = data.welcome || {};
    data.welcome[groupId] = { message };
    saveSettings(data);
}

function setGoodbyeMessage(groupId, message) {
    const data = loadSettings();
    data.goodbye = data.goodbye || {};
    data.goodbye[groupId] = { message };
    saveSettings(data);
}

function removeWelcomeMessage(groupId) {
    const data = loadSettings();
    if (data.welcome && data.welcome[groupId]) {
        delete data.welcome[groupId];
        saveSettings(data);
    }
}

function removeGoodbyeMessage(groupId) {
    const data = loadSettings();
    if (data.goodbye && data.goodbye[groupId]) {
        delete data.goodbye[groupId];
        saveSettings(data);
    }
}

module.exports = {
    loadSettings,
    setWelcomeMessage,
    setGoodbyeMessage,
    removeWelcomeMessage,
    removeGoodbyeMessage,
};
