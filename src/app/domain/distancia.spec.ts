import { distanciaMetros } from './distancia';

describe('distancia', () => {
  it('un grado de latitud son unos 111 km', () => {
    expect(Math.round(distanciaMetros(0, 0, 0, 1))).toBe(111195);
  });

  it('el mismo punto da cero', () => {
    expect(distanciaMetros(-34.6, -58.4, -34.6, -58.4)).toBe(0);
  });
});
