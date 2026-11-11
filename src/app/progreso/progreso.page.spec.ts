import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { ProgresoPage } from './progreso.page';

describe('ProgresoPage', () => {
  let component: ProgresoPage;
  let fixture: ComponentFixture<ProgresoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgresoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
