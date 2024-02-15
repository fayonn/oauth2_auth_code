import { AuthorizeInDto } from '../dtos/authorize-in.dto';

export const formAuthorizationQueryParams = (body: AuthorizeInDto): string => {
  const params = {
    response_type: body.responseType,
    client_id: body.clientId,
    redirect_uri: body.redirectUri,
    scope: body.scope,
    state: body.state,
  };

  let queryParams = '';
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      queryParams += `${key}=${encodeURIComponent(value as string)}&`;
    }
  }
  queryParams = queryParams.substring(0, queryParams.length - 1);

  return queryParams;
};
