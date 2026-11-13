export type Unidad = 'rep' | 'seg' | 'm';
export type Esfuerzo = 'suave' | 'normal' | 'duro';

export interface Exercise {
  id: string;
  name: string;
  unit: Unidad;
  coef: number;
  dbId: string;
  equipo: string;
  musculos: string;
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
  { id: 'squat', name: 'Sentadilla', unit: 'rep', coef: 1.0, dbId: 'Barbell_Squat', equipo: 'barra', musculos: 'cuádriceps' },
  { id: 'lunge', name: 'Estocadas', unit: 'rep', coef: 0.9, dbId: 'Dumbbell_Lunges', equipo: 'mancuernas', musculos: 'cuádriceps' },
  { id: 'deadlift', name: 'Peso muerto', unit: 'rep', coef: 1.4, dbId: 'Barbell_Deadlift', equipo: 'barra', musculos: 'lumbar' },
  { id: 'leg_press', name: 'Prensa de piernas', unit: 'rep', coef: 0.7, dbId: 'Leg_Press', equipo: 'máquina', musculos: 'cuádriceps' },
  { id: 'hip_thrust', name: 'Hip thrust', unit: 'rep', coef: 0.9, dbId: 'Barbell_Hip_Thrust', equipo: 'barra', musculos: 'glúteos' },
  { id: 'calf', name: 'Elevación de gemelos', unit: 'rep', coef: 0.5, dbId: 'Barbell_Seated_Calf_Raise', equipo: 'barra', musculos: 'gemelos' },
  { id: 'pushup', name: 'Flexiones', unit: 'rep', coef: 1.2, dbId: 'Pushups', equipo: 'peso corporal', musculos: 'pecho' },
  { id: 'bench', name: 'Press banca', unit: 'rep', coef: 0.8, dbId: 'Barbell_Bench_Press_-_Medium_Grip', equipo: 'barra', musculos: 'pecho' },
  { id: 'incline', name: 'Press inclinado', unit: 'rep', coef: 0.8, dbId: 'Barbell_Incline_Bench_Press_-_Medium_Grip', equipo: 'barra', musculos: 'pecho' },
  { id: 'dip', name: 'Fondos', unit: 'rep', coef: 1.5, dbId: 'Dips_-_Triceps_Version', equipo: 'peso corporal', musculos: 'tríceps' },
  { id: 'shoulder_press', name: 'Press militar', unit: 'rep', coef: 1.0, dbId: 'Barbell_Shoulder_Press', equipo: 'barra', musculos: 'hombros' },
  { id: 'lateral', name: 'Elevaciones laterales', unit: 'rep', coef: 0.6, dbId: 'Side_Lateral_Raise', equipo: 'mancuernas', musculos: 'hombros' },
  { id: 'pullup', name: 'Dominadas', unit: 'rep', coef: 2.5, dbId: 'Pullups', equipo: 'peso corporal', musculos: 'dorsales' },
  { id: 'chinup', name: 'Dominadas supinas', unit: 'rep', coef: 2.3, dbId: 'Chin-Up', equipo: 'peso corporal', musculos: 'dorsales' },
  { id: 'row', name: 'Remo con barra', unit: 'rep', coef: 1.0, dbId: 'Bent_Over_Barbell_Row', equipo: 'barra', musculos: 'espalda media' },
  { id: 'pulldown', name: 'Jalón al pecho', unit: 'rep', coef: 0.8, dbId: 'Full_Range-Of-Motion_Lat_Pulldown', equipo: 'polea', musculos: 'dorsales' },
  { id: 'curl', name: 'Curl de bíceps', unit: 'rep', coef: 0.8, dbId: 'Barbell_Curl', equipo: 'barra', musculos: 'bíceps' },
  { id: 'plank', name: 'Plancha', unit: 'seg', coef: 0.33, dbId: 'Plank', equipo: 'peso corporal', musculos: 'abdomen' },
  { id: 'crunch', name: 'Abdominales', unit: 'rep', coef: 0.8, dbId: 'Crunches', equipo: 'peso corporal', musculos: 'abdomen' },
  { id: 'twist', name: 'Giro ruso', unit: 'rep', coef: 0.7, dbId: 'Russian_Twist', equipo: 'peso corporal', musculos: 'abdomen' },
  { id: 'climber', name: 'Mountain climbers', unit: 'rep', coef: 0.9, dbId: 'Mountain_Climbers', equipo: '—', musculos: 'cuádriceps' },
  { id: 'run', name: 'Correr', unit: 'm', coef: 0.08, dbId: 'Jogging_Treadmill', equipo: '—', musculos: 'cuádriceps' },
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
