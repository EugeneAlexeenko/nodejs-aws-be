import type {Serverless} from 'serverless/aws';
import * as dotenv from 'dotenv';

dotenv.config();

const { STAGE, REGION, BUCKET } = process.env;

const serverlessConfiguration: Serverless = {
    service: {
        name: 'nodejs-aws-be-import-service',
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
        },
        basicAuthorizerArn: {
            'Fn::ImportValue': 'BasicAuthorizerLambdaFunctionQualifiedArn'
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
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            CATALOG_ITEMS_QUEUE_URL: {
                'Fn::ImportValue': 'CatalogItemsQueueUrl'
            }
        },
        stage: STAGE,
        region: REGION,
        iamRoleStatements: [
            {
                Effect: 'Allow',
                Action: 's3:ListBucket',
                Resource: [
                    `arn:aws:s3:::${BUCKET}`
                ]
            },
            {
                Effect: 'Allow',
                Action: [
                    's3:GetObject',
                    's3:PutObject',
                    's3:DeleteObject',
                ],
                Resource: [
                    `arn:aws:s3:::${BUCKET}/*`,
                ],
            },
            {
                Effect: 'Allow',
                Action: 'sqs:*',
                Resource: {
                    'Fn::ImportValue': 'CatalogItemsQueueArn'
                }
            }
        ]
    },

    resources: {
        Resources: {
            GatewayResponseDefault500: {
                Type: 'AWS::ApiGateway::GatewayResponse',
                Properties: {
                    ResponseParameters: {
                        'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
                        'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
                    },
                    ResponseType: 'DEFAULT_5XX',
                    RestApiId: {
                        Ref: 'ApiGatewayRestApi',
                    },
                },
            },
            GatewayResponseAccessDenied: {
                Type: 'AWS::ApiGateway::GatewayResponse',
                Properties: {
                    ResponseParameters: {
                        'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
                        'gatewayresponse.header.Access-Control-Allow-Headers': "'*'"
                    },
                    ResponseType: 'ACCESS_DENIED',
                    RestApiId: {
                        Ref: 'ApiGatewayRestApi'
                    }
                },
            },
            GatewayResponseUnauthorized: {
                Type: 'AWS::ApiGateway::GatewayResponse',
                Properties: {
                    ResponseParameters: {
                        'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
                        'gatewayresponse.header.Access-Control-Allow-Headers': "'*'"
                    },
                    ResponseType: 'UNAUTHORIZED',
                    RestApiId: {
                        Ref: 'ApiGatewayRestApi'
                    }
                },
            },
        },
    },

    functions: {
        importProductsFile: {
            handler: 'src/handler.importProductsFile',
            events: [
                {
                    http: {
                        method: 'get',
                        path: 'import',
                        cors: true,
                        authorizer: {
                            type: 'token',
                            name: 'basicAuthorizer',
                            arn: '${cf:nodejs-aws-be-authorization-service-${self:provider.stage}.BasicAuthorizerLambdaFunctionQualifiedArn}',
                            identitySource: 'method.request.header.Authorization',
                            resultTtlInSeconds: 0
                        },
                        request: {
                            parameters: {
                                querystrings: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            ],
        },
        importFileParser: {
            handler: 'src/handler.importFileParser',
            events: [
                {
                    s3: {
                        bucket: BUCKET,
                        event: 's3:ObjectCreated:*',
                        rules: [
                            {
                                prefix: 'uploaded/',
                                suffix: '.csv'
                            }
                        ],
                        existing: true // skip bucket creation if already exists
                    }
                }
            ]
        }
    },
}

module.exports = serverlessConfiguration;
