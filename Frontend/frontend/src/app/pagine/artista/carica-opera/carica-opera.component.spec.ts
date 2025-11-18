import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaricaOperaComponent } from './carica-opera.component';

describe('CaricaOperaComponent', () => {
  let component: CaricaOperaComponent;
  let fixture: ComponentFixture<CaricaOperaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaricaOperaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaricaOperaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
