const express = require('express');
const { proxyRequestHandler } = require('./proxyController');

require('dotenv').config();

const app = express();

app.use(express.json());

app.all('/*', proxyRequestHandler);

module.exports = app;
