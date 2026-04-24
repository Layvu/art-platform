// node .\scripts\create-initial-data.mjs

import { exit } from 'process';
import { appendFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import { config } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
config({ path: path.resolve(__dirname, '../', envFile) }); // Путь к корню проекта

const CONFIG = {
    filePath: path.join(__dirname, process.env.EXCEL_FILE_PATH),
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    adminCredentials: {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
    },
    credsFile: path.join(__dirname, process.env.CREDS_LOG_PATH),
    fallbackUser: {
        fullName: process.env.FALLBACK_USER_NAME,
        email: process.env.FALLBACK_USER_EMAIL,
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
const authorCache = new Map();
const categoryCache = new Map();

const generatePassword = () => Math.random().toString(36).slice(-10) + 'A1!';

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

async function getCategoryId(label) {
    if (!label) return null;
    const cleanLabel = label.trim();
    if (categoryCache.has(cleanLabel)) return categoryCache.get(cleanLabel);

    const res = await request('GET', `/api/categories?where[label][equals]=${encodeURIComponent(cleanLabel)}`);
    if (res.status === 200 && res.data.docs?.length > 0) {
        const id = res.data.docs[0].id;
        categoryCache.set(cleanLabel, id);
        return id;
    }
    return null;
}

async function createProduct(row, authorId) {
    const nomenclatureLink = row[9]?.toString() || '';
    const retailPrice = parseFloat(row[5]) || 0;
    const nomenclatureCode = row[8]?.toString() || '';
    const stockBalance = parseInt(row[10]) || 0;

    const parts = nomenclatureLink.split(',').map((s) => s?.trim());
    const title = parts[0] || 'Без названия';
    const categoryLabel = parts[1];

    if (categoryLabel === 'Услуги') return;

    const categoryId = await getCategoryId(categoryLabel);

    const productData = {
        title,
        price: retailPrice,
        article1C: nomenclatureCode,
        quantity: stockBalance,
        author: authorId,
        category: categoryId,
        //status: 'published'
    };

    const res = await request('POST', '/api/products', productData);
    if (res.status === 201) {
        console.log(`${CONFIG.colors.green}  ✔ Товар: ${title}${CONFIG.colors.reset}`);
    } else {
        console.log(`${CONFIG.colors.red}  ✘ Ошибка товара "${title}": ${res.status}${CONFIG.colors.reset}`);
    }
}

async function runSeed() {
    console.log(`${CONFIG.colors.cyan}=== ЗАПУСК ИМПОРТА ===${CONFIG.colors.reset}\n`);

    const login = await request('POST', '/api/users/login', CONFIG.adminCredentials);
    if (login.status !== 200) {
        console.error(`${CONFIG.colors.red}Ошибка входа админа!${CONFIG.colors.reset}`);
        return;
    }

    const workbook = XLSX.readFile(CONFIG.filePath);
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });

    writeFileSync(CONFIG.credsFile, `Лог импорта от ${new Date().toLocaleString()}\n\n`);

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[7]) continue;

        const serialNumber = row[3]?.toString().trim();
        const supplierInfo = row[7].toString();
        let [fullName, email] = supplierInfo.split(',').map((s) => s?.trim());

        if (!fullName || fullName === '') {
            fullName = CONFIG.fallbackUser.fullName;
            email = CONFIG.fallbackUser.email;
        }

        // ПРОВЕРКА КЭША (чтобы не обрабатывать одного автора дважды за проход)
        if (authorCache.has(fullName)) {
            await createProduct(row, authorCache.get(fullName));
            continue;
        }

        // 1. ПОИСК СУЩЕСТВУЮЩЕГО АВТОРА (на случай перезапуска скрипта)
        const findAuthor = await request('GET', `/api/authors?where[fullName][equals]=${encodeURIComponent(fullName)}`);

        if (findAuthor.status === 200 && findAuthor.data.docs?.length > 0) {
            const authorId = findAuthor.data.docs[0].id;
            authorCache.set(fullName, authorId);
            console.log(`${CONFIG.colors.yellow}Автор уже существует: ${fullName}${CONFIG.colors.reset}`);
            await createProduct(row, authorId);
            continue;
        }

        // 2. ИЩЕМ ИЛИ СОЗДАЕМ ПОЛЬЗОВАТЕЛЯ
        if (!email) {
            const safeName = Buffer.from(fullName).toString('hex').slice(0, 8);
            email = `user_${safeName}@minto-store.ru`;
        }

        const findUser = await request('GET', `/api/users?where[email][equals]=${encodeURIComponent(email)}`);
        let userId = null;

        if (findUser.status === 200 && findUser.data.docs?.length > 0) {
            userId = findUser.data.docs[0].id;
            console.log(`${CONFIG.colors.yellow}Пользователь найден: ${email}${CONFIG.colors.reset}`);
        } else {
            const password = generatePassword();
            const newUser = await request('POST', '/api/users', {
                email,
                password,
                fullName,
                role: 'author',
            });

            if (newUser.status === 201) {
                userId = newUser.data.doc.id;
                appendFileSync(CONFIG.credsFile, `ФИО: ${fullName} | Email: ${email} | Pass: ${password}\n`);
                console.log(
                    `${CONFIG.colors.green}Создан пользователь и авто-запись автора: ${email}${CONFIG.colors.reset}`,
                );
            } else {
                console.log(
                    `${CONFIG.colors.red}Ошибка создания пользователя ${email}: ${newUser.status}${CONFIG.colors.reset}`,
                );
                continue;
            }
        }

        // 3. ОБНОВЛЕНИЕ АВТОРА (связываем данные из Excel с записью, созданной хуком)
        if (userId) {
            // Ищем автора, которого создал хук (по связи с user)
            const autoAuthorRes = await request('GET', `/api/authors?where[user][equals]=${userId}`);

            if (autoAuthorRes.status === 200 && autoAuthorRes.data.docs?.length > 0) {
                const authorId = autoAuthorRes.data.docs[0].id;

                // Обновляем пустую запись данными из Excel
                const updateRes = await request('PATCH', `/api/authors/${authorId}`, {
                    name: serialNumber || fullName,
                    fullName: fullName,
                });

                if (updateRes.status === 200) {
                    authorCache.set(fullName, authorId);
                    console.log(`${CONFIG.colors.green}[~] Данные автора заполнены: ${fullName}${CONFIG.colors.reset}`);
                    await createProduct(row, authorId);
                } else {
                    console.log(
                        `${CONFIG.colors.red}Ошибка обновления автора ${authorId}: ${updateRes.status}${CONFIG.colors.reset}`,
                    );
                }
            } else {
                // Если вдруг хук не сработал, создаем вручную как fallback
                const manualAuthor = await request('POST', '/api/authors', {
                    name: serialNumber || fullName,
                    fullName: fullName,
                    user: userId,
                });
                if (manualAuthor.status === 201) {
                    const authorId = manualAuthor.data.doc.id;
                    authorCache.set(fullName, authorId);
                    console.log(
                        `${CONFIG.colors.cyan}[+] Автор создан вручную (хук не сработал): ${fullName}${CONFIG.colors.reset}`,
                    );
                    await createProduct(row, authorId);
                }
            }
        }
    }
    console.log(`\n${CONFIG.colors.cyan}=== ИМПОРТ ЗАВЕРШЕН ===${CONFIG.colors.reset}`);
    exit(0);
}

runSeed();
