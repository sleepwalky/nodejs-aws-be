import type { Serverless } from 'serverless/aws';
import { config } from 'dotenv';

config();

const serverlessConfiguration: Serverless = {
  service: {
    name: 'authorization-service',
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
    dotenv: {
      path: '.env',
      basePath: './',
    },
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack', 'serverless-dotenv-plugin'],
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
    },
  },
  functions: {
    basicAuth: {
      handler: 'handler.basicAuthorizer',
    },
  },
  resources: {
    Resources: {},
    Outputs: {
      BasicAuthArn: {
        Value: {
          //https://stackoverflow.com/questions/61992001/how-you-reference-the-function-arn-of-a-function-lambda-in-serverless-yml-file
          'Fn::GetAtt': ['BasicAuthLambdaFunction', 'Arn'],
        },
        Export: {
          Name: 'BasicAuthArn',
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
