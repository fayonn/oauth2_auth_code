import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Render,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientDto } from './dtos/client.dto';
import { VIEW } from '../../common/constants/view.enum';
import { BASE_URL } from '../../common/constants/constants';
import { TokenType } from '../tokens/constants/token-type.enum';
import { ConfigService } from '@nestjs/config';
import { TokenRedirect } from '../../common/decorators/token-redirect.decorator';
import { ClientUpdateOutDto } from './dtos/client-update-out.dto';
import { Serialize } from '../../common/decorators/serialize.decorator';
import { ClientInfoOutDto } from './dtos/client-info-out.dto';
import { ClientCreateOutDto } from './dtos/client-create-out.dto';
import { AdminPageOutDto } from '../admins/dtos/admin-page-out.dto';
import { ClientUpdateInDto } from './dtos/client-update-in.dto';
import { ErrorFilter } from '../../common/filters/error.filter';
import { TokenAuthDecorator } from '../../common/decorators/token-auth.decorator';

@Controller({
  path: 'clients',
  version: '1',
})
@TokenAuthDecorator([TokenType.INNER_TOKEN])
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    stopAtFirstError: true,
  }),
)
@UseFilters(ErrorFilter)
export class ClientsController {
  private readonly JWT_PUBLIC_KEY: string;
  constructor(
    private readonly clientsService: ClientsService,
    private readonly configService: ConfigService,
  ) {
    this.JWT_PUBLIC_KEY = configService.getOrThrow<string>('JWT_PUBLIC_KEY');
  }

  // /admins/login redirects here
  @Get()
  @Render(VIEW.ADMIN_PAGE)
  @Serialize(AdminPageOutDto)
  async renderAdminPage(@Query('token') token: string) {
    const clients = await this.clientsService.getAll();
    return {
      clients: clients,
      createClientGetLink: `${BASE_URL}/v1/clients/create`,
      infoClientGetLink: `${BASE_URL}/v1/clients/info`,
      updateClientGetLink: `${BASE_URL}/v1/clients/update`,
      deleteClientDeleteLink: `${BASE_URL}/v1/clients/delete`,
      publicKey: this.JWT_PUBLIC_KEY,
      token: encodeURIComponent(token),
    };
  }

  @Get('create')
  @Render(VIEW.CLIENT_CREATE)
  @Serialize(ClientCreateOutDto)
  async renderCreateClientPage(@Query('token') token: string) {
    return {
      token: encodeURIComponent(token),
      clientListGetLink: `${BASE_URL}/v1/clients`,
      createClientPostLink: `${BASE_URL}/v1/clients/create`,
    };
  }

  @Post('create')
  @TokenRedirect(`${BASE_URL}/v1/clients`, 303)
  async createClient(@Body() body: ClientDto) {
    await this.clientsService.save(body);
  }

  @Get('/info/:id')
  @Render(VIEW.CLIENT_INFO)
  @Serialize(ClientInfoOutDto)
  async renderClientInfo(@Param('id') id: string, @Query('token') token: string) {
    const client = await this.clientsService.findByIdOrThrowError(id, () => {
      throw new NotFoundException('Client not found');
    });

    return {
      client: {
        ...client,
        createdAt: client.createdAt.toISOString(),
        updatedAt: client.updatedAt.toISOString(),
      },
      token: encodeURIComponent(token),
      clientListGetLink: `${BASE_URL}/v1/clients`,
    };
  }

  @Get('/update/:id')
  @Render(VIEW.CLIENT_UPDATE)
  @Serialize(ClientUpdateOutDto)
  async renderClientUpdate(@Param('id') id: string, @Query('token') token: string) {
    const client = await this.clientsService.findByIdOrThrowError(id, () => {
      throw new NotFoundException('Client not found');
    });

    return {
      client: client,
      token: encodeURIComponent(token),
      clientListGetLink: `${BASE_URL}/v1/clients`,
      updateClientPutLink: `${BASE_URL}/v1/clients/update/${id}`,
    };
  }

  @Put('/update/:id')
  @TokenRedirect(`${BASE_URL}/v1/clients`, 303)
  async updateClient(@Param('id') id: string, @Body() body: ClientUpdateInDto) {
    await this.clientsService.update(id, body);
  }

  @Delete('/delete/:id')
  @TokenRedirect(`${BASE_URL}/v1/clients`)
  async deleteClient(@Param('id') id: string) {
    await this.clientsService.deleteById(id);
  }
}
