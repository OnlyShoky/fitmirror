import { Injectable, signal, computed, effect } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface TranslationKeys {
  // Navigation
  navHome: string;
  navHow: string;
  navFeatures: string;
  navSupport: string;
  getStarted: string;

  // Main Section
  howTitle: string;
  yourPhoto: string;
  uploadPhoto: string;
  clothing: string;
  uploadClothing: string;
  pasteLink: string;
  tryOn: string;
  processing: string;
  resultTitle: string;
  generateAnother: string;
  downloadImage: string;

  // En tu translation.service.ts, añade estas propiedades al interface TranslationKeys:
  apiKeyLabel: string;
  apiKeyPlaceholder: string;
  apiKeyHelp: string;
  getApiKey: string;
  apiKeyInfo: string;
  apiKeyInfoMessage: string;
  apiKeyRequired: string;
  enterApiKey: string;

  // Features
  whyTitle: string;
  accurateFit: string;
  accurateDesc: string;
  saveProfile: string;
  saveDesc: string;
  instantResults: string;
  instantDesc: string;
  mobileFriendly: string;
  mobileDesc: string;

  // Upload
  uploadClick: string;
  replacePhoto: string;
  replaceImage: string;
  loadImage: string;
  validUrl: string;

  // Support
  supportTitle: string;
  supportText: string;
  paypal: string;
  coffee: string;
  thanks: string;

  // Footer
  footerDesc: string;
  quickLinks: string;
  legal: string;
  connect: string;
  privacyPolicy: string;
  termsService: string;
  cookiePolicy: string;
  portfolio: string;
  contactUs: string;
}

export interface Translations {
  [key: string]: TranslationKeys;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLang = signal<string>('en');

