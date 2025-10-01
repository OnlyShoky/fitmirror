import { Component } from '@angular/core';
import { Donation } from './donation/donation';
import { Features } from './features/features';
import { VirtualTryOn } from "./virtual-try-on/virtual-try-on";
import { VirtualTryOnWithApiKey } from "./virtual-try-on-with-apikey/virtual-try-on-with-apikey";

@Component({
  selector: 'app-main',
  imports: [Donation, Features, VirtualTryOn, VirtualTryOnWithApiKey],
  templateUrl: './main.html',
  styleUrl: './main.scss'
})
export class Main {

}
