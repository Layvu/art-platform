import { exit } from 'process';
import { appendFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CONFIG = {
    filePath: path.join(__dirname, '1c_uploads/ВыгрузкаВсеСтолбцы.xlsx'),
    baseUrl: 'http://localhost:3000',
    adminCredentials: {
        email: 'vita@mail.com',
        password: 'root'
    },
    credsFile: path.join(__dirname, 'creds.txt'),
    fallbackUser: {
        fullName: 'Кобелева Анастасия Александровна',
        email: 'a_a_kobeleva@mail.ru',
        phone: '79227474765'
    },
    colors: {
        reset: '\x1b[0m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        red: '\x1b[31m',
        cyan: '\x1b[36m'
    }
};

let sessionCookie = null;
const authorCache = new Map(); // Кэш для связи ФИО -> authorId
const categoryCache = new Map(); // Кэш для category label -> categoryId

// Генератор паролей
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
        const token = setCookie.find(c => c?.includes('payload-token'));
        if (token) sessionCookie = token.split(';')[0];

        let data = {};
        try { data = await res.json(); } catch { data = { text: await res.text() }; }
        return { status: res.status, data };
    } catch (e) {
        return { status: 0, data: { error: e.message } };
    }
}


async function getCategoryId(label) {
  if (!label) return null;
  const cleanLabel = label.trim();
  
  if (categoryCache.has(cleanLabel)) return categoryCache.get(cleanLabel);
  
  // ВАЖНО: Эндпоинт изменен на /api/categories (множественное число)
  const res = await request('GET', `/api/categories?where[label][equals]=${encodeURIComponent(cleanLabel)}`);
  
  if (res.status === 200 && res.data.docs?.length > 0) {
      const id = res.data.docs[0].id;
      categoryCache.set(cleanLabel, id);
      return id;
  } else {
      console.log(`${CONFIG.colors.yellow}  ⚠ Категория "${cleanLabel}" не найдена в базе${CONFIG.colors.reset}`);
      return null;
  }
}

async function runSeed() {
  console.log(`${CONFIG.colors.cyan}=== ЗАПУСК ИМПОРТА ===${CONFIG.colors.reset}\n`);

  const login = await request('POST', '/api/users/login', CONFIG.adminCredentials);
  if (login.status !== 200) {
      console.error(`${CONFIG.colors.red}Ошибка входа админа${CONFIG.colors.reset}`);
      return;
  }

  const workbook = XLSX.readFile(CONFIG.filePath);
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
  
  writeFileSync(CONFIG.credsFile, `Данные учетных записей от ${new Date().toLocaleString()}\n\n`);

  for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length < 8) continue;

      const serialNumber = row[3]?.toString().trim(); 
      const retailPrice = parseFloat(row[5]) || 0;    
      const supplierInfo = row[7]?.toString() || "";   
      const nomenclatureCode = row[8]?.toString() || ""; 
      const nomenclatureLink = row[9]?.toString() || ""; 
      const stockBalance = parseInt(row[10]) || 0;     

      // Разбор ФИО и Почты
      let [fullName, email] = supplierInfo.split(',').map(s => s?.trim());
      
      if (!fullName || fullName === "") {
          fullName = CONFIG.fallbackUser.fullName;
          email = CONFIG.fallbackUser.email;
      }
      if (!email) email = `mock_${Math.random().toString(36).slice(-5)}@example.com`;
      
      const authorNickname = serialNumber || fullName;

      // Разбор Товара и Категории
      // На основе вашего примера: "Брелок двухсторонний KCD2 , Брелок"
      const linkParts = nomenclatureLink.split(',').map(s => s?.trim());
      const prodTitle = linkParts[0] || "Без названия";
      const categoryLabel = linkParts[1];

      if (categoryLabel === "Услуги") {
          console.log(`${CONFIG.colors.yellow}  - Пропуск услуги: ${prodTitle}${CONFIG.colors.reset}`);
          continue;
      }

      let authorId;
      if (authorCache.has(fullName)) {
          authorId = authorCache.get(fullName);
      } else {
          const existingAuthor = await request('GET', `/api/authors?where[fullName][equals]=${encodeURIComponent(fullName)}`);
          
          if (existingAuthor.status === 200 && existingAuthor.data.docs?.length > 0) {
              authorId = existingAuthor.data.docs[0].id;
              authorCache.set(fullName, authorId);
          } else {
              const password = generatePassword();
              const userRes = await request('POST', '/api/users', {
                  email,
                  password,
                  fullName,
                  roles: ['author']
              });

              if (userRes.status === 201) {
                  const userId = userRes.data.doc.id;
                  appendFileSync(CONFIG.credsFile, `ФИО: ${fullName} | Email: ${email} | Pass: ${password}\n`);

                  const newAuthor = await request('POST', '/api/authors', {
                      name: authorNickname,
                      fullName: fullName,
                      user: userId
                  });
                  
                  if (newAuthor.status === 201) {
                      authorId = newAuthor.data.doc.id;
                      authorCache.set(fullName, authorId);
                      console.log(`${CONFIG.colors.green}[+] Создан автор: ${fullName}${CONFIG.colors.reset}`);
                  }
              } else {
                console.log(`${CONFIG.colors.red}[!] Ошибка создания юзера ${email}: ${userRes.status}${CONFIG.colors.reset}`);
                continue;
            }
          }
      }

      // ПОЛУЧЕНИЕ КАТЕГОРИИ
      const catId = await getCategoryId(categoryLabel);
      
      const productData = {
          title: prodTitle,
          price: retailPrice,
          article1C: nomenclatureCode, 
          quantity: stockBalance,
          author: authorId,
          category: catId, // Передаем ID
          status: 'published'
      };

      const prodRes = await request('POST', '/api/products', productData);
      if (prodRes.status === 201) {
          console.log(`${CONFIG.colors.green}  ✔ [${categoryLabel || 'Без кат.'}] ${prodTitle}${CONFIG.colors.reset}`);
      } else {
          console.log(`${CONFIG.colors.red}  ✘ Ошибка: ${prodTitle} (${prodRes.status})${CONFIG.colors.reset}`);
      }
  }

  console.log(`\n${CONFIG.colors.cyan}=== ИМПОРТ ЗАВЕРШЕН ===${CONFIG.colors.reset}`);
  exit(0);
}

runSeed();