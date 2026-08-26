import { User } from './user.model';

export interface IAuthResponse {
  accessToken: string;
  user: User;
}

export interface IRefreshTokenResponse {
  accessToken: string;
}

export interface IMeResponse {
  user: User;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  email: string;
  password: string;
  name?: string;
  username?: string;
  confirmPassword?: string;
}

export enum AuthProvider {
  Local = 'local',
  Google = 'google',
}