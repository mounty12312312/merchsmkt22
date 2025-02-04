const TelegramBot = require('node-telegram-bot-api');

// Замените 'YOUR_BOT_TOKEN' на токен вашего бота
const bot = new TelegramBot('7944647334:AAGRvJyxU0L3qKDfpNsyTP8siuSz64U4gIg', { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Открыть магазин',
                        web_app: { url: 'symphonious-druid-f45018.netlify.app' }
                    }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, 'Нажмите кнопку, чтобы открыть магазин:', options);
});