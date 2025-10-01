import { Component, inject } from '@angular/core';
import { TranslationService } from '../../services/translation';

@Component({
  selector: 'app-donation',
  imports: [],
  templateUrl: './donation.html',
  styleUrl: './donation.scss'
})
export class Donation {
  private translationService = inject(TranslationService);

  // Reactive translations using computed signals
  translations = this.translationService.currentTranslations;
}

