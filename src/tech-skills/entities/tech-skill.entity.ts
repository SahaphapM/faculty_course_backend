import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class TechSkill {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;
}
