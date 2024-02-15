import { UsePipes } from '@nestjs/common';
import { QueryTransformPipe } from '../pipes/query-transform.pipe';

export const QueryTransform = (dto: any) => {
  return UsePipes(new QueryTransformPipe(dto));
};
