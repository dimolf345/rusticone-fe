import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  #authService = inject(AuthService);

  ngOnInit(): void {
    this.#authService.initializeAuth().catch(() => {});
  }
}

