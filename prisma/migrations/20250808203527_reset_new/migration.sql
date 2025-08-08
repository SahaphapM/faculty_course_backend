-- CreateTable
CREATE TABLE `branch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `facultyId` INTEGER NULL,
    `thaiDescription` TEXT NULL,
    `engDescription` TEXT NULL,
    `thaiName` VARCHAR(255) NULL,
    `engName` VARCHAR(255) NULL,
    `abbrev` VARCHAR(5) NULL,

    INDEX `branch_facultyId_idx`(`facultyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `active` BOOLEAN NULL DEFAULT true,
    `semester` TINYINT NOT NULL,
    `year` SMALLINT NOT NULL,
    `subjectId` INTEGER NOT NULL,

    INDEX `course_subjectId_idx`(`subjectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_instructor` (
    `instructorId` INTEGER NOT NULL,
    `courseId` INTEGER NOT NULL,

    INDEX `course_instructor_instructorId_idx`(`instructorId`),
    INDEX `course_instructor_courseId_idx`(`courseId`),
    PRIMARY KEY (`instructorId`, `courseId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `curriculumId` INTEGER NOT NULL,
    `thaiName` VARCHAR(255) NULL,
    `engName` VARCHAR(255) NULL,
    `credit` VARCHAR(10) NULL,
    `type` VARCHAR(255) NOT NULL DEFAULT 'บังคับ',
    `thaiDescription` TEXT NULL,
    `engDescription` TEXT NULL,
    `isRoot` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `subject_code_key`(`code`),
    INDEX `subject_curriculumId_idx`(`curriculumId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `curriculum` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchId` INTEGER NOT NULL,
    `code` VARCHAR(255) NOT NULL,
    `thaiName` VARCHAR(255) NULL,
    `engName` VARCHAR(255) NULL,
    `thaiDegree` VARCHAR(255) NULL,
    `engDegree` VARCHAR(255) NULL,
    `period` TINYINT NOT NULL,
    `minimumGrade` DECIMAL(3, 2) NOT NULL,
    `thaiDescription` TEXT NULL,
    `engDescription` TEXT NULL,

    UNIQUE INDEX `curriculum_code_key`(`code`),
    INDEX `curriculum_branchId_idx`(`branchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `curriculum_coordinators` (
    `instructorId` INTEGER NOT NULL,
    `curriculumId` INTEGER NOT NULL,

    INDEX `curriculum_coordinators_instructorId_idx`(`instructorId`),
    INDEX `curriculum_coordinators_curriculumId_idx`(`curriculumId`),
    PRIMARY KEY (`instructorId`, `curriculumId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faculty` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `thaiName` VARCHAR(255) NOT NULL,
    `engName` VARCHAR(255) NULL,
    `thaiDescription` TEXT NULL,
    `engDescription` TEXT NULL,
    `abbrev` VARCHAR(10) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instructor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchId` INTEGER NULL,
    `code` VARCHAR(255) NULL,
    `thaiName` VARCHAR(255) NOT NULL,
    `engName` VARCHAR(255) NOT NULL,
    `tel` VARCHAR(255) NULL,
    `position` VARCHAR(255) NULL,
    `email` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `instructor_code_key`(`code`),
    UNIQUE INDEX `instructor_thaiName_key`(`thaiName`),
    UNIQUE INDEX `instructor_engName_key`(`engName`),
    UNIQUE INDEX `instructor_email_key`(`email`),
    INDEX `instructor_branchId_fkey`(`branchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `curriculumId` INTEGER NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NULL,
    `thaiDescription` TEXT NULL,
    `engDescription` TEXT NULL,

    INDEX `plo_curriculumId_idx`(`curriculumId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `ploId` INTEGER NULL,
    `subjectId` INTEGER NULL,
    `thaiDescription` TEXT NULL,
    `engDescription` TEXT NULL,
    `skillId` INTEGER NULL,
    `expectSkillLevel` TINYINT NULL,

    INDEX `clo_ploId_idx`(`ploId`),
    INDEX `clo_subjectId_idx`(`subjectId`),
    INDEX `clo_skillId_idx`(`skillId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skill` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `thaiName` VARCHAR(255) NOT NULL,
    `engName` VARCHAR(255) NOT NULL,
    `thaiDescription` TEXT NOT NULL,
    `engDescription` TEXT NOT NULL,
    `domain` VARCHAR(100) NOT NULL,
    `parentId` INTEGER NULL,
    `curriculumId` INTEGER NOT NULL,

    INDEX `skill_curriculumId_fkey`(`curriculumId`),
    INDEX `skill_parentId_fkey`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skill_collection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NULL,
    `gainedLevel` INTEGER NOT NULL DEFAULT 0,
    `passed` BOOLEAN NOT NULL DEFAULT false,
    `cloId` INTEGER NULL,
    `courseId` INTEGER NULL,

    INDEX `skill_collection_studentId_cloId_courseId_idx`(`studentId`, `cloId`, `courseId`),
    INDEX `skill_collection_cloId_fkey`(`cloId`),
    INDEX `skill_collection_courseId_fkey`(`courseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(255) NOT NULL,
    `engName` VARCHAR(255) NULL,
    `enrollmentDate` DATETIME(0) NULL,
    `socials` LONGTEXT NULL,
    `thaiName` VARCHAR(255) NULL,
    `curriculumId` INTEGER NULL,
    `branchId` INTEGER NULL,
    `userId` INTEGER NULL,

    UNIQUE INDEX `student_code_key`(`code`),
    INDEX `student_code_idx`(`code`),
    INDEX `student_branchId_fkey`(`branchId`),
    INDEX `student_curriculumId_fkey`(`curriculumId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lesson` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subjectId` INTEGER NOT NULL,
    `thaiName` VARCHAR(255) NULL,
    `engName` VARCHAR(255) NULL,

    UNIQUE INDEX `lesson_subjectId_key`(`subjectId`),
    INDEX `lesson_subjectId_idx`(`subjectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `avatarUrl` VARCHAR(255) NULL,
    `role` VARCHAR(255) NULL,
    `hashedRefreshToken` VARCHAR(255) NULL,
    `studentId` INTEGER NULL,
    `instructorId` INTEGER NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    UNIQUE INDEX `user_studentId_key`(`studentId`),
    UNIQUE INDEX `user_instructorId_key`(`instructorId`),
    UNIQUE INDEX `user_instructorId_studentId_key`(`instructorId`, `studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `address` TEXT NULL,
    `tel` VARCHAR(50) NULL,
    `email` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_position` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company_job_position` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NULL,
    `jobPositionId` INTEGER NULL,

    INDEX `company_job_position_companyId_fkey`(`companyId`),
    INDEX `company_job_position_jobPositionId_fkey`(`jobPositionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `internship` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` INTEGER NULL,
    `token` VARCHAR(32) NULL,
    `companyId` INTEGER NULL,

    UNIQUE INDEX `internship_token_key`(`token`),
    INDEX `internship_companyId_fkey`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_internship` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `isAssessed` BOOLEAN NOT NULL DEFAULT false,
    `studentId` INTEGER NULL,
    `jobPositionId` INTEGER NULL,
    `internshipId` INTEGER NULL,

    INDEX `student_internship_internshipId_idx`(`internshipId`),
    INDEX `student_internship_jobPositionId_idx`(`jobPositionId`),
    INDEX `student_internship_studentId_fkey`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skill_assessment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `curriculumLevel` INTEGER NULL DEFAULT 0,
    `companyLevel` INTEGER NULL DEFAULT 0,
    `finalLevel` INTEGER NULL DEFAULT 0,
    `curriculumComment` TEXT NULL,
    `companyComment` TEXT NULL,
    `skillId` INTEGER NULL,
    `studentId` INTEGER NULL,

    INDEX `skill_assessment_skillId_studentId_idx`(`skillId`, `studentId`),
    INDEX `skill_assessment_studentId_fkey`(`studentId`),
    UNIQUE INDEX `skill_assessment_skillId_studentId_key`(`skillId`, `studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `action` VARCHAR(100) NOT NULL,
    `resource` VARCHAR(100) NOT NULL,
    `resourceId` VARCHAR(255) NULL,
    `before` JSON NULL,
    `after` JSON NULL,
    `metadata` JSON NULL,
    `timestamp` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `audit_log_userId_idx`(`userId`),
    INDEX `audit_log_action_idx`(`action`),
    INDEX `audit_log_resource_idx`(`resource`),
    INDEX `audit_log_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `branch` ADD CONSTRAINT `branch_facultyId_fkey` FOREIGN KEY (`facultyId`) REFERENCES `faculty`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course` ADD CONSTRAINT `course_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_instructor` ADD CONSTRAINT `course_instructor_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_instructor` ADD CONSTRAINT `course_instructor_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructor`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subject` ADD CONSTRAINT `subject_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `curriculum` ADD CONSTRAINT `curriculum_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `curriculum_coordinators` ADD CONSTRAINT `curriculum_coordinators_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `curriculum_coordinators` ADD CONSTRAINT `curriculum_coordinators_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructor` ADD CONSTRAINT `instructor_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `plo` ADD CONSTRAINT `plo_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clo` ADD CONSTRAINT `clo_ploId_fkey` FOREIGN KEY (`ploId`) REFERENCES `plo`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `clo` ADD CONSTRAINT `clo_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `skill`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `clo` ADD CONSTRAINT `clo_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill` ADD CONSTRAINT `skill_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill` ADD CONSTRAINT `skill_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `skill`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill_collection` ADD CONSTRAINT `skill_collection_cloId_fkey` FOREIGN KEY (`cloId`) REFERENCES `clo`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `skill_collection` ADD CONSTRAINT `skill_collection_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `skill_collection` ADD CONSTRAINT `skill_collection_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student` ADD CONSTRAINT `student_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student` ADD CONSTRAINT `student_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `lesson` ADD CONSTRAINT `lesson_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructor`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `company_job_position` ADD CONSTRAINT `company_job_position_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company_job_position` ADD CONSTRAINT `company_job_position_jobPositionId_fkey` FOREIGN KEY (`jobPositionId`) REFERENCES `job_position`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `internship` ADD CONSTRAINT `internship_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_internship` ADD CONSTRAINT `student_internship_internshipId_fkey` FOREIGN KEY (`internshipId`) REFERENCES `internship`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_internship` ADD CONSTRAINT `student_internship_jobPositionId_fkey` FOREIGN KEY (`jobPositionId`) REFERENCES `job_position`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_internship` ADD CONSTRAINT `student_internship_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill_assessment` ADD CONSTRAINT `skill_assessment_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `skill`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill_assessment` ADD CONSTRAINT `skill_assessment_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
