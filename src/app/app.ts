import { Component, signal } from '@angular/core';
import { HeaderComponent } from './header/header';
import { HowItWorksComponent } from './main/how-it-works/how-it-works';
import { Footer } from './footer/footer';
import { RouterOutlet } from '@angular/router';
import { Main } from './main/main';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, Footer, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('fitmirror');
}
