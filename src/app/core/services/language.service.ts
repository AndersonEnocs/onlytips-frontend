import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translate = inject(TranslateService);
  private http = inject(HttpClient);

  private supportedLanguages = ['en', 'es', 'pt'];
  private defaultLanguage = 'en';

  private countryToLang: { [key: string]: string } = {
    'US': 'en', 'GB': 'en', 'CA': 'en', 'AU': 'en', 'NZ': 'en', 
    'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es', 'VE': 'es', 'CL': 'es', 'EC': 'es', 'GT': 'es', 'CU': 'es', 'DO': 'es', 'HN': 'es', 'NI': 'es', 'PA': 'es', 'PY': 'es', 'SV': 'es', 'UY': 'es', // Spanish
    'BR': 'pt', 'PT': 'pt' 
  };

  constructor() {
    this.initializeLanguage();
  }

  private async initializeLanguage() {
    let detectedLang = this.defaultLanguage;

    try {
      console.log('Detecting country via IP...');
      const response = await firstValueFrom(this.http.get('https://ipapi.co/json/'));
      const countryCode = (response as any).country_code;
      console.log('Detected country code:', countryCode);
      detectedLang = this.countryToLang[countryCode] || this.defaultLanguage;
      console.log('Detected language from country:', detectedLang);
    } catch (error) {
      console.warn('Failed to detect country, falling back to browser language', error);
      const browserLang = navigator.language.split('-')[0];
      console.log('Browser language:', browserLang);
      detectedLang = this.supportedLanguages.includes(browserLang) ? browserLang : this.defaultLanguage;
    }

    // Always use detected language and update localStorage
    const lang = detectedLang;
    console.log('Final language to set (detected):', lang);

    this.setLanguage(lang);
  }

  setLanguage(lang: string) {
    if (!this.supportedLanguages.includes(lang)) {
      lang = this.defaultLanguage;
    }

    this.translate.setDefaultLang(lang);
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || this.defaultLanguage;
  }

  getSupportedLanguages(): string[] {
    return this.supportedLanguages;
  }
}