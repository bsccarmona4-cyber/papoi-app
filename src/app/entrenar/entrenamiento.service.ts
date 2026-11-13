import { Injectable, computed, signal } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { supabase } from '../core/supabase';
import { distanciaMetros } from '../domain/distancia';
import { Esfuerzo, Exercise, SetEntry, scoreDay, scoreSet } from '../domain/points';

@Injectable({ providedIn: 'root' })
export class EntrenamientoService {
  readonly series = signal<SetEntry[]>([]);
  readonly seleccionado = signal<Exercise | null>(null);
  readonly cantidad = signal(10);
  readonly esfuerzo = signal<Esfuerzo>('normal');
  readonly mensaje = signal('');
  readonly guardando = signal(false);

  readonly metros = signal(0);
  readonly segundos = signal(0);
  readonly grabando = signal(false);

  private vigilancia: string | null = null;
  private reloj: ReturnType<typeof setInterval> | null = null;

  readonly niveles: Esfuerzo[] = ['suave', 'normal', 'duro'];

  readonly etiquetas: { [nivel in Esfuerzo]: string } = {
    suave: 'Suave',
    normal: 'Normal',
    duro: 'Duro',
  };

  readonly total = computed(() => scoreDay(this.series()));

  readonly escala = computed(() => {
    const unidad = this.seleccionado()?.unit;
    if (unidad === 'seg') {
      return { min: 5, max: 600, step: 5 };
    }
    return { min: 1, max: 50, step: 1 };
  });

  readonly puntosDeLaSerie = computed(() => {
    const ejercicio = this.seleccionado();
    return ejercicio ? scoreSet(this.armarSerie(ejercicio)) : 0;
  });

  readonly metrosRedondos = computed(() => Math.round(this.metros()));

  readonly segundosPorKm = computed(() => {
    const metros = this.metros();
    if (metros < 50) {
      return 0;
    }
    return this.segundos() / (metros / 1000);
  });

  readonly esfuerzoCalculado = computed(() => this.esfuerzoPorRitmo(this.segundosPorKm()));

