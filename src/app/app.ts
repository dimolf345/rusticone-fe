import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertsList } from './components/alerts-list/alerts-list';

@Component({
  imports: [RouterOutlet, AlertsList],
  selector: 'app-root',
  styles: ``,
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
