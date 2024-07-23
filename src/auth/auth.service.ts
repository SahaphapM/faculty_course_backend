import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email); // findByEmail
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password); // check password as hashing
      if (isMatch) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    console.log(user);
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  // เพิ่ม google Login
  async loginGoogle(req): Promise<any> {
    if (!req.user) {
      throw new Error('Google login failed: No user information received.');
    }
    //ERROR sqlite miss match type something
    // const { email, firstName, lastName, picture, googleId } = req.user;
    // let user = await this.usersService.findOneByEmail(email);

    // if (!user) {
    //   const createUserDto = new CreateUserDto();
    //   createUserDto.id = `${googleId}`; // This will change in the future. Use this for example I don't know what types of id should be and how to categorize the id.
    //   createUserDto.email = email;

    //   createUserDto.firstName = firstName;
    //   createUserDto.lastName = lastName;

    //   createUserDto.googleId = googleId;
    //   createUserDto.password = email;
    //   await this.usersRepository.save(createUserDto);
    //   user = await this.usersService.findOneByEmail(email);
    // }
    // console.log(user);

    const payload = { email: req.user.email, gid: req.user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
