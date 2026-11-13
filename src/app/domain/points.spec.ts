import { EXERCISES, scoreDay, scoreSet } from './points';

const sentadilla = EXERCISES[0];
const dominadas = EXERCISES[6];
const plancha = EXERCISES[9];

describe('puntos', () => {
  it('10 sentadillas normales valen 10', () => {
    expect(scoreSet({ exercise: sentadilla, reps: 10, esfuerzo: 'normal' })).toBe(10);
  });

  it('el esfuerzo cambia el resultado', () => {
    expect(scoreSet({ exercise: sentadilla, reps: 10, esfuerzo: 'suave' })).toBe(8);
    expect(scoreSet({ exercise: sentadilla, reps: 10, esfuerzo: 'duro' })).toBe(13);
  });

  it('30 segundos de plancha valen 10', () => {
    expect(scoreSet({ exercise: plancha, seconds: 30, esfuerzo: 'normal' })).toBe(10);
  });

  it('una serie vacía vale 0', () => {
    expect(scoreSet({ exercise: sentadilla, esfuerzo: 'normal' })).toBe(0);
  });

  it('un ejercicio no puede pasar de 210 en el día', () => {
    expect(scoreDay([{ exercise: sentadilla, reps: 300, esfuerzo: 'normal' }])).toBe(210);
  });

  it('un día no puede pasar de 400', () => {
    expect(scoreDay([{ exercise: dominadas, reps: 500, esfuerzo: 'normal' }])).toBe(400);
  });
});
