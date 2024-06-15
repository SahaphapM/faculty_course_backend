import { IsString } from 'class-validator';
import { Branch } from 'src/branchs/entities/branch.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class Faculty {
  @PrimaryColumn()
  id: string;

  @IsString()
  @Column()
  name: string;

  @OneToMany(() => Branch, (branch) => branch.faculty)
  branches: Branch[];
}
