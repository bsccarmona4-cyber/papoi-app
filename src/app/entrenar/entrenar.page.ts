import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonRange,
  IonThumbnail,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { EXERCISES } from '../domain/points';
import { EntrenamientoService } from './entrenamiento.service';

@Component({
  selector: 'app-entrenar',
  templateUrl: './entrenar.page.html',
  styleUrls: ['./entrenar.page.scss'],
  imports: [
    IonButton,
    IonContent,
    IonFooter,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonRange,
    IonThumbnail,
    IonTitle,
    IonToolbar,
  ],
})
export class EntrenarPage {
  protected readonly entreno = inject(EntrenamientoService);
  protected readonly ejercicios = EXERCISES;
  private readonly router = inject(Router);

  constructor() {
    void this.entreno.iniciar();
  }

  async guardar(): Promise<void> {
    const guardado = await this.entreno.guardar();

    if (guardado) {
      await this.router.navigate(['/tabs/progreso']);
    }
  }
}