  async iniciar(): Promise<void> {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      await supabase.auth.signInAnonymously();
    }
  }

  hoy(): string {
    const ahora = new Date();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    return `${ahora.getFullYear()}-${mes}-${dia}`;
  }

  elegir(ejercicio: Exercise): void {
    if (this.grabando()) {
      return;
    }

    this.seleccionado.set(ejercicio);
    this.esfuerzo.set('normal');
    this.mensaje.set('');
    this.metros.set(0);
    this.segundos.set(0);

    if (ejercicio.unit === 'seg') {
      this.cantidad.set(30);
    } else {
      this.cantidad.set(10);
    }
  }

  cerrar(): void {
    if (this.grabando()) {
      void this.pararGps();
    }
    this.seleccionado.set(null);
  }

  setCantidad(evento: Event): void {
    const valor = Number((evento as CustomEvent).detail.value);
    this.cantidad.set(valor);
  }

  esforzar(nivel: Esfuerzo): void {
    this.esfuerzo.set(nivel);
  }

  async empezarCarrera(): Promise<void> {
    this.metros.set(0);
    this.segundos.set(0);
    this.cantidad.set(0);
    this.mensaje.set('');

    let anterior: { lat: number; lon: number } | null = null;

    try {
      this.vigilancia = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 10000 },
        (posicion, error) => {
          if (error || !posicion) {
            return;
          }
          if (posicion.coords.accuracy > 35) {
            return;
          }

          const actual = { lat: posicion.coords.latitude, lon: posicion.coords.longitude };

          if (!anterior) {
            anterior = actual;
            return;
          }

          const delta = distanciaMetros(anterior.lat, anterior.lon, actual.lat, actual.lon);

          if (delta > 3) {
            this.metros.update((total) => total + delta);
            anterior = actual;
            this.cantidad.set(Math.round(this.metros()));
          }
        },
      );

      this.grabando.set(true);
      this.reloj = setInterval(() => this.segundos.update((s) => s + 1), 1000);
    } catch (e) {
      console.error('GPS', e);
      this.grabando.set(false);
      this.mensaje.set('No se pudo acceder al GPS');
    }
  }

  async terminarCarrera(): Promise<void> {
      const ejercicio = this.seleccionado();

      await this.pararGps();

      if (!ejercicio) {
        return;
      }

      if (this.metros() < 50) {
        this.mensaje.set('Muy corto para contar');
        return;
      }

      this.esfuerzo.set(this.esfuerzoCalculado());
      this.cantidad.set(Math.round(this.metros()));
      this.series.update((actuales) => [...actuales, this.armarSerie(ejercicio)]);
      this.mensaje.set('');
      this.seleccionado.set(null);
    }

    private async pararGps(): Promise<void> {
      if (this.vigilancia) {
        await Geolocation.clearWatch({ id: this.vigilancia });
        this.vigilancia = null;
      }

      if (this.reloj) {
        clearInterval(this.reloj);
        this.reloj = null;
      }

      this.grabando.set(false);
    }

  tiempo(): string {
    const total = this.segundos();
    const minutos = Math.floor(total / 60);
    const resto = total % 60;
    return `${minutos}:${String(resto).padStart(2, '0')}`;
  }

  ritmoTexto(): string {
    const ritmo = this.segundosPorKm();
    if (ritmo === 0) {
      return '--';
    }
    const minutos = Math.floor(ritmo / 60);
    const resto = Math.round(ritmo % 60);
    return `${minutos}:${String(resto).padStart(2, '0')} min/km`;
  }

  agregar(): void {
    const ejercicio = this.seleccionado();
    if (!ejercicio || this.grabando()) {
      return;
    }
    this.series.update((actuales) => [...actuales, this.armarSerie(ejercicio)]);
    this.seleccionado.set(null);
  }

  borrar(indice: number): void {
    this.series.update((actuales) => actuales.filter((_, i) => i !== indice));
  }

  async guardar(): Promise<boolean> {
    const filas = this.series().map((serie) => ({
      ejercicio_id: serie.exercise.id,
      unidad: serie.exercise.unit,
      cantidad: serie.reps ?? serie.seconds ?? serie.meters ?? 0,
      esfuerzo: serie.esfuerzo,
      coef_aplicado: serie.exercise.coef,
      puntos: scoreSet(serie),
    }));

    if (filas.length === 0) {
      return false;
    }

    this.guardando.set(true);
    this.mensaje.set('');

    const { data: sesion, error } = await supabase
      .from('sesiones')
      .insert({ fecha: this.hoy(), puntos: this.total() })
      .select()
      .single();

    if (error) {
      console.error('Error guardando la sesión', error);
      this.guardando.set(false);
      this.mensaje.set('No se pudo guardar');
      return false;
    }

    const { error: errorSeries } = await supabase
      .from('series')
      .insert(filas.map((fila) => ({ ...fila, sesion_id: sesion.id })));

    this.guardando.set(false);

    if (errorSeries) {
      console.error('Error guardando las series', errorSeries);
      this.mensaje.set('No se pudo guardar');
      return false;
    }

    this.series.set([]);
    this.mensaje.set('Guardado ✓');
    return true;
  }

  imagenDe(ejercicio: Exercise): string {
      return `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${ejercicio.dbId}/0.jpg`;
    }

  unidad(unit: Exercise['unit']): string {
    if (unit === 'rep') {
      return 'repetición';
    }
    if (unit === 'seg') {
      return 'segundo';
    }
    return 'metro';
  }

  resumen(serie: SetEntry): string {
    const cantidad = serie.reps ?? serie.seconds ?? serie.meters ?? 0;
    const unidad =
      serie.exercise.unit === 'rep' ? 'reps' : serie.exercise.unit === 'seg' ? 'seg' : 'm';
    return `${cantidad} ${unidad} · ${serie.esfuerzo} · ${scoreSet(serie)} pts`;
  }

  private esfuerzoPorRitmo(segundosPorKm: number): Esfuerzo {
    if (segundosPorKm === 0) {
      return 'normal';
    }
    if (segundosPorKm < 330) {
      return 'duro';
    }
    if (segundosPorKm <= 420) {
      return 'normal';
    }
    return 'suave';
  }

  private armarSerie(ejercicio: Exercise): SetEntry {
    const serie: SetEntry = { exercise: ejercicio, esfuerzo: this.esfuerzo() };
    if (ejercicio.unit === 'rep') {
      serie.reps = this.cantidad();
    }
    if (ejercicio.unit === 'seg') {
      serie.seconds = this.cantidad();
    }
    if (ejercicio.unit === 'm') {
      serie.meters = this.cantidad();
    }
    return serie;
  }
}
