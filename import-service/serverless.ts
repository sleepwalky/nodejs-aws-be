import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'import-service',
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
    // https://www.serverless.com/framework/docs/providers/aws/guide/variables#reference-cloudformation-outputs
    basicAuthArn: {
      'Fn::ImportValue': 'BasicAuthArn',
    },
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    profile: 'rss',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      SQS_QUEUE: {
        Ref: 'catalogItemsQueue',
      },
    },
    iamRoleStatements: [
      {
        Sid: 'Stmt1605539376440',
        Effect: 'Allow',
        Action: ['s3:PutObject', 's3:DeleteObject', 's3:GetObject'],
        Resource: 'arn:aws:s3:::store-imported-products/*',
      },
      {
        Effect: 'Allow',
        Action: ['SQS:*'],
        Resource: {
          'Fn::GetAtt': ['catalogItemsQueue', 'Arn'],
        },
      },
    ],
  },
  resources: {
    Resources: {
      catalogItemsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalog-items-queue',
        },
      },
      GatewayResponseAccessDenied: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          RestApiId: {
            Ref: 'ApiGatewayRestApi',
          },
          ResponseType: 'ACCESS_DENIED',
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
          },
        },
      },
      GatewayResponseUnauthorized: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          RestApiId: {
            Ref: 'ApiGatewayRestApi',
          },
          ResponseType: 'UNAUTHORIZED',
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
          },
        },
      },
    },
    Outputs: {
      catalogItemsQueueUrl: {
        Value: { Ref: 'catalogItemsQueue' },
      },
      catalogItemsQueueArn: {
        Value: {
          'Fn::GetAtt': ['catalogItemsQueue', 'Arn'],
        },
      },
    },
  },

  functions: {
    importProductsFile: {
      handler: 'handlers.importProductsFile',
      events: [
        {
          http: {
            method: 'get',
            path: 'import',
            cors: true,
            authorizer: {
              type: 'TOKEN',
              name: 'basicAuth',
              // https://www.serverless.com/framework/docs/providers/aws/guide/variables#reference-cloudformation-outputs
              arn: '${self:custom.basicAuthArn}',
              resultTtlInSeconds: 0,
              identitySource: 'method.request.header.Authorization',
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
      handler: 'handlers.importFileParser',
      timeout: 10,
      events: [
        {
          s3: {
            bucket: 'store-imported-products',
            event: 's3:ObjectCreated:*',
            rules: [{ prefix: 'uploaded/', suffix: '.csv' }],
            existing: true,
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
