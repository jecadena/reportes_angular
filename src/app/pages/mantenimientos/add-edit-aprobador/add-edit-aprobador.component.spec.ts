import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditAprobadorComponent } from './add-edit-aprobador.component';

describe('AddEditAprobadorComponent', () => {
  let component: AddEditAprobadorComponent;
  let fixture: ComponentFixture<AddEditAprobadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditAprobadorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditAprobadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
