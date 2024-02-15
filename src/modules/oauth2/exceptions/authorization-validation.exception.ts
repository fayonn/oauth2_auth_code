import { HttpException, HttpExceptionOptions } from '@nestjs/common';
import { ValidationError } from 'class-validator';

// ця помилка лише для class-validator, бо там є свій пайп і своя помилка (ValidationError),
// і я повинен хендлитись стосовно нього
export class AuthorizationValidationException extends HttpException {
  private readonly _validations: ValidationError[];

  constructor(validations: ValidationError[], options?: HttpExceptionOptions) {
    super('Validation error', 422, options);
    this._validations = validations;
  }

  get validations(): ValidationError[] {
    return this._validations;
  }
}
