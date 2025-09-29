import { Component } from '@angular/core';

@Component({
  selector: 'app-mobile-menu',
  templateUrl: './mobile-menu.html',
  styleUrls: ['./mobile-menu.scss'],
  standalone: true
})
export class MobileMenuComponent {
  isActive = false;

  closeMobileMenu() {
    this.isActive = false;
  }

  openMobileMenu() {
    this.isActive = true;
  }
}
