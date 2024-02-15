import { Reflector } from '@nestjs/core';
import { TokenType } from '../../modules/tokens/constants/token-type.enum';

export const TokenTypeReflector = Reflector.createDecorator<TokenType[]>();
