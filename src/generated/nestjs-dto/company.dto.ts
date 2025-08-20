
import {ApiProperty} from '@nestjs/swagger'


export class CompanyDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'string',
})
name: string ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
description: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
address: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
tel: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
email: string  | null;
}
