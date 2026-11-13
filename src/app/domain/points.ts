export type Unidad = 'rep' | 'seg' | 'm';
export type Esfuerzo = 'suave' | 'normal' | 'duro';

export interface Exercise {
  id: string;
  name: string;
  unit: Unidad;
  coef: number;
}

export interface SetEntry {
  exercise: Exercise;
  reps?: number;
  seconds?: number;
  meters?: number;
  esfuerzo: Esfuerzo;
}

export const FACTOR_ESFUERZO: { [nivel in Esfuerzo]: number } = {
  suave: 0.8,
  normal: 1,
  duro: 1.25,
};

export const PUNTOS_POR_EJERCICIO_POR_DIA = 150;
export const FACTOR_EXCEDENTE = 0.4;
export const PUNTOS_MAXIMOS_POR_DIA = 400;

export const EXERCISES: Exercise[] = [
  { id: 'squat', name: 'Sentadilla', unit: 'rep', coef: 1.0 },
  { id: 'lunge', name: 'Estocadas', unit: 'rep', coef: 0.9 },
  { id: 'deadlift', name: 'Peso muerto', unit: 'rep', coef: 1.4 },
  { id: 'pushup', name: 'Flexiones', unit: 'rep', coef: 1.2 },
  { id: 'bench', name: 'Press banca', unit: 'rep', coef: 0.8 },
  { id: 'dip', name: 'Fondos', unit: 'rep', coef: 1.5 },
  { id: 'pullup', name: 'Dominadas', unit: 'rep', coef: 2.5 },
  { id: 'row', name: 'Remo', unit: 'rep', coef: 1.0 },
  { id: 'curl', name: 'Curl de bíceps', unit: 'rep', coef: 0.8 },
  { id: 'plank', name: 'Plancha', unit: 'seg', coef: 0.33 },
  { id: 'crunch', name: 'Abdominales', unit: 'rep', coef: 0.8 },
  { id: 'run', name: 'Correr', unit: 'm', coef: 0.08 },
];

export function unitsOf(entry: SetEntry): number {
  if (entry.exercise.unit === 'rep') {
    return entry.reps || 0;
  }
  if (entry.exercise.unit === 'seg') {
    return entry.seconds || 0;
  }
  return entry.meters || 0;
}

export function scoreSet(entry: SetEntry): number {
  const unidades = unitsOf(entry);
  if (unidades <= 0) {
    return 0;
  }
  return Math.round(unidades * entry.exercise.coef * FACTOR_ESFUERZO[entry.esfuerzo]);
}

export function scoreDay(entries: SetEntry[]): number {
  const puntosPorEjercicio: { [id: string]: number } = {};

  for (const entry of entries) {
    const id = entry.exercise.id;
    puntosPorEjercicio[id] = (puntosPorEjercicio[id] || 0) + scoreSet(entry);
  }

  let total = 0;

  for (const id of Object.keys(puntosPorEjercicio)) {
    let puntos = puntosPorEjercicio[id];
    if (puntos > PUNTOS_POR_EJERCICIO_POR_DIA) {
      puntos =
        PUNTOS_POR_EJERCICIO_POR_DIA + (puntos - PUNTOS_POR_EJERCICIO_POR_DIA) * FACTOR_EXCEDENTE;
    }
    total = total + puntos;
  }

  if (total > PUNTOS_MAXIMOS_POR_DIA) {
    total = PUNTOS_MAXIMOS_POR_DIA;
  }

  return Math.round(total);
}
