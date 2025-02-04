const cors = require('cors');
app.use(cors());
const express = require('express');
const app = express();
app.use(express.json());

// Замените на ваш API-ключ Google Sheets
const GOOGLE_SHEETS_API_KEY = 'AIzaSyD3VdbFCIoTegcom2ZFdvpNTm5HzzouOd8';
const SPREADSHEET_ID = '1iglIpBZiTQoxfZ6fJwTEX8sAQUQ-mZowaKuWyKu7920';

// Получение списка товаров
app.get('/api/products', async (req, res) => {
    try {
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Products?key=${GOOGLE_SHEETS_API_KEY}`
        );
        const data = await response.json();

        // Преобразуем данные в удобный формат
        const products = data.values.slice(1).map(row => ({
            id: row[0],
            name: row[1],
            description: row[2],
            price: row[3],
            image_url: row[4]
        }));

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении данных' });
    }
});

// Получение баланса пользователя
app.get('/api/user/:telegramId', async (req, res) => {
    const telegramId = req.params.telegramId;

    try {
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Users?key=${GOOGLE_SHEETS_API_KEY}`
        );
        const data = await response.json();

        const user = data.values.find(row => row[0] === telegramId);
        if (user) {
            res.json({ balance: user[1] });
        } else {
            res.json({ balance: 0 }); // Новый пользователь
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении данных' });
    }
});

// Обработка покупки
app.post('/api/buy', async (req, res) => {
    const { telegramId, productId } = req.body;

    try {
        // Получаем данные пользователя
        const userResponse = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Users?key=${GOOGLE_SHEETS_API_KEY}`
        );
        const userData = await userResponse.json();
        const user = userData.values.find(row => row[0] === telegramId);

        if (!user) {
            return res.json({ success: false, message: 'Пользователь не найден' });
        }

        const balance = parseInt(user[1]);
        const productResponse = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Products?key=${GOOGLE_SHEETS_API_KEY}`
        );
        const productData = await productResponse.json();
        const product = productData.values.find(row => row[0] === productId);

        if (!product) {
            return res.json({ success: false, message: 'Товар не найден' });
        }

        const price = parseInt(product[3]);
        if (balance < price) {
            return res.json({ success: false, message: 'Недостаточно средств' });
        }

        // Обновляем баланс пользователя
        const newBalance = balance - price;
        const updateResponse = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate?key=${GOOGLE_SHEETS_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requests: [
                        {
                            updateCells: {
                                rows: [{ values: [{ userEnteredValue: { numberValue: newBalance } }] }],
                                fields: 'userEnteredValue',
                                start: { sheetId: 0, rowIndex: userData.values.indexOf(user), colIndex: 1 }
                            }
                        }
                    ]
                })
            }
        );

        if (!updateResponse.ok) {
            return res.json({ success: false, message: 'Ошибка при обновлении баланса' });
        }

        // Добавляем запись о покупке
        const purchaseResponse = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Purchases:append?key=${GOOGLE_SHEETS_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    values: [[Date.now(), telegramId, productId, 1]]
                })
            }
        );

        if (!purchaseResponse.ok) {
            return res.json({ success: false, message: 'Ошибка при записи покупки' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при обработке покупки' });
    }
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));