import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { InstructorsService } from './instructors.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomUploadFileTypeValidator } from './instructors.file.validators';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateInstructorDto } from 'src/generated/nestjs-dto/create-instructor.dto';
import { UpdateInstructorDto } from 'src/generated/nestjs-dto/update-instructor.dto';
import { UserRole } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { InstructorFilterDto } from 'src/dto/filters/filter.instructors.dto';

const MAX_PROFILE_PICTURE_SIZE_IN_BYTES = 2 * 1024 * 1024; // 2 mb
const VALID_UPLOADS_MIME_TYPES = ['image/jpeg', 'image/png'];

@ApiBearerAuth()
@Controller('instructors')
export class InstructorsController {
  constructor(private readonly insService: InstructorsService) {}

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTeacherDto: CreateInstructorDto) {
    return this.insService.create(createTeacherDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Post('assign-coordinator')
  @HttpCode(HttpStatus.OK)
  selectInstructorToCurriculum(
    @Query('curriculumId') curriculumId: string,
    @Query('instructorId') instructorId: string,
  ) {
    return this.insService.updateCoordinatorToCurriculum(
      +instructorId,
      +curriculumId,
    );
  }

  @Post(':id/image/upload')
  @UseInterceptors(FileInterceptor('image'))
  public async uploadFile(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addValidator(
          // we use custom validator to validate the hiatus file example prevent .pdf to .png
          new CustomUploadFileTypeValidator({
            fileType: VALID_UPLOADS_MIME_TYPES,
          }),
        )
        .addMaxSizeValidator({ maxSize: MAX_PROFILE_PICTURE_SIZE_IN_BYTES })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) {
      return 'No file uploaded.';
    }

    // Generate a random filename
    const fileExtension = path.extname(file.originalname);
    const randomFileName = `${uuidv4()}${fileExtension}`;
    const uploadPath = path.join(
      process.cwd(),
      '/public/teachers/images',
      randomFileName,
    );

    // Ensure the uploads directory exists
    fs.mkdirSync(path.dirname(uploadPath), { recursive: true });

    // Save the file
    fs.writeFileSync(uploadPath, file.buffer);

    // set image name of teacher
    const teacher = (await this.insService.findOne(
      +id,
    )) as unknown as UpdateInstructorDto;
    teacher.picture = randomFileName;
    await this.insService.update(+id, teacher);
    return { message: 'File upload successful', filename: randomFileName };
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() pag?: InstructorFilterDto) {
    return this.insService.findAll(pag);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.insService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateTeacherDto: UpdateInstructorDto,
  ) {
    return this.insService.update(+id, updateTeacherDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  // @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.insService.remove(+id);
  }
}
