import { exit } from 'process';
import { config } from 'dotenv';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
config({ path: path.resolve(__dirname, '../', envFile) }); // Путь к корню проекта

const CONFIG = {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    adminCredentials: {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
    },
    colors: {
        reset: '\x1b[0m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        red: '\x1b[31m',
        cyan: '\x1b[36m',
    },
};

let sessionCookie = null;

const CATEGORIES_LIST = [
    '3D стикер',
    'Акриловый значок',
    'Аксессуар',
    'Билет',
    'Блок для заметок',
    'Блокнот',
    'Браслет',
    'Брелки парные',
    'Брелок',
    'Брелок-конфета',
    'Брелок-кучеряшка',
    'Брелок-пищалка',
    'Брелок-шейкер',
    'Брошь',
    'Гача',
    'Гирлянда',
    'Зажигалка',
    'Закладка',
    'Заколка',
    'Зеркало',
    'Зин',
    'Значок',
    'Игрушка',
    'Календарь',
    'Карта',
    'Карточки',
    'Картхолдер',
    'Коврик для мыши',
    'Колье',
    'Кольцо',
    'Комикс',
    'Кошелек',
    'Кружка',
    'Кубарики',
    'Лайтбук',
    'Лента',
    'Линогравюра',
    'Ловец солнца',
    'Ловец радуги',
    'Магнит',
    'Магнитик',
    'Моносерьга',
    'Набор значков',
    'Набор принтов',
    'Набор стикеров',
    'Наклейка на карту',
    'Нашивка',
    'Носочки',
    'Обложка на паспорт',
    'Обложка на студенческий',
    'Открытка',
    'Пенал',
    'Переводное тату',
    'Переливашка',
    'Пиала',
    'Пин',
    'Плакат',
    'Плюшевый брелок',
    'Плюшевый брелок-конфета',
    'Повязка на голову',
    'Подвес',
    'Подвеска',
    'Подсвечник',
    'Постер',
    'Принт',
    'Своп карта',
    'Секретный конверт',
    'Сережки',
    'Сквиш',
    'Скетчбук',
    'Скотч',
    'Соусник',
    'Стенд',
    'Стикер',
    'Стикерпак',
    'Стикеры парные',
    'СТМ',
    'Тарелка',
    'Фигурка',
    'Футболка',
    'Холст',
    'Шкатулка',
    'Шоппер',
];

async function request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (sessionCookie) headers['Cookie'] = sessionCookie;

    try {
        const res = await fetch(`${CONFIG.baseUrl}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        const setCookie = res.headers.getSetCookie?.() || [res.headers.get('set-cookie')];
        const token = setCookie.find((c) => c?.includes('payload-token'));
        if (token) sessionCookie = token.split(';')[0];

        let data = {};
        try {
            data = await res.json();
        } catch {
            data = { text: await res.text() };
        }

        return { status: res.status, data };
    } catch (e) {
        return { status: 0, data: { error: e.message } };
    }
}

async function seedCategories() {
    console.log(`${CONFIG.colors.cyan}=== ЗАПУСК СКРИПТА ИМПОРТА КАТЕГОРИЙ ===${CONFIG.colors.reset}\n`);

    // 1. Вход под админом
    console.log(`[1/2] Авторизация админа (${CONFIG.adminCredentials.email})...`);
    const adminLogin = await request('POST', '/api/users/login', CONFIG.adminCredentials);

    if (adminLogin.status !== 200) {
        console.error(`${CONFIG.colors.red}Ошибка входа: ${JSON.stringify(adminLogin.data)}${CONFIG.colors.reset}`);
        return;
    }
    console.log(`${CONFIG.colors.green}  [+] Сессия получена${CONFIG.colors.reset}\n`);

    // 2. Создание категорий
    console.log(`[2/2] Создание категорий (${CATEGORIES_LIST.length} шт.)...`);

    let createdCount = 0;
    let errorCount = 0;

    for (const categoryLabel of CATEGORIES_LIST) {
        const payload = {
            label: categoryLabel,
            // Поле 'value' сгенерируется автоматически вашим hook: beforeChange
        };

        const res = await request('POST', '/api/categories', payload);

        if (res.status === 201) {
            console.log(`  ${CONFIG.colors.green}✔${CONFIG.colors.reset} ${categoryLabel}`);
            createdCount++;
        } else {
            // Если категория уже существует (unique constraint), Payload вернет 400 или 422
            const errorMsg = res.data.errors?.[0]?.message || 'Ошибка';
            console.log(`  ${CONFIG.colors.red}✘${CONFIG.colors.reset} ${categoryLabel} (${res.status}: ${errorMsg})`);
            errorCount++;
        }
    }

    console.log(`\n${CONFIG.colors.cyan}=== ИТОГИ ===${CONFIG.colors.reset}`);
    console.log(`Создано: ${CONFIG.colors.green}${createdCount}${CONFIG.colors.reset}`);
    console.log(`Ошибок/Дублей: ${CONFIG.colors.red}${errorCount}${CONFIG.colors.reset}`);

    exit(0);
}

seedCategories();
