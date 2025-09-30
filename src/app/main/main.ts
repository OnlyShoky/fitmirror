import { Component } from '@angular/core';
import { HowItWorksComponent } from './how-it-works/how-it-works';
import { Donation } from './donation/donation';
import { Features } from './features/features';

@Component({
  selector: 'app-main',
  imports: [HowItWorksComponent, Donation, Features],
  templateUrl: './main.html',
  styleUrl: './main.scss'
})
export class Main {

}
