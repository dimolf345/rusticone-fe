import { User } from "./user.model";

export interface IAuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface IRegisterRequest {
    email: string;
    username: string;
    password: string;
    confirmPassword?: string;
}

export enum AuthProvider {
    Local = 'local',
    Google = 'google'
}