import { Body, Controller, Get, Post, Render, Res, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { VIEW } from '../../common/constants/view.enum';
import { BASE_URL } from '../../common/constants/constants';
import { AdminCredentialsDto } from './dtos/admin-credentials.dto';
import { Response } from 'express';
import { ErrorFilter } from '../../common/filters/error.filter';

@Controller({
  path: 'admins',
  version: '1',
})
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    stopAtFirstError: true,
  }),
)
@UseFilters(ErrorFilter)
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get('login')
  @Render(VIEW.LOGIN)
  async renderAdminLogin() {
    return {
      loginPostLink: `${BASE_URL}/v1/admins/login`,
    };
  }

  @Post('login')
  async login(@Body() body: AdminCredentialsDto, @Res({ passthrough: true }) res: Response) {
    const token = await this.adminsService.login(body.email, body.password);
    res.redirect(`${BASE_URL}/v1/clients?token=${token}`);
  }
}
