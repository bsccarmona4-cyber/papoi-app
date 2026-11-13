import { Component, computed, signal } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { supabase } from '../core/supabase';

interface Sesion {
  id: string;
  fecha: string;
  puntos: number;
}

@Component({
  selector: 'app-progreso',
  templateUrl: './progreso.page.html',
  styleUrls: ['./progreso.page.scss'],
  imports: [IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar],
})
export class ProgresoPage {
  readonly sesiones = signal<Sesion[]>([]);
  readonly cargando = signal(false);

  readonly totalSemana = computed(() => {
    const hace7 = new Date();
    hace7.setDate(hace7.getDate() - 6);
    const corte = this.hoy(hace7);

    return this.sesiones()
      .filter((sesion) => sesion.fecha >= corte)
      .reduce((total, sesion) => total + sesion.puntos, 0);
  });

  ionViewWillEnter(): void {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);

    const { data, error } = await supabase
      .from('sesiones')
      .select('id, fecha, puntos')
      .order('fecha', { ascending: false })
      .limit(20);

    this.cargando.set(false);

    if (error) {
      console.error('Error cargando el progreso', error);
      return;
    }

    this.sesiones.set((data as Sesion[]) ?? []);
  }

  fechaLegible(fecha: string): string {
    const partes = fecha.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  private hoy(fecha: Date): string {
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${mes}-${dia}`;
  }
}
