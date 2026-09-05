import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
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

export const isAdminGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const isAdmin = authService.isAdmin();

    return isAdmin || router.createUrlTree(['/not-found']);
};