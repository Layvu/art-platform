import type { ChangedParsedOffers } from "./getChangedDetailed";
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
config({ path: path.resolve(__dirname, '../', envFile) });

const CONFIG = {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL as string,
    adminCredentials: {
        email: process.env.ADMIN_EMAIL as string,
        password: process.env.ADMIN_PASSWORD as string,
    },
};

let sessionCookie: string | null = null;

type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type Success<T> = { status: number; data: T; error?: never };
type Fail = { status: number; data?: never; error: string };

type RequestResponse<T> = Success<T> | Fail;

type Product = {
    id: string;
    article1C: string;
    price: number;
    quantity: number;
};

type ProductsResponse = {
    docs: Product[];
};

async function request<T>(
    method: RequestMethod,
    path: string,
    body?: unknown
): Promise<RequestResponse<T>> {

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (sessionCookie) {
        headers['Cookie'] = sessionCookie;
    }

    try {
        const res = await fetch(`${CONFIG.baseUrl}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        const setCookie =
            (res.headers as any).getSetCookie?.() ??
            [res.headers.get('set-cookie')];

        const token = setCookie.find((c: string) =>
            c?.includes('payload-token')
        );

        if (token) {
            sessionCookie = token.split(';')[0];
        }

        let data: any = {};

        try {
            data = await res.json();
        } catch {
            data = { text: await res.text() };
        }

        return { status: res.status, data };

    } catch (e: unknown) {
        return {
            status: 0,
            data: { error: e instanceof Error ? e.message : 'unknown error' } as any
          };
    }
}


export async function syncProductsFromDiff(changes: ChangedParsedOffers[]) {
    console.log('=== SYNC PRODUCTS START ===');

    // 1. логин
    const login = await request('POST', '/api/users/login', CONFIG.adminCredentials);

    if (login.status !== 200) {
        throw new Error('Admin login failed');
    }

    console.log('Admin logged in');

    for (const change of changes) {
        const { id, type } = change;

        try {
            const find = await request<ProductsResponse>(
                'GET',
                `/api/products?where[article1C][equals]=${encodeURIComponent(id)}`
            );

            const existing = find.data?.docs?.[0];


            // TODO: чтение json в котором описывается названеи товара и id автора. 
            // ...
             
            if (type === 'new') {
                if (existing) {
                    console.log(`⚠ already exists: ${id}`);
                    continue;
                }

                const res = await request(
                    'POST',
                    '/api/products',
                    {
                        article1C: id,
                        title: `Импорт ${id}`,
                        price: 0,
                        quantity: 0,
                    }
                );

                console.log(`+ created ${id} (${res.status})`);
                continue;
            }

            if (type === 'deleted') {
                if (!existing) {
                    console.log(`⚠ not found for delete: ${id}`);
                    continue;
                }

                const res = await request(
                    'DELETE',
                    `/api/products/${existing.id}`
                );

                console.log(`- deleted ${id} (${res.status})`);
                continue;
            }

            if (!existing) {
                console.log(`⚠ not found for update: ${id}`);
                continue;
            }

            const updateData: Partial<Product> = {};

            if (type === 'price') {
                updateData.price = (change).newValue;
            }

            if (type === 'stock') {
                updateData.quantity = (change).newValue;
            }

            const res = await request(
                'PATCH',
                `/api/products/${existing.id}`,
                updateData
            );

            console.log(`~ updated ${id} (${type}) → ${res.status}`);

        } catch (err: unknown) {
            console.log(
                `✘ error ${id}: ${
                    err instanceof Error ? err.message : 'unknown'
                }`
            );
        }
    }

    console.log('=== SYNC DONE ===');
}