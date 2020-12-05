import { basicAuthorizer } from './basicAuthorizer';
import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent } from 'aws-lambda';

describe('basicAuthorizer handler', () => {
    const cb = jest.fn();

    beforeEach(() => {
        process.env.johnsmith = 'TEST_PASSWORD';
    });

    afterEach(() => {
        delete process.env.johnsmith;
        cb.mockReset();
    })

    it('Returns Unauthorized for wrong event type', () => {
        const event = {
            type: 'WRONG_TYPE'
        } as undefined as APIGatewayTokenAuthorizerEvent;

        basicAuthorizer(event, null, cb);

        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith('Unauthorized');
    });

    it('Returns Unauthorized for user with incorrect password', () => {
        const event: APIGatewayTokenAuthorizerEvent = {
            type: 'TOKEN',
            methodArn: 'methodArn',
            authorizationToken: 'Basic am9obnNtaXRoOldST05HX1BBU1NXT1JECg==' // johnsmith:WRONG_PASSWORD
        };
        const expectedPolicy: APIGatewayAuthorizerResult = {
            principalId: 'johnsmith',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: 'methodArn'
                    }
                ]
            }
        };

        basicAuthorizer(event, null, cb);

        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(null, expectedPolicy);
    });

    it('Authorizes user with correct password', () => {
        const event: APIGatewayTokenAuthorizerEvent = {
           type: 'TOKEN',
           methodArn: 'methodArn',
           authorizationToken: 'Basic am9obnNtaXRoOlRFU1RfUEFTU1dPUkQK' // johnsmith:TEST_PASSWORD
        };
        const expectedResult: APIGatewayAuthorizerResult = {
            principalId: 'johnsmith',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: 'methodArn'
                    }
                ]
            }
        };

        basicAuthorizer(event, null, cb);

        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(null, expectedResult);
    });
});