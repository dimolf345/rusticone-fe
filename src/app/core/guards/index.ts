import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const isNotLoggedGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const user = authService.currentUser();
    if (!user) {
        return true;
    } else {
        return authService.redirectUserByRole();
    }
};