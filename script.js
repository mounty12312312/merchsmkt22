document.addEventListener('DOMContentLoaded', async () => {
    // Инициализация Telegram Web App
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
    const userBalance = await fetchUserBalance(telegramId);
    balanceElement.textContent = `Баланс: ${userBalance}`;

    // Загружаем список товаров
    const products = await fetchProducts();
    displayProducts(products);

    // Функция для получения баланса пользователя
    async function fetchUserBalance(telegramId) {
        const response = await fetch(`/api/user/${telegramId}`);
        const data = await response.json();
        return data.balance || 0;
    }

    // Функция для загрузки товаров
    async function fetchProducts() {
        const response = await fetch('/api/products');
        const data = await response.json();
        return data;
    }

    // Функция для отображения товаров
    function displayProducts(products) {
        const productList = document.getElementById('product-list');
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
        const response = await fetch('/api/buy', {
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
    };
});