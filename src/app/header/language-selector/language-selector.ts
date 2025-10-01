import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-selector.html',
  styleUrls: ['./language-selector.scss']
})
export class LanguageSelectorComponent implements OnInit {
  private translationService = inject(TranslationService);

  languages = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' }, 
    { code: 'fr', label: 'FR' }
  ];
  
  currentLanguage: string = 'en';

  ngOnInit(): void {
/**
 * Change the current language to the given language code
 * @param languageCode the language code to change to (e.g. 'en', 'es', 'fr')
 */
    this.currentLanguage = this.translationService.getCurrentLanguage();
    
    // Listen for language changes (if using Observable pattern)
    // this.translationService.currentLanguage$.subscribe(lang => {
    //   this.currentLanguage = lang;
    // });
  }

  changeLanguage(languageCode: string): void {
    this.translationService.setLanguage(languageCode);
    this.currentLanguage = languageCode;
  }

  isActive(languageCode: string): boolean {
    return this.currentLanguage === languageCode;
  }
}