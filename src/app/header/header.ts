import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileMenuComponent } from './mobile-menu/mobile-menu';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  standalone: true,
  imports: [MobileMenuComponent, CommonModule]
})
export class HeaderComponent {
  @ViewChild(MobileMenuComponent) mobileMenu!: MobileMenuComponent;

  openMobileMenu() {
    this.mobileMenu.openMobileMenu();
  }
}
