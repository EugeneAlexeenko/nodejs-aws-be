import { APIGatewayProxyResult } from 'aws-lambda';

export const getCorsHeaders = () => ({
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Credentials': true
});

export const buildResponse = (statusCode: number, body: string): APIGatewayProxyResult => ({
    statusCode,
    headers: getCorsHeaders(),
    body
});