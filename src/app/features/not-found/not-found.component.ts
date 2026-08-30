import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroHome } from '@ng-icons/heroicons/outline';
import { MainLogo } from '../../components/main-logo/main-logo';
import { APP_PATHS } from '../../core/constants/routes.constant';

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
export class NotFoundComponent {
  protected readonly paths = APP_PATHS;
}

