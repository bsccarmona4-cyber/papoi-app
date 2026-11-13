import { Component, inject } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonRange,
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
    IonTitle,
    IonToolbar,
  ],
})
export class EntrenarPage {
  protected readonly entreno = inject(EntrenamientoService);
  protected readonly ejercicios = EXERCISES;

  constructor() {
    void this.entreno.iniciar();
  }
}
