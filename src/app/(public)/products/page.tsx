import { PayloadService } from '@/services/api/payload-service';

import ProductsUI from './ProductsUI';

export default async function ProductsPage() {
    const payloadService = new PayloadService();
    const products = await payloadService.getProducts();

    return <ProductsUI products={products} />;
}

// TODO: Метатеги
