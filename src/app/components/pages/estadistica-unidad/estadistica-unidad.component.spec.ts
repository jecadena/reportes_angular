import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadisticaUnidadComponent } from './estadistica-unidad.component';

describe('EstadisticaUnidadComponent', () => {
  let component: EstadisticaUnidadComponent;
  let fixture: ComponentFixture<EstadisticaUnidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstadisticaUnidadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadisticaUnidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
