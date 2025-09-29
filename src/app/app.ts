import { Component, signal } from '@angular/core';
import { HeaderComponent } from './header/header';
import { HowItWorksComponent } from './how-it-works/how-it-works';
import { Footer } from './footer/footer';
import { Donation } from './donation/donation';
import { Features } from './features/features';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, HowItWorksComponent, Footer, Donation, Features, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('fitmirror');
}
