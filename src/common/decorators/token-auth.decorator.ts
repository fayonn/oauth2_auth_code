import { applyDecorators, UseGuards } from '@nestjs/common';
import { TokenType } from '../../modules/tokens/constants/token-type.enum';
import { TokenGuard } from '../guards/token.guard';
import { TokenTypeReflector } from './token-type-reflector.decorator';

export const TokenAuthDecorator = (tokens: TokenType[]) => {
  if (!tokens.length) {
    throw new Error('Pass at least one token');
  }

  return applyDecorators(TokenTypeReflector(tokens), UseGuards(TokenGuard));
};