  // Define all translations
  private translations: Translations = {
    en: {
      // Navigation
      navHome: 'Home',
      navHow: 'Virtual Try-On',
      navFeatures: 'Features',
      navSupport: 'Support',
      getStarted: 'Get Started',

      // Main Section
      howTitle: 'Virtual Try-On',
      yourPhoto: 'Your Photo',
      uploadPhoto: 'Upload your full-body photo',
      clothing: 'Clothing',
      uploadClothing: 'Upload clothing image',
      pasteLink: 'Or paste a link',
      tryOn: 'Try On',
      processing: 'Processing your virtual try-on...',
      resultTitle: 'Your Virtual Try-On Result',
      generateAnother: 'Generate Another',
      downloadImage: 'Download Image',

      // ... traducciones existentes
      apiKeyLabel: 'Your Freepik API Key',
      apiKeyPlaceholder: 'Enter your Freepik API key',
      apiKeyHelp: 'You need a Freepik API key to use the virtual try-on feature.',
      getApiKey: 'Get your API key',
      apiKeyInfo: 'API Key information',
      apiKeyInfoMessage: 'You need a Freepik API key to use the virtual try-on feature.\n\n' +
        'How to get your API key:\n' +
        '1. Go to https://freepik.com/api\n' +
        '2. Sign up or log in to your Freepik account\n' +
        '3. Generate an API key from your dashboard\n' +
        '4. Copy and paste the key here\n\n' +
        'Your API key is stored locally in your browser and never shared with us.',
      apiKeyRequired: 'API key is required to proceed',
      enterApiKey: 'Enter API Key First',


      // Features
      whyTitle: 'Why Choose MyraMyrror',
      accurateFit: 'Accurate Fit Visualization',
      accurateDesc: 'See exactly how clothes will fit your body type before making a purchase.',
      saveProfile: 'Save Your Profile',
      saveDesc: 'Your body profile is saved securely for future try-ons.',
      instantResults: 'Instant Results',
      instantDesc: 'Get realistic try-on results in seconds, not hours.',
      mobileFriendly: 'Mobile Friendly',
      mobileDesc: 'Works perfectly on all your devices - phone, tablet, or desktop.',

      // Upload
      uploadClick: 'Click or drag and drop',
      replacePhoto: 'Replace Photo',
      replaceImage: 'Replace Image',
      loadImage: 'Load Image',
      validUrl: 'Please enter a valid image URL',

      // Support
      supportTitle: 'Support MyraMyrror',
      supportText: 'Help keep this site and API free! Your support covers server costs and ensures we can continue providing great content. Currently 0 supporters.',
      paypal: 'Support via PayPal',
      coffee: 'Buy Me a Coffee',
      thanks: 'Thank you for your support!',

      // Footer
      footerDesc: 'The future of online shopping is here. Try before you buy with our advanced virtual try-on technology.',
      quickLinks: 'Quick Links',
      legal: 'Legal',
      connect: 'Connect',
      privacyPolicy: 'Privacy Policy',
      termsService: 'Terms of Service',
      cookiePolicy: 'Cookie Policy',
      portfolio: 'Portfolio',
      contactUs: 'Contact Us'
    },
    es: {
      // Navigation
      navHome: 'Inicio',
      navHow: 'Prueba Virtual',
      navFeatures: 'Características',
      navSupport: 'Soporte',
      getStarted: 'Comenzar',

      // Main Section
      howTitle: 'Prueba Virtual',
      yourPhoto: 'Tu Foto',
      uploadPhoto: 'Sube tu foto de cuerpo completo',
      clothing: 'Ropa',
      uploadClothing: 'Sube imagen de ropa',
      pasteLink: 'O pega un enlace',
      tryOn: 'Probar',
      processing: 'Procesando tu prueba virtual...',
      resultTitle: 'Resultado de tu Prueba Virtual',
      generateAnother: 'Generar Otro',
      downloadImage: 'Descargar Imagen',

      // ... traducciones existentes
      apiKeyLabel: 'Tu API Key de Freepik',
      apiKeyPlaceholder: 'Ingresa tu API key de Freepik',
      apiKeyHelp: 'Necesitas una API key de Freepik para usar la función de prueba virtual.',
      getApiKey: 'Obtener tu API key',
      apiKeyInfo: 'Información de API Key',
      apiKeyInfoMessage: 'Necesitas una API key de Freepik para usar la función de prueba virtual.\n\n' +
        'Cómo obtener tu API key:\n' +
        '1. Ve a https://freepik.com/api\n' +
        '2. Regístrate o inicia sesión en tu cuenta de Freepik\n' +
        '3. Genera una API key desde tu panel de control\n' +
        '4. Copia y pega la clave aquí\n\n' +
        'Tu API key se almacena localmente en tu navegador y nunca se comparte con nosotros.',
      apiKeyRequired: 'Se requiere API key para continuar',
      enterApiKey: 'Ingresa API Key Primero',

      // Features
      whyTitle: 'Por Qué Elegir MyraMyrror',
      accurateFit: 'Visualización Preciso',
      accurateDesc: 'Vea exactamente cómo le quedará la ropa a su tipo de cuerpo antes de comprar.',
      saveProfile: 'Guarda tu Perfil',
      saveDesc: 'Tu perfil corporal se guarda de forma segura para pruebas futuras.',
      instantResults: 'Resultados Instantáneos',
      instantDesc: 'Obtén resultados realistas de prueba en segundos, no en horas.',
      mobileFriendly: 'Compatible con Móviles',
      mobileDesc: 'Funciona perfectamente en todos tus dispositivos: teléfono, tableta o computadora.',

      // Upload
      uploadClick: 'Haz clic o arrastra y suelta',
      replacePhoto: 'Reemplazar Foto',
      replaceImage: 'Reemplazar Imagen',
      loadImage: 'Cargar Imagen',
      validUrl: 'Por favor ingrese una URL de imagen válida',

      // Support
      supportTitle: 'Apoya a MyraMyrror',
      supportText: '¡Ayuda a mantener este sitio y API gratis! Tu apoyo cubre los costos del servidor y nos permite continuar brindando contenido de calidad. Actualmente 0 seguidores.',
      paypal: 'Apoya via PayPal',
      coffee: 'Cómprame un Café',
      thanks: '¡Gracias por tu apoyo!',

      // Footer
      footerDesc: 'El futuro de las compras en línea está aquí. Prueba antes de comprar con nuestra tecnología avanzada de prueba virtual.',
      quickLinks: 'Enlaces Rápidos',
      legal: 'Legal',
      connect: 'Conectar',
      privacyPolicy: 'Política de Privacidad',
      termsService: 'Términos de Servicio',
      cookiePolicy: 'Política de Cookies',
      portfolio: 'Portafolio',
      contactUs: 'Contáctanos'
    },
    fr: {
      // Navigation
      navHome: 'Accueil',
      navHow: 'Essai Virtuel',
      navFeatures: 'Fonctionnalités',
      navSupport: 'Support',
      getStarted: 'Commencer',

      // Main Section
      howTitle: 'Essai Virtuel',
      yourPhoto: 'Votre Photo',
      uploadPhoto: 'Téléchargez votre photo en pied',
      clothing: 'Vêtements',
      uploadClothing: 'Téléchargez une image de vêtement',
      pasteLink: 'Ou collez un lien',
      tryOn: 'Essayer',
      processing: 'Traitement de votre essai virtuel...',
      resultTitle: 'Résultat de votre Essai Virtuel',
      generateAnother: 'Genérer un Autre',
      downloadImage: 'Télécharger l\'Image',

      apiKeyLabel: 'Votre clé API de Freepik',
      apiKeyPlaceholder: 'Entrez votre clé API de Freepik',
      apiKeyHelp: 'Vous devez une clé API de Freepik pour utiliser la fonction de prueba virtual.',
      getApiKey: 'Obtenir votre clé API',
      apiKeyInfo: 'Informations sur la clé API',
            apiKeyInfoMessage: 'Vous devez une clé API de Freepik pour utiliser la fonction de prueba virtual.\n\n' +
        'Comment obtenir votre clé API :\n' +
        '1. Allez sur https://freepik.com/api\n' +
        '2. Inscrivez-vous ou connectez-vous à votre compte Freepik\n' +
        '3. Générez une clé API à partir de votre tableau de bord\n' +
        '4. Copiez et collez la clé ici\n\n' +
        'Votre clé API est stockée localement dans votre navigateur et n\'est jamais partagée avec nous.',
      apiKeyRequired: 'Une clé API est requise pour continuer',
      enterApiKey: 'Entrez votre clé API d\'abord',


      // Features
      whyTitle: 'Pourquoi Choisir MyraMyrror',
      accurateFit: 'Visualisation Précise',
      accurateDesc: 'Voyez exactement comment les vêtements s\'adapteront à votre type de corps avant d\'acheter.',
      saveProfile: 'Enregistrez votre Profil',
      saveDesc: 'Votre profil corporel est enregistré en toute sécurité pour des essais futurs.',
      instantResults: 'Résultats Instantanés',
      instantDesc: 'Obtenez des résultats d\'essai réalistes en quelques secondes, pas des heures.',
      mobileFriendly: 'Adapté aux Mobiles',
      mobileDesc: 'Fonctionne parfaitement sur tous vos appareils - téléphone, tablette ou ordinateur.',

      // Upload
      uploadClick: 'Cliquez ou glissez-déposez',
      replacePhoto: 'Remplacer la Photo',
      replaceImage: 'Remplacer l\'Image',
      loadImage: 'Charger l\'Image',
      validUrl: 'Veuillez entrer une URL d\'image valide',

      // Support
      supportTitle: 'Soutenez MyraMyrror',
      supportText: 'Aidez à garder ce site et cette API gratuits! Votre soutien couvre les coûts du serveur et nous permet de continuer à fournir un excellent contenu. Actuellement 0 supporters.',
      paypal: 'Soutenir via PayPal',
      coffee: 'Offrez-moi un Café',
      thanks: 'Merci pour votre soutien!',

      // Footer
      footerDesc: 'L\'avenir du shopping en ligne est là. Essayez avant d\'acheter avec notre technologie avancée d\'essai virtuel.',
      quickLinks: 'Liens Rapides',
      legal: 'Légal',
      connect: 'Se Connecter',
      privacyPolicy: 'Politique de Confidentialité',
      termsService: 'Conditions d\'Utilisation',
      cookiePolicy: 'Politique de Cookies',
      portfolio: 'Portfolio',
      contactUs: 'Contactez-nous'
    }
  };

