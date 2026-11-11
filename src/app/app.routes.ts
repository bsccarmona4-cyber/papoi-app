import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'folder/Inbox',
    pathMatch: 'full',
  },
  {
    path: 'folder/:folder',
    loadComponent: () => import('./folder/folder.page').then((m) => m.FolderPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'rutinas',
    loadComponent: () => import('./rutinas/rutinas.page').then((m) => m.RutinasPage),
  },
  {
    path: 'ejercicios',
    loadComponent: () => import('./ejercicios/ejercicios.page').then((m) => m.EjerciciosPage),
  },
  {
    path: 'progreso',
    loadComponent: () => import('./progreso/progreso.page').then((m) => m.ProgresoPage),
  },
];
