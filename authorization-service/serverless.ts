import type { Serverless } from 'serverless/aws';
import * as dotenv from 'dotenv';

dotenv.config();

const { STAGE, REGION, SERVICE_NAME } = process.env;

const serverlessConfiguration: Serverless = {
    service: SERVICE_NAME,
    frameworkVersion: '2',
    custom: {
        webpack: {
            webpackConfig: './webpack.config.js',
            includeModules: true
        },
        dotenv: {
            required: {
                file: true
            }
        }
    },
    plugins: ['serverless-webpack', 'serverless-dotenv-plugin'],
    provider: {
        name: 'aws',
        runtime: 'nodejs12.x',
        apiGateway: {
            minimumCompressionSize: 1024,
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
        },
        stage: STAGE,
        region: REGION
    },
    functions: {
        basicAuthorizer: {
            handler: 'src/handler.basicAuthorizer'
        }
    }
}

module.exports = serverlessConfiguration;
