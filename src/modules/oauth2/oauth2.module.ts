import { Module } from '@nestjs/common';
import { Oauth2Controller } from './oauth2.controller';
import { Oauth2Service } from './oauth2.service';
import { TokensModule } from '../tokens/tokens.module';
import { HashModule } from '../hash/hash.module';
import { UsersModule } from '../users/users.module';
import { ClientsModule } from '../clients/clients.module';
import { ScopesModule } from '../scopes/scopes.module';
import { AuthorizationCodesModule } from '../authorization-codes/authorization-codes.module';

@Module({
  imports: [
    TokensModule,
    HashModule,
    UsersModule,
    ClientsModule,
    ScopesModule,
    AuthorizationCodesModule,
  ],
  controllers: [Oauth2Controller],
  providers: [Oauth2Service],
})
export class Oauth2Module {}
