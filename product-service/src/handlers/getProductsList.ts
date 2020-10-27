import {APIGatewayProxyHandler} from 'aws-lambda';
import 'source-map-support/register';
import {ProductsRepository} from "../ProductRepository";

const productsRepository = new ProductsRepository();

export const handler: APIGatewayProxyHandler = async () => {
    try {
        const products = await productsRepository.getAllProducts();

        return {
            statusCode: 200,
            body: JSON.stringify(products)
        };
    } catch (err) {
        console.log(err);

        return {
            statusCode: 500,
            body: 'Server error'
        };

    }
}
