import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation';

@Component({
  selector: 'app-extensions',
  templateUrl: './extensions.html',
  styleUrls: ['./extensions.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ExtensionsComponent {
  private translationService = inject(TranslationService);

  // Reactive translations using computed signals
  translations = this.translationService.currentTranslations;

  // Make extensions a computed signal that updates when translations change
  extensions = computed(() => [
    {
      id: 'chrome',
      name: this.translations().chromeExtension,
      icon: 'fab fa-chrome',
      description: this.translations().extensionDesc1,
      buttonText: this.translations().addToChrome,
      link: 'https://chromewebstore.google.com/detail/myramyrror-virtual-try-on/hclcpadbmcmhklfdmnocmkmfomaefjoe'
    },
    {
      id: 'firefox',
      name: this.translations().firefoxExtension,
      icon: 'fab fa-firefox',
      description: this.translations().extensionDesc2,
      buttonText: this.translations().addToFirefox,
      link: 'https://addons.mozilla.org/en-US/firefox/addon/myramyrror-virtual-try-on/'
    }
  ]);

  // Open extension store in new tab
  openExtensionStore(link: string): void {
    window.open(link, '_blank');
  }
}