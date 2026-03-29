const fetch = require('node-fetch');
const { AbortController } = require('node-abort-controller');

let currentController = null;

async function searchProducts(query) {
    if (currentController) {
        currentController.abort();
        console.log('Отменен запрос: ' + query);
    }

    currentController = new AbortController();
    const signal = currentController.signal;

    try {
        console.log('Поиск: ' + query);
        
        const response = await fetch(
            'https://dummyjson.com/products/search?q=' + query + '&limit=3',
            { signal }
        );

        if (!response.ok) {
            throw new Error('HTTP ошибка: ' + response.status);
        }

        const data = await response.json();
        const productTitles = data.products.map(p => p.title);
        
        console.log('Результаты для "' + query + '": найдено ' + data.products.length + ' товаров');
        console.log(productTitles);
        console.log('');
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Запрос "' + query + '" был отменен\n');
        } else {
            console.error('Ошибка: ' + error.message + '\n');
        }
    }
}

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

console.log('Запуск демонстрации Debounce + AbortController');
console.log('');

const debouncedSearch = debounce(searchProducts, 700);

debouncedSearch('phone');
setTimeout(() => debouncedSearch('smart'), 200);
setTimeout(() => debouncedSearch('laptop'), 400);
setTimeout(() => debouncedSearch('headphones'), 1200);

setTimeout(() => {
    console.log('Демонстрация завершена');
}, 3000);