import { applyDecorators, UseFilters, UsePipes } from '@nestjs/common';
import { InnerAuthorizationRequestPipe } from '../pipes/inner-authorization-request.pipe';
import { AuthorizationUnexpectedErrorsFilter } from '../filters/authorization/authorization-unexpected-errors.filter';
import { AuthorizationFilter } from '../filters/authorization/authorization.filter';
import { AuthorizationValidationFilter } from '../filters/authorization/authorization-validation.filter';

export function AuthorizationRequestUtils() {
  return applyDecorators(
    UsePipes(InnerAuthorizationRequestPipe),
    UseFilters(AuthorizationUnexpectedErrorsFilter, AuthorizationFilter, AuthorizationValidationFilter),
  );
}
