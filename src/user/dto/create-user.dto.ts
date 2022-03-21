export declare class CreateUserDto {
  email: string;
  username: string;
  password: string;
  birthday: Date;
  uuid: string;
  isVerified: boolean;
  constructor(obj: CreateUserDto);
}
