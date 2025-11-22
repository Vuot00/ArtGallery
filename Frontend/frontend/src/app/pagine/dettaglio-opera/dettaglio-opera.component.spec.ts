import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DettaglioOperaComponent } from './dettaglio-opera.component';

describe('DettaglioOperaComponent', () => {
  let component: DettaglioOperaComponent;
  let fixture: ComponentFixture<DettaglioOperaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DettaglioOperaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DettaglioOperaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
