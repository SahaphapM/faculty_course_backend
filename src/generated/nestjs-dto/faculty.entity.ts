
import {ApiProperty} from '@nestjs/swagger'
import {Branch} from './branch.entity'


export class Faculty {
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
engName: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
description: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
abbrev: string  | null;
@ApiProperty({
  type: () => Branch,
  isArray: true,
  required: false,
})
branch?: Branch[] ;
}
