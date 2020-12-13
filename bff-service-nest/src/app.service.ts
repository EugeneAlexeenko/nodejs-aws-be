import {Injectable, HttpStatus} from '@nestjs/common';

@Injectable()
export class AppService {
  healthCheck() {
    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    };
  }
}
