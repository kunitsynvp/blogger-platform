import { ValidationError, ValidationPipe } from '@nestjs/common';
import {
  DomainException,
  ExtensionType,
} from '../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../core/exceptions/domain-exception-codes';
import { NestExpressApplication } from '@nestjs/platform-express';

//функция использует рекурсию для обхода объекта children при вложенных полях при валидации
//поставьте логи и разберитесь как она работает
//TODO: tests
export const errorFormatter = (
  errors: ValidationError[],
  errorMessage?: any,
): { errorsMessages: ExtensionType[] } => {
  const errorsForResponse = errorMessage || [];

  for (const error of errors) {
    if (!error.constraints && error.children?.length) {
      errorFormatter(error.children, errorsForResponse);
    } else if (error.constraints) {
      const constrainKeys = Object.keys(error.constraints);

      for (const key of constrainKeys) {
        errorsForResponse.push({
          message: error.constraints[key]
            ? `invalid ${error.constraints[key]}`
            : '',
          field: error.property,
        });
      }
    }
  }

  return { errorsMessages: errorsForResponse };
};

export function pipesSetup(app: NestExpressApplication) {
  //Глобальный пайп для валидации и трансформации входящих данных.
  app.useGlobalPipes(
    //new ObjectIdValidationTransformationPipe(),
    new ValidationPipe({
      //class-transformer создает экземпляр dto
      //соответственно применятся значения по-умолчанию
      //и методы классов dto
      transform: true,

      whitelist: true,
      //Выдавать первую ошибку для каждого поля
      stopAtFirstError: true,
      //Для преобразования ошибок класс валидатора в необходимый вид
      exceptionFactory: (errors) => {
        const formattedErrors = errorFormatter(errors);

        throw new DomainException({
          code: DomainExceptionCode.ValidationError,
          message: 'Validation failed',
          field: 'field',
          extensions: formattedErrors,
        });
      },
    }),
  );
}