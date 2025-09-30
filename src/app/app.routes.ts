import { Routes } from '@angular/router';
import { PrivacyPolicy } from './privacy-policy/privacy-policy';
import { TermsOfService } from './terms-of-service/terms-of-service';
import { Main } from './main/main';

export const routes: Routes = [
  { path: '', component: Main }, // main page
  { path: 'privacy-policy', component: PrivacyPolicy },
  { path: 'terms-of-service', component: TermsOfService },
  // wildcard route must be last
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
