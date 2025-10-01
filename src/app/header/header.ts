import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileMenuComponent } from './mobile-menu/mobile-menu';
import { LanguageSelectorComponent } from "./language-selector/language-selector";
import { TranslationService } from '../services/translation';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  standalone: true,
  imports: [MobileMenuComponent, CommonModule, LanguageSelectorComponent]
})
export class HeaderComponent {
  @ViewChild(MobileMenuComponent) mobileMenu!: MobileMenuComponent;

  openMobileMenu() {
    this.mobileMenu.openMobileMenu();
  }

    
  private translationService = inject(TranslationService);

  // Reactive translations using computed signals
  translations = this.translationService.currentTranslations;
}
