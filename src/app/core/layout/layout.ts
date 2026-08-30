import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  imports: [],
  selector: 'app-layout',
  styleUrl: './layout.css',
  templateUrl: './layout.html',
})
export class Layout implements OnInit {
  #authService = inject(AuthService);

  ngOnInit(): void {
    this.#authService.redirectUserByRole();
  }

}
