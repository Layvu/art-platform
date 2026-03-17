import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

const LOGIN = process.env.ONEC_LOGIN;
const PASSWORD = process.env.ONEC_PASSWORD;

function checkAuth(req: NextRequest) {
    const authHeader = req.headers.get('authorization');

    console.log('authHeader: ', authHeader);
    if (!authHeader) return false;
    if (!authHeader.startsWith('Basic ')) return false;

    const base64 = authHeader.split(' ')[1];

    if (!base64) return false;

    const decoded = Buffer.from(base64, 'base64').toString('utf8');

    const [login, password] = decoded.split(':');

    return login === LOGIN && password === PASSWORD;
}

export async function POST(req: NextRequest) {
    try {
        if (!checkAuth(req)) {
            return new NextResponse('Unauthorized', {
                status: 401,
                headers: {
                    'WWW-Authenticate': 'Basic realm="1C"',
                },
            });
        }

        const dumpsDir = path.join(process.cwd(), '1c_uploads');

        if (!fs.existsSync(dumpsDir)) {
            fs.mkdirSync(dumpsDir, { recursive: true });
        }

        const filename = `dump_${Date.now()}`;

        const filePath = path.join(dumpsDir, filename);

        const buffer = Buffer.from(await req.arrayBuffer());

        fs.writeFileSync(filePath, buffer);

        console.log('1C file saved:', filePath);
        console.log('headers:', Object.fromEntries(req.headers));

        return NextResponse.json({
            success: true,
            saved: filename,
        });
    } catch (err) {
        console.error(err);

        return NextResponse.json({ error: 'upload failed' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);

    console.log('GET request from 1C');
    console.log('query:', Object.fromEntries(url.searchParams));

    return new NextResponse('ok');
}
