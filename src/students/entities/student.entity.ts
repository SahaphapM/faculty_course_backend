import { CourseDetail } from 'src/courses/entities/courseDetail.entity';
import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';

@Entity()
export class Student {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  id: string; // e.g., "65160309"

  @Column({ type: 'varchar', length: 20 })
  nationalId: string; // e.g., "1659700011979"

  @Column({ type: 'varchar', length: 100 })
  name: string; // e.g., "นายสหภาพ ฤทธิ์เนติกุล"

  @Column({ type: 'varchar', length: 100 })
  nameInEnglish: string; // e.g., "MR. SAHAPHAP RITNETIKUL"

  // @ManyToOne(() => Faculty, (faculty) => faculty.students)
  // faculty: Faculty;

  @Column({ type: 'varchar', length: 100 })
  campus: string; // e.g., "Bangsaen"

  @Column({ type: 'varchar', length: 100 })
  program: string; // e.g., "2134003 B.Sc. (Computer Science) Updated 65 - 4-Year Regular"

  @Column({ type: 'varchar', length: 50, nullable: true })
  minor: string | null; // e.g., "-"

  @Column({ type: 'varchar', length: 50 })
  educationLevel: string; // e.g., "Bachelor's Degree"

  @Column({ type: 'varchar', length: 100 })
  degreeName: string; // e.g., "Bachelor of Science B.Sc. (Computer Science) Updated 65 - 4-Year Regular"

  @Column({ type: 'date' })
  admissionDate: Date; // e.g., "2022-07-06"

  @Column({ type: 'varchar', length: 50, nullable: true })
  status: string | null; // e.g., null if no status

  @Column({ type: 'varchar', length: 50 })
  admissionMethod: string; // e.g., "Central Admission"

  @Column({ type: 'varchar', length: 50 })
  previousQualification: string; // e.g., "High School"

  @Column({ type: 'float', nullable: true })
  previousQualificationGPA: number | null; // e.g., 3.17

  @Column({ type: 'varchar', length: 100 })
  previousSchool: string; // e.g., "ภาชี สุนทรวิทยานุกูล "

  @Column({ type: 'varchar', length: 100 })
  advisor: string; // e.g., "Professor Benjaporn Chantarakongkul"

  @Column({ type: 'int' })
  totalCredits: number; // e.g., 70

  @Column({ type: 'int' })
  creditsPassed: number; // e.g., 70

  @Column({ type: 'float' })
  gpa: number; // e.g., 3.54

  @OneToMany(() => CourseDetail, (courseDetail) => courseDetail.student, {
    cascade: false,
  })
  courseDetails: CourseDetail[];
}
