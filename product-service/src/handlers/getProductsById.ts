import {APIGatewayProxyHandler} from 'aws-lambda';
import 'source-map-support/register';
import {ProductsRepository} from "../ProductRepository";

const productsRepository = new ProductsRepository();

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const {id} = event.pathParameters;
        const product = await productsRepository.getById(id);

        if (!product) {
            return {
                statusCode: 404,
                body: JSON.stringify({message: `Sorry, the product with id=${id} has not been found`})
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify(product)
        }
    } catch (err) {
        console.log(err);

        return {
            statusCode: 500,
            body: 'Server error'
        }
    }
}
