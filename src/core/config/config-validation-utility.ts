import { validateSync } from 'class-validator';
import { DomainException } from '../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../exceptions/domain-exception-codes';

// просто утилита, даже не классом её сделали, чтобы не париться с DI и использовать её напрямую где надо нам.
export const configValidationUtility = {
  validateConfig: (configInstance: any) => {
    const errors = validateSync(configInstance);
    if (errors.length > 0) {
      const sortedMessages = errors
        .map((error) => {
          const currentValue = error.value;
          const constraints = Object.values(error.constraints || {}).join(', ');
          return `😵 ${constraints} (current value: ${currentValue})`;
        })
        .join('; ');
      throw new DomainException({
        code: DomainExceptionCode.ValidationEnvError,
        message: `❌ Validation failed: ${sortedMessages}`,
        field: 'None',
      });
    }
  },
  convertToBoolean(value: string) {
    const trimmedValue = value?.trim();
    if (trimmedValue === 'true') return true;
    if (trimmedValue === '1') return true;
    if (trimmedValue === 'enabled') return true;
    if (trimmedValue === 'false') return false;
    if (trimmedValue === '0') return false;
    if (trimmedValue === 'disabled') return false;

    return null;
  },
  convertToRegExp: (value: string) => {
    try {
      return new RegExp(value);
    } catch (e) {
      throw new Error("Invalid regexp format");
    }
  },
  getEnumValues<T extends Record<string, string>>(enumObj: T): string[] {
    return Object.values(enumObj);
  },
};