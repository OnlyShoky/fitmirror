import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TryOn } from './try-on';

describe('TryOn', () => {
  let component: TryOn;
  let fixture: ComponentFixture<TryOn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TryOn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TryOn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
