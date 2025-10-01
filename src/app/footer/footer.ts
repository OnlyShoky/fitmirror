import { Component, inject } from '@angular/core';
import { TranslationService } from '../services/translation';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {

  private translationService = inject(TranslationService);

  // Reactive translations using computed signals
  translations = this.translationService.currentTranslations;
}
