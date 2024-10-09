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
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from '../../dto/teacher/create-teacher.dto';
import { UpdateTeacherDto } from '../../dto/teacher/update-teacher.dto';
import { PaginationDto } from '../../dto/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomUploadFileTypeValidator } from './teachers.file.validators';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

const MAX_PROFILE_PICTURE_SIZE_IN_BYTES = 2 * 1024 * 1024; // 2 mb
const VALID_UPLOADS_MIME_TYPES = ['image/jpeg', 'image/png'];

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get('pages')
  findAllByPage(@Query() paginationDto: PaginationDto) {
    return this.teachersService.findAllByPage(paginationDto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTeacherDto: CreateTeacherDto) {
    console.log(createTeacherDto);
    return this.teachersService.create(createTeacherDto);
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
    const teacher = await this.teachersService.findOne(id);
    teacher.avatarUrl = randomFileName;
    await this.teachersService.update(id, teacher);
    return { message: 'File upload successful', filename: randomFileName };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.teachersService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teachersService.update(id, updateTeacherDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  // @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }
}