  // Computed signal for current translations
  currentTranslations = computed(() => this.translations[this.currentLang()]);

  // Signal for current language (readonly)
  currentLanguage = this.currentLang.asReadonly();

  constructor(private title: Title, private meta: Meta) {
    // Detect browser language on service initialization
    this.detectBrowserLanguage();

    // Effect to update SEO tags when language changes
    effect(() => {
      const lang = this.currentLang();
      this.updateSEOTags(lang);
      this.updateDocumentLang(lang);
    });
  }

  /**
   * Set the current language
   */
  setLanguage(lang: string): void {
    if (this.translations[lang]) {
      this.currentLang.set(lang);
    } else {
      console.warn(`Language ${lang} not supported, falling back to English`);
      this.currentLang.set('en');
    }
  }

  /**
   * Get the current language
   */
  getCurrentLanguage(): string {
    return this.currentLang();
  }

  /**
   * Get translation for a specific key
   */
  get(key: keyof TranslationKeys): string {
    return this.currentTranslations()[key] || key;
  }

  /**
   * Get all available languages
   */
  getAvailableLanguages(): string[] {
    return Object.keys(this.translations);
  }

  /**
   * Detect browser language and set accordingly
   */
  private detectBrowserLanguage(): void {
    const browserLang = navigator.language.split('-')[0];
    const supportedLangs = this.getAvailableLanguages();

    if (supportedLangs.includes(browserLang)) {
      this.setLanguage(browserLang);
    } else {
      this.setLanguage('en'); // Default to English
    }
  }

