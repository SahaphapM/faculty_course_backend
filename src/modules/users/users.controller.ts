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
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomUploadFileTypeValidator } from './users.file.validators';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { FilterParams } from 'src/dto/filter-params.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from 'src/generated/nestjs-dto/create-user.dto';
import { UpdateUserDto } from 'src/generated/nestjs-dto/update-user.dto';

const MAX_PROFILE_PICTURE_SIZE_IN_BYTES = 2 * 1024 * 1024; // 2 mb
const VALID_UPLOADS_MIME_TYPES = ['image/jpeg', 'image/png'];

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
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
    // const user = await this.usersService.findOne(+id);
    // user.avatarUrl = randomFileName;
    // await this.usersService.update(+id, user);
    return { message: 'File upload successful', filename: randomFileName };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() pag?: FilterParams) {
    return this.usersService.findAll(pag);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  // @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
