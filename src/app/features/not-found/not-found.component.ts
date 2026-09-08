import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroHome } from '@ng-icons/heroicons/outline';
import { MainLogo } from '../../components/main-logo/main-logo';
import { APP_PATHS } from '../../core/constants/routes.constant';
import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'app-not-found',
  imports: [RouterLink, NgIcon, MainLogo],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      heroHome,
      heroArrowLeft,
    }),
  ],
})
export default class NotFoundComponent {
  #authService = inject(AuthService);
  protected readonly paths = APP_PATHS;

  redirectUrl = computed(() => {
    const isLoggedIn = !!this.#authService.currentUser();
    return isLoggedIn ? this.paths.DASHBOARD.ROOT : this.paths.LANDING;
  });
}

