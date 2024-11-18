import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadisticaUnidadPenalidadComponent } from './estadistica-unidad-penalidad.component';

describe('EstadisticaUnidadPenalidadComponent', () => {
  let component: EstadisticaUnidadPenalidadComponent;
  let fixture: ComponentFixture<EstadisticaUnidadPenalidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstadisticaUnidadPenalidadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadisticaUnidadPenalidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
