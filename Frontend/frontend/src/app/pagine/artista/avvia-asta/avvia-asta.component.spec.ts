import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvviaAstaComponent } from './avvia-asta.component';

describe('AvviaAstaComponent', () => {
  let component: AvviaAstaComponent;
  let fixture: ComponentFixture<AvviaAstaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvviaAstaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvviaAstaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
