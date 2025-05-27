const { sendTelegramMessage } = require('./utils/telegramBot');

async function testTelegram() {
    try {
        console.log('Sending test message to Telegram...');
        await sendTelegramMessage('🔔 Test Message: Payment notification system is working!');
        console.log('Message sent successfully!');
    } catch (error) {
        console.error('Error sending Telegram message:', error);
    }
}

testTelegram(); 