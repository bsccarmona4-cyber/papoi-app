import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { EjerciciosPage } from './ejercicios.page';

describe('EjerciciosPage', () => {
  let component: EjerciciosPage;
  let fixture: ComponentFixture<EjerciciosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EjerciciosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
