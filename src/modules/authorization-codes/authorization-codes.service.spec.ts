import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizationCodesService } from './authorization-codes.service';

describe('AuthorizationCodesService', () => {
  let service: AuthorizationCodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthorizationCodesService],
    }).compile();

    service = module.get<AuthorizationCodesService>(AuthorizationCodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
