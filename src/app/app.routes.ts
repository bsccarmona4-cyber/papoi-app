import type { Routes } from '@angular/router';
import { TabsPage } from './tabs/tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'entrenar',
        loadComponent: () => import('./entrenar/entrenar.page').then((m) => m.EntrenarPage),
      },
      {
        path: 'progreso',
        loadComponent: () => import('./progreso/progreso.page').then((m) => m.ProgresoPage),
      },
      {
        path: '',
        redirectTo: 'entrenar',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'tabs/entrenar',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'tabs/entrenar',
  },
];
