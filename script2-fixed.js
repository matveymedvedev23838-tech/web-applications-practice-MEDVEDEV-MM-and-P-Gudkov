const fetch = require('node-fetch');

async function fetchWithTimeout(url, timeoutMs) {
    let timeoutId;
    
    const timeoutPromise = new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error('Таймаут ' + timeoutMs + ' мс'));
        }, timeoutMs);
    });
    
    const fetchPromise = fetch(url);
    
    try {
        console.log('Запрос к: ' + url);
        console.log('Таймаут: ' + timeoutMs + ' мс');
        
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            console.log('Статус ответа: ' + response.status);
            console.log('Тело ответа: ' + await response.text());
            throw new Error('HTTP ошибка: ' + response.status);
        }
        
        const data = await response.json();
        console.log('УСПЕХ! Получено ' + (data.products ? data.products.length : 1) + ' продуктов\n');
        
        return data;
        
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('Результат: ' + error.message + '\n');
        return null;
    }
}

console.log('Запуск демонстрации таймаутов');
console.log('');

console.log('ТЕСТ 1: обычный запрос без задержки, таймаут 5000мс (должен успеть)');
fetchWithTimeout('https://dummyjson.com/products?limit=2', 5000);

setTimeout(() => {
    console.log('ТЕСТ 2: запрос с большой задержкой, таймаут 3000мс (должен отмениться)');
    fetchWithTimeout('https://dummyjson.com/products?limit=2', 3000);
}, 2000);