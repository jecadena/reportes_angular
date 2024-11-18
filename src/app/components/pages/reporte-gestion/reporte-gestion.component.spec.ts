import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteGestionComponent } from './reporte-gestion.component';

describe('ReporteGestionComponent', () => {
  let component: ReporteGestionComponent;
  let fixture: ComponentFixture<ReporteGestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteGestionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
