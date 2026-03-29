import crypto from 'crypto';
import fs, { createWriteStream } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

const LOGIN = process.env.ONEC_LOGIN;
const PASSWORD = process.env.ONEC_PASSWORD;

function checkAuth(req: NextRequest) {
    const authHeader = req.headers.get('authorization');

    console.log('authHeader: ', authHeader);
    if (!authHeader) return false;
    if (!authHeader?.startsWith('Basic ')) return false;

    const base64 = authHeader.split(' ')[1];

    if (!base64) return false;

    const decoded = Buffer.from(base64, 'base64').toString('utf8');
    const [login, password] = decoded.split(':');

    return login === LOGIN && password === PASSWORD;
}

function getFilePath(filename: string) {
    const dir = path.join(process.cwd(), '1c_uploads');

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    return path.join(dir, filename);
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

    if (mode === 'file') {
        const filename = url.searchParams.get('filename') || 'import.xml';
        const filePath = getFilePath(filename);

        const writeStream = createWriteStream(filePath, {
            flags: 'a',
        });

        // потоковая запись
        await pipeline(req.body as unknown as Readable, writeStream);

        return new NextResponse('success');
    }

    if (mode === 'import') {
        const filename = url.searchParams.get('filename') || 'import.xml';
        const filePath = getFilePath(filename);

        if (!fs.existsSync(filePath)) {
            return new NextResponse('failure');
        }

        // тут парсинг XML
        const xml = fs.readFileSync(filePath, 'utf8');

        console.log('XML READY:', xml.slice(0, 1000));

        // TODO: парсинг (fast-xml-parser / sax)

        // можно удалить после обработки
        fs.unlinkSync(filePath);

        return new NextResponse('success');
    }

    return NextResponse.json({ error: 'unknown mode' }, { status: 400 });
}
