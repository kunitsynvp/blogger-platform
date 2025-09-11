//https://docs.nestjs.com/exception-filters#exception-filters-1
//Ошибки класса DomainException (instanceof DomainException)
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, } from '@nestjs/common';
import { DomainException } from '../domain-exceptions';
import { DomainExceptionCode } from '../domain-exception-codes';
import { Request, Response } from 'express';


@Catch(DomainException)
export class DomainHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = this.mapToHttpStatus(exception.code);
    const responseBody =
      exception.extensions ||
      {
        errorsMessages:
        [
          {
            message: exception.message,
            field: exception.field
          }
        ]
    };

    response.status(status).json(responseBody);
  }

  private mapToHttpStatus(code: DomainExceptionCode): number {
    switch (code) {
      //Bad Request
      case DomainExceptionCode.BadRequest:
      case DomainExceptionCode.ValidationError:
      case DomainExceptionCode.ConfirmationCodeExpired:
      case DomainExceptionCode.EmailAlreadyConfirmed:
      case DomainExceptionCode.PasswordRecoveryCodeExpired:
      case DomainExceptionCode.InvalidLogin:
      case DomainExceptionCode.ConfirmationCodeNotFound:
        return HttpStatus.BAD_REQUEST;
      //Forbidden
      case DomainExceptionCode.Forbidden:
        return HttpStatus.FORBIDDEN;
      //Not found
      case DomainExceptionCode.NotFound:
        return HttpStatus.NOT_FOUND;
      //Unauthorized
      case DomainExceptionCode.Unauthorized:
      case DomainExceptionCode.InvalidPassword:
        return HttpStatus.UNAUTHORIZED;
      //Internal server error
      case DomainExceptionCode.InternalServerError:
        return HttpStatus.INTERNAL_SERVER_ERROR;
      default:
        return HttpStatus.I_AM_A_TEAPOT;
    }
  }
}