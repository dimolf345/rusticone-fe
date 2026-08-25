import { Component, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LOCAL_STORAGE_KEYS } from './core/constants/local-storage.constants';
import { AuthService } from './core/services/auth.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  #authService = inject(AuthService);
  #router = inject(Router);

  redirectToRouteEffect = effect(() => {
    const currentUser = this.#authService.currentUser();
    const accessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);

    if (!accessToken && !refreshToken) {
      return this.#router.navigate(['login']);
    }
    return;
  });
}
