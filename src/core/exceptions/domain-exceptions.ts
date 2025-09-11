import { DomainExceptionCode } from './domain-exception-codes';

export type ExtensionType = {
  message: string;
  field: string;
}
export type ErrorsView = {
  errorsMessages: ExtensionType[]
}
export class DomainException extends Error {
  message: string;
  field: string;
  code: DomainExceptionCode;
  extensions?: ErrorsView;

  constructor(errorInfo: {
    code: DomainExceptionCode;
    message: string;
    field: string;
    extensions?: ErrorsView
  }) {
    super(errorInfo.message);
    this.message = errorInfo.message;
    this.code = errorInfo.code;
    this.field = errorInfo.field
    if (errorInfo.extensions) {
      this.extensions = errorInfo.extensions
    }
  }
}
