import { IsString } from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Department {
  @PrimaryColumn()
  id: string;

  @IsString()
  @Column()
  name: string;

  // @OneToMany(() => Branch, (branch) => branch.department)
  // branches: Branch[];

  // @ManyToOne(() => Faculty, (faculty) => faculty.departments, { cascade: true })
  // faculty: Faculty;
}
