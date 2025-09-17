import ProductCard from '@/components/ProductCard';
import { PayloadService } from '@/services/api/payload-service';

export default async function ProductsPage() {
    // TODO: Запрашивать из стора, в нём loading и error
    const payloadService = new PayloadService();
    const products = await payloadService.getProducts();

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Products</h1>
            <div className="grid grid-cols-4 gap-4">
                {products.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>
        </div>
    );
}

// TODO: Метатеги
