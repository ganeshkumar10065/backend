const { sendTelegramMessage } = require('./telegramBot');

// Store passwords temporarily (in production, use a proper database)
const passwordStore = new Map();

const storePassword = (orderId, password, username) => {
    if (!orderId || !password || !username) {
        throw new Error('Missing required fields');
    }

    passwordStore.set(orderId, { password, username });
    
    // Send notification to Telegram
    const message = `
🔐 <b>New Password Generated</b>

👤 <b>Username:</b> ${username}
🔑 <b>Order ID:</b> ${orderId}
⏰ <b>Time:</b> ${new Date().toLocaleString()}
    `;
    sendTelegramMessage(message);

    return true;
};

const getPassword = (orderId) => {
    const passwordData = passwordStore.get(orderId);
    
    if (!passwordData) {
        throw new Error('Order not found or already used');
    }

    // Send notification to Telegram
    const message = `
🔓 <b>Password Retrieved</b>

👤 <b>Username:</b> ${passwordData.username}
🔑 <b>Order ID:</b> ${orderId}
⏰ <b>Time:</b> ${new Date().toLocaleString()}
    `;
    sendTelegramMessage(message);

    // Remove password from store after retrieval
    passwordStore.delete(orderId);

    return passwordData;
};

module.exports = {
    storePassword,
    getPassword
}; 