import type { Serverless } from 'serverless/aws';
import { config } from 'dotenv';

config();

const serverlessConfiguration: Serverless = {
  service: {
    name: 'product-service',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    profile: 'rss',
    region: 'eu-west-1',
    stage: 'dev',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 'sqs:*',
        Resource:
          '${cf:import-service-${self:provider.stage}.catalogItemsQueueArn}',
      },
    ],

    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      PG_HOST: process.env.PG_HOST,
      PG_PORT: process.env.PG_PORT,
      PG_DATABASE: process.env.PG_DATABASE,
      PG_USERNAME: process.env.PG_USERNAME,
      PG_PASSWORD: process.env.PG_PASSWORD,
    },
  },
  functions: {
    getProductList: {
      handler: 'handlers.getProductList',
      events: [
        {
          http: {
            method: 'get',
            path: 'products',
            cors: true,
          },
        },
      ],
    },
    getProductById: {
      handler: 'handlers.getProductById',
      events: [
        {
          http: {
            method: 'get',
            path: 'products/{productId}',
            cors: true,
            request: {
              parameters: {
                paths: {
                  productId: true,
                },
              },
            },
          },
        },
      ],
    },
    createProduct: {
      handler: 'handlers.createProduct',
      events: [
        {
          http: {
            method: 'post',
            path: 'products',
            cors: true,
          },
        },
      ],
    },
    catalogBatchProcess: {
      handler: 'handlers.catalogBatchProcess',
      events: [
        {
          sqs: {
            batchSize: 5,
            arn:
              '${cf:import-service-${self:provider.stage}.catalogItemsQueueArn}',
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
