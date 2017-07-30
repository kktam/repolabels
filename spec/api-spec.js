var AWS = require('aws-sdk');
const underTest = require('./../api.js');

const GITHUB_CLIENT_ID = '';
const GITHUB_SECRET = '';

describe('Github repository image verification', () => {
  var lambdaContextSpy;

  beforeEach(() => {
    AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: 'api-lambda-execute' });
    AWS.config.update({region: 'us-west-2'});

    lambdaContextSpy = jasmine.createSpyObj('lambdaContext', ['done']);
  });

  it('returns Github svg image when owner and repository are valid', (done) => {
    const OWNER = 'claudiajs',
          REPO = 'claudia',
          IMG = 'large',
          path = '/' + OWNER + '/' + REPO + '/' + IMG;

    underTest.proxyRouter({
      requestContext: {
        resourcePath: path,
        httpMethod: 'GET'
      },
      queryStringParameters: {
      },
      stageVariables: {
        lambdaVersion: 'dev',
        githubClientId: GITHUB_CLIENT_ID,
        githubSecret: GITHUB_SECRET
      }
    }, lambdaContextSpy).then(() => {
      var result = lambdaContextSpy.done.calls;
      console.log(result);
      expect(result).toContain('svg', 'Shall contain svg+xml output');
    }).then(done, done.fail);
  });
});