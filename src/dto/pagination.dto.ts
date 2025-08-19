import { ApiProperty } from '@nestjs/swagger';
import { Type as NestType } from '@nestjs/common';

export class PaginationMetaDto {
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() totalPages: number;
}

// Generic factory: คืนคลาสใหม่ที่มี data<T>[] + meta
export const Paginated = <TModel extends NestType<any>>(model: TModel) => {
  class PaginatedClass {
    @ApiProperty({ type: [model] })
    data: InstanceType<TModel>[];

    @ApiProperty({ type: () => PaginationMetaDto })
    meta: PaginationMetaDto;
  }
  return PaginatedClass;
};

// ---------- util สำหรับใช้งานจริงในโค้ด ----------
export type PaginatedData<T> = {
  data: T[];
  meta: PaginationMetaDto;
};

