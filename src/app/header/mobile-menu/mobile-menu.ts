import { Component, inject } from '@angular/core';
import { TranslationService } from '../../services/translation';

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

    private translationService = inject(TranslationService);

  // Reactive translations using computed signals
  translations = this.translationService.currentTranslations;
}
