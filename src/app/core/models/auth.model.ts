import { IUser } from './user.model';

export interface IAuthResponse {
  accessToken: string;
  user: IUser;
}

export interface IRefreshTokenResponse {
  accessToken: string;
}

export interface IMeResponse {
  user: IUser;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
  username?: string;
  confirmPassword?: string;
}

export enum AuthProvider {
  Local = 'local',
  Google = 'google',
}
