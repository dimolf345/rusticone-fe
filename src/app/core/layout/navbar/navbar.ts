import { Component, input } from '@angular/core';
import { INavigationItem, ScreenSize } from '../../models/layout.model';

@Component({
  imports: [],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {
  readonly screenSize = input.required<ScreenSize>();
  readonly navigationItems = input<INavigationItem[]>([]);
}

