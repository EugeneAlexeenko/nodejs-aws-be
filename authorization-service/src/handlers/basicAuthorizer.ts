import 'source-map-support/register';
import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerHandler, PolicyDocument } from 'aws-lambda';

enum Effect {
    Allow = 'Allow',
    Deny = 'Deny'
}

export const basicAuthorizer: APIGatewayTokenAuthorizerHandler = (event, ctx, cb) => {
    console.log('Event:', JSON.stringify(event));
    console.log('Context:', JSON.stringify(ctx));

    if (event['type'] !== 'TOKEN') {
        console.log('Wrong event type', event['type']);
        return cb('Unauthorized');
    }

    try {
        const {authorizationToken, methodArn} = event;
        const [username, password] = extractCredentialsFromToken(authorizationToken)

        const storedUserPassword = process.env[username];
        const effect = (!storedUserPassword || storedUserPassword !== password)
            ? Effect.Deny
            : Effect.Allow;

        const result: APIGatewayAuthorizerResult = generateAuthorizerResult(username, methodArn, effect);
        console.log('Result:', JSON.stringify(result));

        cb(null, result);
    } catch (err) {
        console.log(err);
        cb(`Unauthorized. ${err.message}`);
    }
};

const extractCredentialsFromToken = (authorizationToken: string): [string, string] => {
    const encodedCreds = authorizationToken.split(' ')[1];
    const buff = Buffer.from(encodedCreds, 'base64');
    const plainCreds = buff.toString('utf-8').split(':');
    const username = plainCreds[0].trim();
    const password = plainCreds[1].trim();

    return [username, password];
};

const generateAuthorizerResult = (principalId, resource, effect): APIGatewayAuthorizerResult => ({
    principalId: principalId,
    policyDocument: generatePolicyDocument(effect, resource)
});

const generatePolicyDocument = (effect, resource): PolicyDocument => ({
    Version: '2012-10-17',
    Statement: [
        {
            Action: 'execute-api:Invoke',
            Effect: effect,
            Resource: resource
        }
    ]
});