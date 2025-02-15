/*
  Warnings:

  - You are about to drop the column `skillId` on the `clo` table. All the data in the column will be lost.
  - You are about to drop the column `domain` on the `skill` table. All the data in the column will be lost.
  - You are about to drop the column `engDescription` on the `skill` table. All the data in the column will be lost.
  - You are about to drop the column `engName` on the `skill` table. All the data in the column will be lost.
  - You are about to drop the column `thaiDescription` on the `skill` table. All the data in the column will be lost.
  - You are about to drop the column `thaiName` on the `skill` table. All the data in the column will be lost.
  - You are about to drop the `skill_closure` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `skill` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `branch` DROP FOREIGN KEY `FK_dc9673eab0795a4e735b6b19109`;

-- DropForeignKey
ALTER TABLE `clo` DROP FOREIGN KEY `FK_cf6376eb88d18fe9cb34d397d86`;

-- DropForeignKey
ALTER TABLE `clo` DROP FOREIGN KEY `FK_f890ecb0ec4382ec8528373c8c3`;

-- DropForeignKey
ALTER TABLE `clo` DROP FOREIGN KEY `FK_ff37b2b9c2d6fcd62c22da0a2dc`;

-- DropForeignKey
ALTER TABLE `course` DROP FOREIGN KEY `FK_33b8f63c3518fa33a82e3779253`;

-- DropForeignKey
ALTER TABLE `course_enrollment` DROP FOREIGN KEY `FK_59e16bd8605d12d48dd554e4c03`;

-- DropForeignKey
ALTER TABLE `course_enrollment` DROP FOREIGN KEY `FK_f56e46a62d53037bde7b8bde36b`;

-- DropForeignKey
ALTER TABLE `course_instructors_instructor` DROP FOREIGN KEY `FK_364b5e066c8f9f5d60e14478262`;

-- DropForeignKey
ALTER TABLE `course_instructors_instructor` DROP FOREIGN KEY `FK_89a181cde7fb6268e7411d7c05f`;

-- DropForeignKey
ALTER TABLE `course_spec` DROP FOREIGN KEY `FK_7330e10fb6aeb6ea2cb629a8bc3`;

-- DropForeignKey
ALTER TABLE `course_spec` DROP FOREIGN KEY `FK_c05c80c12178c61d46baf40eadc`;

-- DropForeignKey
ALTER TABLE `curriculum` DROP FOREIGN KEY `FK_cb4a4d68b74d4ed9406b5506807`;

-- DropForeignKey
ALTER TABLE `curriculum_coordinators_instructor` DROP FOREIGN KEY `FK_386bbb70e1545d94c77bfa50fe0`;

-- DropForeignKey
ALTER TABLE `curriculum_coordinators_instructor` DROP FOREIGN KEY `FK_aa83cb8cc962d1e9c3db12388e2`;

-- DropForeignKey
ALTER TABLE `curriculum_subjects_subject` DROP FOREIGN KEY `FK_7f554fe966d57b5242986a93231`;

-- DropForeignKey
ALTER TABLE `curriculum_subjects_subject` DROP FOREIGN KEY `FK_a2c14947b1cbf7e96a9d71a0b08`;

-- DropForeignKey
ALTER TABLE `instructor` DROP FOREIGN KEY `FK_288b0c95f32ef3983af254db99d`;

-- DropForeignKey
ALTER TABLE `plo` DROP FOREIGN KEY `FK_e818d3fa7cfae760c0a9e61e5b3`;

-- DropForeignKey
ALTER TABLE `skill` DROP FOREIGN KEY `FK_52c4a3bd34076cc55abd1fe8e1a`;

-- DropForeignKey
ALTER TABLE `skill` DROP FOREIGN KEY `FK_ce9e932ee33444f5d895dedfe30`;

-- DropForeignKey
ALTER TABLE `skill` DROP FOREIGN KEY `FK_e234cee90be3691936e2350b610`;

-- DropForeignKey
ALTER TABLE `skill_closure` DROP FOREIGN KEY `FK_1c343f8561a77f5fd83376094d2`;

-- DropForeignKey
ALTER TABLE `skill_closure` DROP FOREIGN KEY `FK_6248283fe2abc0c715040faa38a`;

-- DropForeignKey
ALTER TABLE `skill_collection` DROP FOREIGN KEY `FK_11285e8bd61a36be29733d1de08`;

-- DropForeignKey
ALTER TABLE `skill_collection` DROP FOREIGN KEY `FK_63c3716bda417ef80c4ec1a90e1`;

-- DropForeignKey
ALTER TABLE `skill_collection` DROP FOREIGN KEY `FK_95de4de8664465fc0e64663d83a`;

-- DropForeignKey
ALTER TABLE `skill_expected_level` DROP FOREIGN KEY `FK_57349e9a4e934e2777ec5060416`;

-- DropForeignKey
ALTER TABLE `skill_expected_level` DROP FOREIGN KEY `FK_d2a8c300620df6991fa8b2bed75`;

-- DropForeignKey
ALTER TABLE `student` DROP FOREIGN KEY `FK_5f94399d84bb398de83e414cb0f`;

-- DropForeignKey
ALTER TABLE `subject` DROP FOREIGN KEY `FK_71de3e1325b95ad8ba7b9adff0a`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `FK_2279dce27cfb8d7b0e6e9bbf5cd`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `FK_d841b74fd2e92061b15c20d4eaa`;

-- DropIndex
DROP INDEX `REL_cf6376eb88d18fe9cb34d397d8` ON `clo`;

-- DropIndex
DROP INDEX `FK_ce9e932ee33444f5d895dedfe30` ON `skill`;

-- DropIndex
DROP INDEX `FK_e234cee90be3691936e2350b610` ON `skill`;

-- DropIndex
DROP INDEX `REL_52c4a3bd34076cc55abd1fe8e1` ON `skill`;

-- AlterTable
ALTER TABLE `clo` DROP COLUMN `skillId`;

-- AlterTable
ALTER TABLE `skill` DROP COLUMN `domain`,
    DROP COLUMN `engDescription`,
    DROP COLUMN `engName`,
    DROP COLUMN `thaiDescription`,
    DROP COLUMN `thaiName`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `skill_closure`;

-- AddForeignKey
ALTER TABLE `branch` ADD CONSTRAINT `branch_facultyId_fkey` FOREIGN KEY (`facultyId`) REFERENCES `faculty`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `course` ADD CONSTRAINT `course_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `course_enrollment` ADD CONSTRAINT `course_enrollment_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `course_enrollment` ADD CONSTRAINT `course_enrollment_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_instructors_instructor` ADD CONSTRAINT `course_instructors_instructor_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructor`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `course_instructors_instructor` ADD CONSTRAINT `course_instructors_instructor_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_spec` ADD CONSTRAINT `course_spec_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `course_spec` ADD CONSTRAINT `course_spec_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `curriculum` ADD CONSTRAINT `curriculum_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `curriculum_coordinators_instructor` ADD CONSTRAINT `curriculum_coordinators_instructor_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructor`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `curriculum_coordinators_instructor` ADD CONSTRAINT `curriculum_coordinators_instructor_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `curriculum_subjects_subject` ADD CONSTRAINT `curriculum_subjects_subject_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `curriculum_subjects_subject` ADD CONSTRAINT `curriculum_subjects_subject_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructor` ADD CONSTRAINT `instructor_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `plo` ADD CONSTRAINT `plo_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `clo` ADD CONSTRAINT `clo_ploId_fkey` FOREIGN KEY (`ploId`) REFERENCES `plo`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `clo` ADD CONSTRAINT `clo_courseSpecId_fkey` FOREIGN KEY (`courseSpecId`) REFERENCES `course_spec`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `skill` ADD CONSTRAINT `skill_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `skill`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill` ADD CONSTRAINT `skill_cloId_fkey` FOREIGN KEY (`cloId`) REFERENCES `clo`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill` ADD CONSTRAINT `skill_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill_collection` ADD CONSTRAINT `skill_collection_courseEnrollmentId_fkey` FOREIGN KEY (`courseEnrollmentId`) REFERENCES `course_enrollment`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `skill_collection` ADD CONSTRAINT `skill_collection_ExpectedLevelId_fkey` FOREIGN KEY (`ExpectedLevelId`) REFERENCES `skill_expected_level`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill_collection` ADD CONSTRAINT `skill_collection_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill_expected_level` ADD CONSTRAINT `skill_expected_level_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `skill`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `skill_expected_level` ADD CONSTRAINT `skill_expected_level_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student` ADD CONSTRAINT `student_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subject` ADD CONSTRAINT `subject_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `instructor`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- RedefineIndex
CREATE INDEX `branch_facultyId_idx` ON `branch`(`facultyId`);
DROP INDEX `FK_dc9673eab0795a4e735b6b19109` ON `branch`;

-- RedefineIndex
CREATE INDEX `clo_ploId_idx` ON `clo`(`ploId`);
DROP INDEX `FK_f890ecb0ec4382ec8528373c8c3` ON `clo`;

-- RedefineIndex
CREATE INDEX `clo_courseSpecId_idx` ON `clo`(`courseSpecId`);
DROP INDEX `FK_ff37b2b9c2d6fcd62c22da0a2dc` ON `clo`;

-- RedefineIndex
CREATE INDEX `course_subjectId_idx` ON `course`(`subjectId`);
DROP INDEX `FK_33b8f63c3518fa33a82e3779253` ON `course`;

-- RedefineIndex
CREATE INDEX `course_enrollment_courseId_idx` ON `course_enrollment`(`courseId`);
DROP INDEX `FK_59e16bd8605d12d48dd554e4c03` ON `course_enrollment`;

-- RedefineIndex
CREATE INDEX `course_enrollment_studentId_idx` ON `course_enrollment`(`studentId`);
DROP INDEX `FK_f56e46a62d53037bde7b8bde36b` ON `course_enrollment`;

-- RedefineIndex
CREATE INDEX `course_instructors_instructor_instructorId_idx` ON `course_instructors_instructor`(`instructorId`);
DROP INDEX `IDX_364b5e066c8f9f5d60e1447826` ON `course_instructors_instructor`;

-- RedefineIndex
CREATE INDEX `course_instructors_instructor_courseId_idx` ON `course_instructors_instructor`(`courseId`);
DROP INDEX `IDX_89a181cde7fb6268e7411d7c05` ON `course_instructors_instructor`;

-- RedefineIndex
CREATE INDEX `course_spec_subjectId_idx` ON `course_spec`(`subjectId`);
DROP INDEX `FK_7330e10fb6aeb6ea2cb629a8bc3` ON `course_spec`;

-- RedefineIndex
CREATE INDEX `course_spec_curriculumId_idx` ON `course_spec`(`curriculumId`);
DROP INDEX `FK_c05c80c12178c61d46baf40eadc` ON `course_spec`;

-- RedefineIndex
CREATE INDEX `curriculum_branchId_idx` ON `curriculum`(`branchId`);
DROP INDEX `FK_cb4a4d68b74d4ed9406b5506807` ON `curriculum`;

-- RedefineIndex
CREATE UNIQUE INDEX `curriculum_code_key` ON `curriculum`(`code`);
DROP INDEX `IDX_72c5b54e0616ebfcf4aab3aa52` ON `curriculum`;

-- RedefineIndex
CREATE INDEX `curriculum_coordinators_instructor_instructorId_idx` ON `curriculum_coordinators_instructor`(`instructorId`);
DROP INDEX `IDX_386bbb70e1545d94c77bfa50fe` ON `curriculum_coordinators_instructor`;

-- RedefineIndex
CREATE INDEX `curriculum_coordinators_instructor_curriculumId_idx` ON `curriculum_coordinators_instructor`(`curriculumId`);
DROP INDEX `IDX_aa83cb8cc962d1e9c3db12388e` ON `curriculum_coordinators_instructor`;

-- RedefineIndex
CREATE INDEX `curriculum_subjects_subject_subjectId_idx` ON `curriculum_subjects_subject`(`subjectId`);
DROP INDEX `IDX_7f554fe966d57b5242986a9323` ON `curriculum_subjects_subject`;

-- RedefineIndex
CREATE INDEX `curriculum_subjects_subject_curriculumId_idx` ON `curriculum_subjects_subject`(`curriculumId`);
DROP INDEX `IDX_a2c14947b1cbf7e96a9d71a0b0` ON `curriculum_subjects_subject`;

-- RedefineIndex
CREATE UNIQUE INDEX `instructor_code_key` ON `instructor`(`code`);
DROP INDEX `IDX_acc29242f4471113684876c33c` ON `instructor`;

-- RedefineIndex
CREATE UNIQUE INDEX `instructor_branchId_key` ON `instructor`(`branchId`);
DROP INDEX `REL_288b0c95f32ef3983af254db99` ON `instructor`;

-- RedefineIndex
CREATE INDEX `plo_curriculumId_idx` ON `plo`(`curriculumId`);
DROP INDEX `FK_e818d3fa7cfae760c0a9e61e5b3` ON `plo`;

-- RedefineIndex
CREATE INDEX `skill_collection_courseEnrollmentId_idx` ON `skill_collection`(`courseEnrollmentId`);
DROP INDEX `FK_11285e8bd61a36be29733d1de08` ON `skill_collection`;

-- RedefineIndex
CREATE INDEX `skill_collection_ExpectedLevelId_idx` ON `skill_collection`(`ExpectedLevelId`);
DROP INDEX `FK_63c3716bda417ef80c4ec1a90e1` ON `skill_collection`;

-- RedefineIndex
CREATE INDEX `skill_collection_studentId_idx` ON `skill_collection`(`studentId`);
DROP INDEX `FK_95de4de8664465fc0e64663d83a` ON `skill_collection`;

-- RedefineIndex
CREATE INDEX `skill_expected_level_skillId_idx` ON `skill_expected_level`(`skillId`);
DROP INDEX `FK_57349e9a4e934e2777ec5060416` ON `skill_expected_level`;

-- RedefineIndex
CREATE INDEX `skill_expected_level_subjectId_idx` ON `skill_expected_level`(`subjectId`);
DROP INDEX `FK_d2a8c300620df6991fa8b2bed75` ON `skill_expected_level`;

-- RedefineIndex
CREATE UNIQUE INDEX `student_branchId_key` ON `student`(`branchId`);
DROP INDEX `REL_5f94399d84bb398de83e414cb0` ON `student`;

-- RedefineIndex
CREATE INDEX `subject_curriculumId_idx` ON `subject`(`curriculumId`);
DROP INDEX `FK_71de3e1325b95ad8ba7b9adff0a` ON `subject`;

-- RedefineIndex
CREATE UNIQUE INDEX `subject_code_key` ON `subject`(`code`);
DROP INDEX `IDX_92374adc6b583e8cf659977e48` ON `subject`;

-- RedefineIndex
CREATE UNIQUE INDEX `user_email_key` ON `user`(`email`);
DROP INDEX `IDX_e12875dfb3b1d92d7d7c5377e2` ON `user`;

-- RedefineIndex
CREATE UNIQUE INDEX `user_studentId_key` ON `user`(`studentId`);
DROP INDEX `REL_2279dce27cfb8d7b0e6e9bbf5c` ON `user`;

-- RedefineIndex
CREATE UNIQUE INDEX `user_teacherId_key` ON `user`(`teacherId`);
DROP INDEX `REL_d841b74fd2e92061b15c20d4ea` ON `user`;
