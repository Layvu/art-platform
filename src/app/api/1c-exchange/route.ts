import crypto from 'crypto';
import fs, { createWriteStream, writeFileSync } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { XMLParser } from 'fast-xml-parser';
import { getChangedDetailed, type ChangedOfferType, type ParsedOffer } from '@/shared/utils/getChangedDetailed';
import { syncProductsFromDiff } from '@/shared/utils/syncProductsFromDiff';

const LOGIN = process.env.ONEC_LOGIN;
const PASSWORD = process.env.ONEC_PASSWORD;

function checkAuth(req: NextRequest) {
    const authHeader = req.headers.get('authorization');

    if (!authHeader) return false;
    if (!authHeader.startsWith('Basic ')) return false;

    const base64 = authHeader.split(' ')[1];
    if (!base64) return false;

    const decoded = Buffer.from(base64, 'base64').toString('utf8');
    const [login, password] = decoded.split(':');

    return login === LOGIN && password === PASSWORD;
}

function parseOffersXml(xmlRaw: string): ParsedOffer[] {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
        parseTagValue: false,
        trimValues: true,
    });

    const jsonObj = parser.parse(xmlRaw);

    const offers = jsonObj?.КоммерческаяИнформация?.ПакетПредложений?.Предложения?.Предложение;

    if (!offers) {
        throw new Error('В XML не найдены предложения');
    }

    const offersArray = Array.isArray(offers) ? offers : [offers];

    return offersArray.map((offer: any) => {
        const priceVal = Array.isArray(offer?.Цены?.Цена)
            ? offer.Цены.Цена[0]?.ЦенаЗаЕдиницу
            : offer?.Цены?.Цена?.ЦенаЗаЕдиницу;

        return {
            id: String(offer?.Артикул ?? ''),
            price: Number(priceVal ?? 0),
            stock: Number(offer?.Количество ?? 0),
        };
    });
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const mode = url.searchParams.get('mode');

    if (mode === 'checkauth') {
        if (!checkAuth(req)) {
            return new NextResponse('failure', { status: 401 });
        }

        const sessionId = crypto.randomBytes(16).toString('hex');

        const res = new NextResponse(
            `success
session
${sessionId}`,
        );

        res.cookies.set('session', sessionId, {
            httpOnly: true,
            path: '/',
        });

        return res;
    }

    if (mode === 'init') {
        return new NextResponse(
            `zip=no
file_limit=2000000`,
        );
    }

    return NextResponse.json({ error: 'not allowed' }, { status: 403 });
}

export async function POST(req: NextRequest) {
    const url = new URL(req.url);
    const mode = url.searchParams.get('mode');

    const filename = url.searchParams.get('filename') || 'import.xml';

    const dir = path.join(process.cwd(), '1c_uploads');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, filename);

    if (mode === 'test') {
        try {
            const xml = await req.text();

            if (!xml || xml.length < 10) {
                return NextResponse.json({ error: 'empty xml' }, { status: 400 });
            }

            // 1. парсим XML
            const parsed = parseOffersXml(xml);

            // базовый путь (без расширения)
            const basePath = filePath.replace(/\.xml$/i, '');

            const newPath = `${basePath}_new.json`;
            const oldPath = `${basePath}_old.json`;
            const diffPath = `${basePath}_diff.json`;

            // 2. сохраняем new
            writeFileSync(newPath, JSON.stringify(parsed, null, 2), 'utf8');

            console.log(`Saved NEW: ${newPath}`);

            let diff = [];

            // 3. если есть old считаем diff
            if (fs.existsSync(oldPath)) {
                const oldRaw = fs.readFileSync(oldPath, 'utf8');
                const oldData = JSON.parse(oldRaw);

                diff = getChangedDetailed(oldData, parsed);

                // 4. сохраняем diff
                writeFileSync(diffPath, JSON.stringify(diff, null, 2), 'utf8');

                console.log(`Diff computed: ${diff.length} changes → ${diffPath}`);

                // 5. удаляем old
                fs.unlinkSync(oldPath);
            } else {
                console.log('OLD not found → считаем все товары новыми');

                diff = parsed.map((item) => ({
                    id: item.id,
                    type: 'new' as ChangedOfferType,
                }));

                writeFileSync(diffPath, JSON.stringify(diff, null, 2), 'utf8');
            }
            // diff = [
            //     { id: '000004825', type: 'stock' as ChangedOfferType, newValue: 3 },
            //     { id: '000002604', type: 'stock' as ChangedOfferType, newValue: 4 },
            //     { id: '000002029', type: 'deleted' as ChangedOfferType },
            // ];

            await syncProductsFromDiff(diff);

            // 6. переименовываем new → old
            fs.renameSync(newPath, oldPath);

            return new NextResponse('success');
        } catch (err: any) {
            console.error('Parse error:', err.message);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
    }

    if (mode === 'file') {
        const writeStream = createWriteStream(filePath, {
            flags: 'a',
        });

        await pipeline(req.body as unknown as Readable, writeStream);

        return new NextResponse('success');
    }

    if (mode === 'import') {
        if (!fs.existsSync(filePath)) {
            return new NextResponse('failure');
        }

        try {
            // 1. читаем XML
            const xml = fs.readFileSync(filePath, 'utf8');

            // 2. парсим
            const parsed = parseOffersXml(xml);

            // 3. формируем путь JSON рядом с XML
            const jsonPath = filePath.replace(/\.xml$/i, '.json');

            // 4. сохраняем
            writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), 'utf8');

            console.log(`Parsed ${parsed.length} offers → ${jsonPath}`);

            // (опционально) удалить XML
            // fs.unlinkSync(filePath);

            return new NextResponse('success');
        } catch (err: any) {
            console.error('Parse error:', err.message);
            return new NextResponse('failure');
        }
    }

    return NextResponse.json({ error: 'unknown mode' }, { status: 400 });
}
