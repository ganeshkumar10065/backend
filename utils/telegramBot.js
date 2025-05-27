const axios = require('axios');
const { BOT_TOKEN, CHAT_ID } = require('../config/telegram');

let totalSearches = 0;

async function sendTelegramMessage(message) {
    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const response = await axios.post(url, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });
        console.log('Telegram message sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Telegram message error:', error.message);
        throw error; // Re-throw the error to handle it in the calling function
    }
}

function formatUserDetails(userData) {
    return `
🔍 <b>New User Search</b>

👤 <b>Username:</b> ${userData.username}
📝 <b>Full Name:</b> ${userData.full_name}
📊 <b>Stats:</b>
   • Posts: ${userData.edge_owner_to_timeline_media?.count || 0}
   • Followers: ${userData.edge_followed_by?.count || 0}
   • Following: ${userData.edge_follow?.count || 0}

🔒 <b>Account Type:</b> ${userData.is_private ? 'Private' : 'Public'}
✅ <b>Verified:</b> ${userData.is_verified ? 'Yes' : 'No'}
💼 <b>Business Account:</b> ${userData.is_business_account ? 'Yes' : 'No'}

📈 <b>Total Searches:</b> ${++totalSearches}
⏰ <b>Time:</b> ${new Date().toLocaleString()}
    `;
}

function sendUserSearchLog(userData) {
    const message = formatUserDetails(userData);
    sendTelegramMessage(message);
}

function sendErrorLog(error, username) {
    const message = `
❌ <b>Error Occurred</b>

🔍 <b>Username:</b> ${username}
⚠️ <b>Error:</b> ${error.message}
⏰ <b>Time:</b> ${new Date().toLocaleString()}
    `;
    sendTelegramMessage(message);
}

module.exports = {
    sendUserSearchLog,
    sendErrorLog,
    totalSearches,
    sendTelegramMessage
}; 