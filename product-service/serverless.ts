import type { Serverless } from 'serverless/aws';
import * as dotenv from 'dotenv';

dotenv.config();

const {
  STAGE,
  REGION,
  CATALOG_ITEMS_QUEUE_NAME,
  CREATE_PRODUCT_TOPIC_NAME,
  MAIN_EMAIL,
  SECONDARY_EMAIL
} = process.env;

const serverlessConfiguration: Serverless = {
  service: {
    name: 'nodejs-aws-be-product-service',
  },
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
      CATALOG_ITEMS_QUEUE_URL: {
        Ref: 'CatalogItemsQueue'
      },
      CREATE_PRODUCT_TOPIC_ARN: {
        Ref: 'CreateProductTopic'
      }
    },
    stage: STAGE,
    region: REGION,

    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 'sqs:*',
        Resource: {
          'Fn::GetAtt': ['CatalogItemsQueue', 'Arn']
        }
      },
      {
        Effect: 'Allow',
        Action: 'sns:*',
        Resource: {
          Ref: 'CreateProductTopic'
        }
      }
    ]
  },

  resources: {
    Resources: {
      CatalogItemsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: CATALOG_ITEMS_QUEUE_NAME
        }
      },
      CreateProductTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: CREATE_PRODUCT_TOPIC_NAME
        }
      },
      CreateProductSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: MAIN_EMAIL,
          Protocol: 'email',
          TopicArn: {
            Ref: 'CreateProductTopic'
          }
        }
      },
      CreateExpensiveProductSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: SECONDARY_EMAIL,
          Protocol: 'email',
          TopicArn: {
            Ref: 'CreateProductTopic'
          },
          FilterPolicy: {
            price: [{
              numeric: ['>=', 100]
            }]
          }
        }
      }
    },
    Outputs: {
      CatalogItemsQueueUrl: {
        Value: {
          Ref: 'CatalogItemsQueue'
        },
        Export: {
          Name: 'CatalogItemsQueueUrl'
        }
      },
      CatalogItemsQueueArn: {
        Value: {
          'Fn::GetAtt': ['CatalogItemsQueue', 'Arn']
        },
        Export: {
          Name: 'CatalogItemsQueueArn'
        }
      }
    }
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
    },
    catalogBatchProcess: {
      handler: 'src/handlers/catalogBatchProcess.handler',
      events: [
        {
          sqs: {
            batchSize: 5,
            arn: {
              'Fn::GetAtt': ['CatalogItemsQueue', 'Arn']
            }
          }
        }
      ]
    }
  }
}

module.exports = serverlessConfiguration;
