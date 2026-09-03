import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ADMIN_NAVITEMS, CUSTOMER_NAVITEMS } from '../constants/routes.constant';
import { INavigationItem } from '../models/layout.model';
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

  readonly navigationItems = computed<INavigationItem[]>(() => {
    const user = this.#authService.currentUser();
    if (user?.role === 'admin') {
      return ADMIN_NAVITEMS;
    }
    return CUSTOMER_NAVITEMS;
  });

  ngOnInit(): void {
    this.#authService.redirectUserByRole();
  }
}

