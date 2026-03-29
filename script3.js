const fetch = require('node-fetch');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, maxRetries, baseDelay) {
    if (maxRetries === undefined) maxRetries = 3;
    if (baseDelay === undefined) baseDelay = 800;
    
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log('Попытка ' + attempt + ' из ' + maxRetries + ' для: ' + url);
        
        try {
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                console.log('УСПЕХ! Попытка ' + attempt + ' завершена');
                console.log('Получено продуктов: ' + (data.products ? data.products.length : 1));
                console.log('');
                return data;
            }
            
            if (response.status >= 400 && response.status < 500) {
                throw new Error('Клиентская ошибка ' + response.status + ' - повторять бесполезно');
            }
            
            if (response.status >= 500) {
                throw new Error('Серверная ошибка ' + response.status + ' - пробуем снова');
            }
            
            throw new Error('Неизвестный статус: ' + response.status);
            
        } catch (error) {
            lastError = error;
            console.log('Ошибка: ' + error.message);
            
            if (attempt === maxRetries) {
                console.log('Все ' + maxRetries + ' попыток исчерпаны');
                console.log('');
                break;
            }
            
            const waitTime = baseDelay * attempt;
            console.log('Ожидание ' + waitTime + ' мс перед следующей попыткой...');
            await sleep(waitTime);
        }
    }
    
    throw lastError;
}

console.log('Запуск демонстрации повторных попыток');
console.log('');

console.log('ТЕСТ: Успешный запрос (задержка 1500мс)');
fetchWithRetry('https://dummyjson.com/products?delay=1500&limit=3', 3, 800)
    .then(() => console.log('Тест завершен'))
    .catch(() => console.log('Тест провален'));