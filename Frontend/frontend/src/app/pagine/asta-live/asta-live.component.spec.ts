import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AstaLiveComponent } from './asta-live.component';

describe('AstaLiveComponent', () => {
  let component: AstaLiveComponent;
  let fixture: ComponentFixture<AstaLiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AstaLiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AstaLiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