  /**
   * Update SEO tags based on language
   */
  private updateSEOTags(lang: string): void {
    const titles = {
      en: 'MyraMyrror | Virtual Try-On Solution',
      es: 'MyraMyrror | Solución de Prueba Virtual',
      fr: 'MyraMyrror | Solution d\'Essai Virtuel'
    };

    const descriptions = {
      en: 'Try before you buy with MyraMyrror\'s advanced virtual try-on technology. See how clothes fit your body type instantly.',
      es: 'Prueba antes de comprar con la tecnología avanzada de prueba virtual de MyraMyrror. Vea cómo le queda la ropa a su tipo de cuerpo al instante.',
      fr: 'Essayez avant d\'acheter avec la technologie d\'essai virtuel avancée de MyraMyrror. Voyez comment les vêtements s\'adaptent à votre type de corps instantanément.'
    };

    const keywords = {
      en: 'MyraMyrror, virtual try-on, fashion, clothing, fit visualization, AI try-on',
      es: 'MyraMyrror, prueba virtual, moda, ropa, visualización de ajuste, IA prueba',
      fr: 'MyraMyrror, essai virtuel, mode, vêtements, visualisation d\'ajustement, IA essai'
    };

    this.title.setTitle(titles[lang as keyof typeof titles] || titles.en);

    this.meta.updateTag({
      name: 'description',
      content: descriptions[lang as keyof typeof descriptions] || descriptions.en
    });

    this.meta.updateTag({
      name: 'keywords',
      content: keywords[lang as keyof typeof keywords] || keywords.en
    });
  }

  /**
   * Update document language attribute for accessibility
   */
  private updateDocumentLang(lang: string): void {
    document.documentElement.setAttribute('lang', lang);
  }
}
