import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'nodejs-aws-be-product-service',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack', 'serverless-dotenv-plugin'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
    stage: 'dev',
    region: 'eu-west-1',
  },
  functions: {
    getProductsList: {
      handler: 'src/handlers/getProductsList.handler',
      events: [
        {
          http: {
            method: 'get',
            path: 'products',
            cors: true
          }
        }
      ]
    },
    getProductsById: {
      handler: 'src/handlers/getProductsById.handler',
      events: [
        {
          http: {
            method: 'get',
            path: 'products/{id}',
            cors: true
          }
        }
      ]
    },
    createProduct: {
      handler: 'src/handlers/createProduct.handler',
      events: [
        {
          http: {
            method: 'post',
            path: 'products',
            cors: true
          }
        }
      ]
    }
  }
}

module.exports = serverlessConfiguration;
