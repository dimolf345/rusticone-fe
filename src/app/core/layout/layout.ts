import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LayoutService } from '../services/layout.service';
import { Header } from './header/header';
import { Navbar } from './navbar/navbar';

@Component({
  imports: [Navbar, RouterOutlet, Header],
  selector: 'app-layout',
  styleUrl: './layout.css',
  templateUrl: './layout.html',
})
export class Layout implements OnInit {
  #authService = inject(AuthService);
  layoutService = inject(LayoutService);

  ngOnInit(): void {
    this.#authService.redirectUserByRole();
  }

}
