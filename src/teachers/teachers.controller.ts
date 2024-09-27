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
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PaginationDto } from './dto/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomUploadFileTypeValidator } from './teachers.file.validators';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

const MAX_PROFILE_PICTURE_SIZE_IN_BYTES = 2 * 1024 * 1024; // 2 mb
const VALID_UPLOADS_MIME_TYPES = ['image/jpeg', 'image/png'];

@Controller('users')
export class TeachersController {
  constructor(private readonly usersService: TeachersService) {}

  @Get('pages')
  findAllByPage(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAllByPage(paginationDto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTeacherDto: CreateTeacherDto) {
    console.log(createTeacherDto);
    return this.usersService.create(createTeacherDto);
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
      '/public/users/images',
      randomFileName,
    );

    // Ensure the uploads directory exists
    fs.mkdirSync(path.dirname(uploadPath), { recursive: true });

    // Save the file
    fs.writeFileSync(uploadPath, file.buffer);

    // set image name of user
    const user = await this.usersService.findOne(+id);
    user.avatarUrl = randomFileName;
    await this.usersService.update(+id, user);
    return { message: 'File upload successful', filename: randomFileName };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.usersService.update(+id, updateTeacherDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  // @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
