import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class PaginationMetaDto {
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;

  constructor(total: number, offset: number, limit: number) {
    this.total = total;
    this.offset = offset;
    this.limit = limit;
    this.hasMore = offset + limit < total;
  }
}

export class PaginationResponseDto<T> {
  data: T[];
  meta: PaginationMetaDto;

  constructor(data: T[], total: number, offset: number, limit: number) {
    this.data = data;
    this.meta = new PaginationMetaDto(total, offset, limit);
  }
}

export class OkResponseDto<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  timestamp: string;
}
