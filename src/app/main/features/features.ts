import { Component, inject } from '@angular/core';
import { TranslationService } from '../../services/translation';

@Component({
  selector: 'app-features',
  imports: [],
  templateUrl: './features.html',
  styleUrl: './features.scss'
})
export class Features {
  private translationService = inject(TranslationService);

  // Reactive translations using computed signals
  translations = this.translationService.currentTranslations;
}
