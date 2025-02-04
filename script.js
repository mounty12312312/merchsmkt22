// Замените 'https://your-domain.com' на реальный URL вашего сервера
const API_URL = 'https://parseapi.back4app.com';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Скрипт загружен!');

    const tg = window.Telegram.WebApp;
    tg.ready();

    // Получаем данные пользователя
    const user = tg.initDataUnsafe.user;
    if (!user) {
        alert('Не удалось получить данные пользователя.');
        return;
    }
    const telegramId = user.id;

    // Отображаем баланс пользователя
    const balanceElement = document.getElementById('balance');
    try {
        console.log('Запрос баланса для пользователя:', telegramId);
        const userBalance = await fetchUserBalance(telegramId);
        console.log('Баланс получен:', userBalance);
        balanceElement.textContent = `Баланс: ${userBalance}`;
    } catch (error) {
        console.error('Ошибка при загрузке баланса:', error.message);
        balanceElement.textContent = 'Ошибка загрузки баланса';
    }

    // Загружаем список товаров
    try {
        console.log('Запрос списка товаров...');
        const products = await fetchProducts();
        console.log('Товары получены:', products);
        displayProducts(products);
    } catch (error) {
        console.error('Ошибка при загрузке товаров:', error.message);
        document.getElementById('product-list').innerHTML = '<li>Ошибка загрузки товаров</li>';
    }
});

// Функция для получения баланса пользователя
async function fetchUserBalance(telegramId) {
    const response = await fetch(`${API_URL}/api/user/${telegramId}`);
    if (!response.ok) {
        throw new Error('Ошибка при получении баланса');
    }
    const data = await response.json();
    return data.balance || 0;
}

// Функция для загрузки товаров
async function fetchProducts() {
    const response = await fetch(`${API_URL}/api/products`);
    if (!response.ok) {
        throw new Error('Ошибка при загрузке товаров');
    }
    const data = await response.json();
    return data;
}

// Функция для отображения товаров
function displayProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = ''; // Очищаем список
    products.forEach(product => {
        const li = document.createElement('li');
        li.className = 'product-item';

        li.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p class="price">${product.price} монет</p>
            <button onclick="buyProduct(${product.id}, ${telegramId})">Купить</button>
        `;

        productList.appendChild(li);
    });
}

// Глобальная функция для покупки товара
window.buyProduct = async (productId, telegramId) => {
    try {
        const response = await fetch(`${API_URL}/api/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId, productId })
        });

        const result = await response.json();
        if (result.success) {
            alert('Покупка успешна!');
            location.reload(); // Обновляем страницу
        } else {
            alert('Недостаточно средств!');
        }
    } catch (error) {
        console.error('Ошибка при покупке:', error.message);
        alert('Ошибка при покупке');
    }
};