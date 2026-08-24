import { User } from "./user.model";

export interface IAuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}