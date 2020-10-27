import {Product} from './types/Product';
import {products} from './mockProducts';

export class ProductsRepository {
    private readonly products: Product[];

    constructor() {
        this.products = products;
    }

    async getAllProducts(): Promise<Product[] | []> {
        return this.products;
    }

    async getById(id: string): Promise<Product | undefined> {
        return this.products.find(product => product.id === id);
    }
}
