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
            }
        ]
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
    }
}

module.exports = serverlessConfiguration;
