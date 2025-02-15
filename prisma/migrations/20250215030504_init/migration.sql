-- CreateTable
CREATE TABLE `branch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `engName` VARCHAR(255) NULL,
    `facultyId` INTEGER NULL,
    `description` VARCHAR(255) NULL,
    `thaiName` VARCHAR(255) NOT NULL,
    `abbrev` VARCHAR(5) NULL,

    INDEX `FK_dc9673eab0795a4e735b6b19109`(`facultyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `ploId` INTEGER NULL,
    `courseSpecId` INTEGER NULL,
    `thaiDescription` TEXT NULL,
    `engDescription` TEXT NULL,
    `skillId` INTEGER NULL,

    UNIQUE INDEX `REL_cf6376eb88d18fe9cb34d397d8`(`skillId`),
    INDEX `FK_f890ecb0ec4382ec8528373c8c3`(`ploId`),
    INDEX `FK_ff37b2b9c2d6fcd62c22da0a2dc`(`courseSpecId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course` (
    `name` VARCHAR(255) NOT NULL,
    `active` TINYINT NULL DEFAULT 1,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subjectId` INTEGER NULL,
    `thaiDescription` TEXT NULL,
    `engDescription` TEXT NULL,

    INDEX `FK_33b8f63c3518fa33a82e3779253`(`subjectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_enrollment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `courseId` INTEGER NULL,
    `studentId` INTEGER NULL,

    INDEX `FK_59e16bd8605d12d48dd554e4c03`(`courseId`),
    INDEX `FK_f56e46a62d53037bde7b8bde36b`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_instructors_instructor` (
    `instructorId` INTEGER NOT NULL,
    `courseId` INTEGER NOT NULL,

    INDEX `IDX_364b5e066c8f9f5d60e1447826`(`instructorId`),
    INDEX `IDX_89a181cde7fb6268e7411d7c05`(`courseId`),
    PRIMARY KEY (`instructorId`, `courseId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_spec` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `curriculumId` INTEGER NULL,
    `subjectId` INTEGER NULL,
    `thaiName` VARCHAR(255) NULL,
    `engName` VARCHAR(255) NULL,
    `credit` VARCHAR(255) NULL,
    `type` VARCHAR(255) NOT NULL DEFAULT 'บังคับ',
    `thaiDescription` TEXT NULL,
    `engDescription` TEXT NULL,

    INDEX `FK_7330e10fb6aeb6ea2cb629a8bc3`(`subjectId`),
    INDEX `FK_c05c80c12178c61d46baf40eadc`(`curriculumId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `curriculum` (
    `engName` VARCHAR(255) NULL,
    `engDegree` VARCHAR(255) NULL,
    `period` INTEGER NOT NULL,
    `minimumGrade` INTEGER NOT NULL,
    `branchId` INTEGER NULL,
    `code` VARCHAR(255) NOT NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `thaiName` VARCHAR(255) NULL,
    `thaiDegree` VARCHAR(255) NULL,
    `thaiDescription` TEXT NULL,
    `engDescription` TEXT NULL,

    UNIQUE INDEX `IDX_72c5b54e0616ebfcf4aab3aa52`(`code`),
    INDEX `FK_cb4a4d68b74d4ed9406b5506807`(`branchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `curriculum_coordinators_instructor` (
    `instructorId` INTEGER NOT NULL,
    `curriculumId` INTEGER NOT NULL,

    INDEX `IDX_386bbb70e1545d94c77bfa50fe`(`instructorId`),
    INDEX `IDX_aa83cb8cc962d1e9c3db12388e`(`curriculumId`),
    PRIMARY KEY (`instructorId`, `curriculumId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `curriculum_subjects_subject` (
    `curriculumId` INTEGER NOT NULL,
    `subjectId` INTEGER NOT NULL,

    INDEX `IDX_7f554fe966d57b5242986a9323`(`subjectId`),
    INDEX `IDX_a2c14947b1cbf7e96a9d71a0b0`(`curriculumId`),
    PRIMARY KEY (`curriculumId`, `subjectId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faculty` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `engName` VARCHAR(255) NULL,
    `description` VARCHAR(255) NULL,
    `abbrev` VARCHAR(10) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instructor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `engName` VARCHAR(255) NULL,
    `tel` VARCHAR(255) NULL,
    `picture` VARCHAR(255) NULL,
    `position` VARCHAR(255) NULL,
    `email` VARCHAR(255) NOT NULL,
    `officeRoom` VARCHAR(255) NULL,
    `specialists` VARCHAR(255) NULL,
    `socials` VARCHAR(255) NULL,
    `branchId` INTEGER NULL,
    `code` VARCHAR(255) NOT NULL,
    `thaiName` VARCHAR(255) NULL,
    `bio` TEXT NULL,

    UNIQUE INDEX `REL_288b0c95f32ef3983af254db99`(`branchId`),
    UNIQUE INDEX `IDX_acc29242f4471113684876c33c`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plo` (
    `curriculumId` INTEGER NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NULL,
    `thaiDescription` TEXT NULL,
    `engDescription` TEXT NULL,

    INDEX `FK_e818d3fa7cfae760c0a9e61e5b3`(`curriculumId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skill` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `domain` VARCHAR(255) NULL DEFAULT 'ทักษะ',
    `parentId` INTEGER NULL,
    `cloId` INTEGER NULL,
    `curriculumId` INTEGER NULL,
    `thaiName` VARCHAR(255) NULL,
    `engName` VARCHAR(255) NULL,
    `thaiDescription` TEXT NULL,
    `engDescription` TEXT NULL,

    UNIQUE INDEX `REL_52c4a3bd34076cc55abd1fe8e1`(`cloId`),
    INDEX `FK_ce9e932ee33444f5d895dedfe30`(`curriculumId`),
    INDEX `FK_e234cee90be3691936e2350b610`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skill_closure` (
    `id_ancestor` INTEGER NOT NULL,
    `id_descendant` INTEGER NOT NULL,

    INDEX `IDX_1c343f8561a77f5fd83376094d`(`id_descendant`),
    INDEX `IDX_6248283fe2abc0c715040faa38`(`id_ancestor`),
    PRIMARY KEY (`id_ancestor`, `id_descendant`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skill_collection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gainedLevel` INTEGER NOT NULL DEFAULT 0,
    `passed` TINYINT NOT NULL DEFAULT 0,
    `ExpectedLevelId` INTEGER NULL,
    `courseEnrollmentId` INTEGER NULL,
    `studentId` INTEGER NULL,

    INDEX `FK_11285e8bd61a36be29733d1de08`(`courseEnrollmentId`),
    INDEX `FK_63c3716bda417ef80c4ec1a90e1`(`ExpectedLevelId`),
    INDEX `FK_95de4de8664465fc0e64663d83a`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skill_expected_level` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `expectedLevel` INTEGER NULL,
    `skillId` INTEGER NULL,
    `subjectId` INTEGER NULL,

    INDEX `FK_57349e9a4e934e2777ec5060416`(`skillId`),
    INDEX `FK_d2a8c300620df6991fa8b2bed75`(`subjectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student` (
    `engName` VARCHAR(255) NULL,
    `enrollmentDate` DATETIME(0) NULL,
    `socials` VARCHAR(255) NULL,
    `branchId` INTEGER NULL,
    `code` VARCHAR(255) NOT NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `thaiName` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `REL_5f94399d84bb398de83e414cb0`(`branchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject` (
    `engName` VARCHAR(255) NULL,
    `code` VARCHAR(255) NOT NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `curriculumId` INTEGER NULL,
    `thaiName` VARCHAR(255) NULL,

    UNIQUE INDEX `IDX_92374adc6b583e8cf659977e48`(`code`),
    INDEX `FK_71de3e1325b95ad8ba7b9adff0a`(`curriculumId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `avatarUrl` VARCHAR(255) NOT NULL DEFAULT 'unknown.jpg',
    `role` VARCHAR(255) NULL,
    `hashedRefreshToken` VARCHAR(255) NULL,
    `teacherId` INTEGER NULL,
    `studentId` INTEGER NULL,

    UNIQUE INDEX `IDX_e12875dfb3b1d92d7d7c5377e2`(`email`),
    UNIQUE INDEX `REL_d841b74fd2e92061b15c20d4ea`(`teacherId`),
    UNIQUE INDEX `REL_2279dce27cfb8d7b0e6e9bbf5c`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `branch` ADD CONSTRAINT `FK_dc9673eab0795a4e735b6b19109` FOREIGN KEY (`facultyId`) REFERENCES `faculty`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `clo` ADD CONSTRAINT `FK_cf6376eb88d18fe9cb34d397d86` FOREIGN KEY (`skillId`) REFERENCES `skill`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `clo` ADD CONSTRAINT `FK_f890ecb0ec4382ec8528373c8c3` FOREIGN KEY (`ploId`) REFERENCES `plo`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `clo` ADD CONSTRAINT `FK_ff37b2b9c2d6fcd62c22da0a2dc` FOREIGN KEY (`courseSpecId`) REFERENCES `course_spec`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `course` ADD CONSTRAINT `FK_33b8f63c3518fa33a82e3779253` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `course_enrollment` ADD CONSTRAINT `FK_59e16bd8605d12d48dd554e4c03` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `course_enrollment` ADD CONSTRAINT `FK_f56e46a62d53037bde7b8bde36b` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_instructors_instructor` ADD CONSTRAINT `FK_364b5e066c8f9f5d60e14478262` FOREIGN KEY (`instructorId`) REFERENCES `instructor`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `course_instructors_instructor` ADD CONSTRAINT `FK_89a181cde7fb6268e7411d7c05f` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_spec` ADD CONSTRAINT `FK_7330e10fb6aeb6ea2cb629a8bc3` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `course_spec` ADD CONSTRAINT `FK_c05c80c12178c61d46baf40eadc` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `curriculum` ADD CONSTRAINT `FK_cb4a4d68b74d4ed9406b5506807` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `curriculum_coordinators_instructor` ADD CONSTRAINT `FK_386bbb70e1545d94c77bfa50fe0` FOREIGN KEY (`instructorId`) REFERENCES `instructor`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `curriculum_coordinators_instructor` ADD CONSTRAINT `FK_aa83cb8cc962d1e9c3db12388e2` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `curriculum_subjects_subject` ADD CONSTRAINT `FK_7f554fe966d57b5242986a93231` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `curriculum_subjects_subject` ADD CONSTRAINT `FK_a2c14947b1cbf7e96a9d71a0b08` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructor` ADD CONSTRAINT `FK_288b0c95f32ef3983af254db99d` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `plo` ADD CONSTRAINT `FK_e818d3fa7cfae760c0a9e61e5b3` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `skill` ADD CONSTRAINT `FK_52c4a3bd34076cc55abd1fe8e1a` FOREIGN KEY (`cloId`) REFERENCES `clo`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `skill` ADD CONSTRAINT `FK_ce9e932ee33444f5d895dedfe30` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `skill` ADD CONSTRAINT `FK_e234cee90be3691936e2350b610` FOREIGN KEY (`parentId`) REFERENCES `skill`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `skill_closure` ADD CONSTRAINT `FK_1c343f8561a77f5fd83376094d2` FOREIGN KEY (`id_descendant`) REFERENCES `skill`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `skill_closure` ADD CONSTRAINT `FK_6248283fe2abc0c715040faa38a` FOREIGN KEY (`id_ancestor`) REFERENCES `skill`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `skill_collection` ADD CONSTRAINT `FK_11285e8bd61a36be29733d1de08` FOREIGN KEY (`courseEnrollmentId`) REFERENCES `course_enrollment`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `skill_collection` ADD CONSTRAINT `FK_63c3716bda417ef80c4ec1a90e1` FOREIGN KEY (`ExpectedLevelId`) REFERENCES `skill_expected_level`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill_collection` ADD CONSTRAINT `FK_95de4de8664465fc0e64663d83a` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill_expected_level` ADD CONSTRAINT `FK_57349e9a4e934e2777ec5060416` FOREIGN KEY (`skillId`) REFERENCES `skill`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `skill_expected_level` ADD CONSTRAINT `FK_d2a8c300620df6991fa8b2bed75` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student` ADD CONSTRAINT `FK_5f94399d84bb398de83e414cb0f` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subject` ADD CONSTRAINT `FK_71de3e1325b95ad8ba7b9adff0a` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `FK_2279dce27cfb8d7b0e6e9bbf5cd` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `FK_d841b74fd2e92061b15c20d4eaa` FOREIGN KEY (`teacherId`) REFERENCES `instructor`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
