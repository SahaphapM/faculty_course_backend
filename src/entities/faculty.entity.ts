import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Branch } from './branch.entity';

@Entity()
export class Faculty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  engName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true, length: 10 })
  abbrev: string; //CS, AI, SE etc.

  @OneToMany(() => Branch, (branch) => branch.faculty, { cascade: true })
  branches: Branch[];
}
