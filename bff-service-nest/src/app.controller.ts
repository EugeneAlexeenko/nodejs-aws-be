import {Controller, All, Get, Req, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {Request} from 'express';
import axios, { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { AppService } from './app.service';
import { CacheService } from './cache.service';

@Controller()
export class AppController {
  constructor(
      private readonly configService: ConfigService,
      private readonly appService: AppService,
      private readonly cache: CacheService
) {}
  @Get('/ping')
  healthCheck() {
    return this.appService.healthCheck();
  }

  @All()
  async handleBffRequests(@Req() request: Request) {
    const {
      originalUrl,
      method,
      body
    } = request;

    console.log('originalUrl', originalUrl);
    console.log('method', method);
    console.log('body', body);

    const recipient = originalUrl.split('/')[1];
    console.log('recipient', recipient);

    const recipientUrl = this.configService.get<string>(recipient);
    console.log('recipientUrl', recipientUrl);

    if (recipientUrl) {
      const url = `${recipientUrl}${originalUrl}`;

      if (method === 'GET' && this.cache.has(url) && !this.cache.isExpired(url, 120)) {
        console.log('Found cached value for url', url);

        return this.cache.get(url);
      }

      const axiosConfig: AxiosRequestConfig = {
        method: method as Method,
        url,
        ...(Object.keys(body || {}).length > 0 && {data: body})
      }

      console.log('axiosConfig', axiosConfig);

      try {
        const response: AxiosResponse = await axios(axiosConfig);
        console.log('Response from recipient', response.data);

        if (method === 'GET') {
          this.cache.set(url, response.data);
          console.log(`Response from ${url} has been cashed`, response.data);
        }

        return {
          statusCode: response.status,
          ...response.data
        };
      } catch (err) {
        console.log('Some error', JSON.stringify(err));

        if (err.response) {
          const {
            status,
            data
          } = err.response;

          return {
            statusCode: status,
            data
          };
        } else {
          return {
            statusCode: HttpStatus.BAD_GATEWAY,
            message: err.message
          };
        }
      }
    } else {
      return {
        statusCode: HttpStatus.BAD_GATEWAY,
        message: 'Cannot process request'
      };
    }
  }
}