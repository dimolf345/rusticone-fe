import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertsList } from './components/alerts-list/alerts-list';
import { AuthService } from './core/services/auth.service';

@Component({
  imports: [RouterOutlet, AlertsList],
  selector: 'app-root',
  styles: ``,
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  #authService = inject(AuthService);

  constructor() {
    this.#authService.initializeAuth();
  }
}
