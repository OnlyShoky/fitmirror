import { Component } from '@angular/core';
import { Donation } from './donation/donation';
import { Features } from './features/features';
import { VirtualTryOn } from "./virtual-try-on/virtual-try-on";
import { VirtualTryOnWithApiKey } from "./virtual-try-on-with-apikey/virtual-try-on-with-apikey";
import { ExtensionsComponent } from './extensions/extensions';

@Component({
  selector: 'app-main',
  imports: [Donation, Features, VirtualTryOn, VirtualTryOnWithApiKey,ExtensionsComponent],
  templateUrl: './main.html',
  styleUrl: './main.scss'
})
export class Main {

}
