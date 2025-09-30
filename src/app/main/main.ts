import { Component } from '@angular/core';
import { Donation } from './donation/donation';
import { Features } from './features/features';
import { VirtualTryOn } from "./virtual-try-on/virtual-try-on";

@Component({
  selector: 'app-main',
  imports: [ Donation, Features, VirtualTryOn],
  templateUrl: './main.html',
  styleUrl: './main.scss'
})
export class Main {

}
