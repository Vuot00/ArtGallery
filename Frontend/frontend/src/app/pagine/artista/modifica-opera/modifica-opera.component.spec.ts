import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificaOperaComponent } from './modifica-opera.component';

describe('ModificaOperaComponent', () => {
  let component: ModificaOperaComponent;
  let fixture: ComponentFixture<ModificaOperaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificaOperaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificaOperaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
