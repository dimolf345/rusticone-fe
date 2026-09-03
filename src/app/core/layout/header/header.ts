import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MainLogo } from '../../../components/main-logo/main-logo';

@Component({
  imports: [MainLogo, RouterLink],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header { }

