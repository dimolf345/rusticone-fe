import { Component, inject } from '@angular/core';
import { MainLogo } from "../../components/main-logo/main-logo";
import { AuthService } from '../../core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MainLogo, RouterLink],
  selector: 'app-landing',
  styleUrl: './landing.css',
  templateUrl: './landing.html',
})
export default class Landing {
  #authService = inject(AuthService);

  readonly isLoading = this.#authService.isLoading;
}
