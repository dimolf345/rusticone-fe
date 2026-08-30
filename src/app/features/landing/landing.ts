import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MainLogo } from '../../components/main-logo/main-logo';
import { APP_PATHS } from '../../core/constants/routes.constant';
import { AuthService } from '../../core/services/auth.service';

@Component({
  imports: [MainLogo, RouterLink],
  selector: 'app-landing',
  styleUrl: './landing.css',
  templateUrl: './landing.html',
})
export default class Landing {
  #authService = inject(AuthService);

  readonly isLoading = this.#authService.isLoading;
  protected readonly paths = APP_PATHS;
}

