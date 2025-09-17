import { PRODUCTS } from '@/shared/data/products.data';
import ProductCard from '../../../components/ProductCard';
import { PayloadService } from '@/services/api/payload-service';

export default async function HomePage() {
    // TODO: Запрашивать из стора, в нём loading и error
    const payloadService = new PayloadService();
    const products = await payloadService.getProducts();

    // TODO: Убрать моки потом
    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Home</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {PRODUCTS.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>
        </div>
    );
}
