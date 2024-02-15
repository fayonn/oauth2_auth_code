import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { LoggerService } from '../../logger/logger.service';
import { ClientsService } from '../../clients/clients.service';
import { ScopesService } from '../../scopes/scopes.service';
import { AuthorizationException } from '../exceptions/authorization.exception';
import { Oauth2ErrorMessage } from '../constants/oauth2-error-message.enum';
import { AuthorizeInDto } from '../dtos/authorize-in.dto';

@Injectable()
export class InnerAuthorizationRequestPipe implements PipeTransform {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly scopesService: ScopesService,
  ) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'query') {
      const client = await this.clientsService.findByIdOrThrowError(value.clientId, () => {
        throw new AuthorizationException({
          title: Oauth2ErrorMessage.INVALID_CLIENT,
          message: 'Client not found',
          statusCode: 400,
          property: 'clientId',
        });
      });

      const redirectUri = value.redirectUri;
      if (!client.redirectUris.includes(redirectUri)) {
        throw new AuthorizationException({
          title: Oauth2ErrorMessage.INVALID_REQUEST,
          message: 'Invalid redirect URI',
          statusCode: 400,
          property: 'redirectUri',
        });
      }

      if (value.scope && value.scope.length) {
        if (!(await this.scopesService.verifyScopes(client.id, value.scope))) {
          throw new AuthorizationException({
            title: Oauth2ErrorMessage.INVALID_SCOPE,
            message: 'Invalid scope',
            statusCode: 400,
            property: 'scope',
            redirectUri: value.redirectUri,
          });
        }
      }
    }

    return value;
  }
}
