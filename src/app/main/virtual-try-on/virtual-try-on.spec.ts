import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualTryOn } from './virtual-try-on';

describe('VirtualTryOn', () => {
  let component: VirtualTryOn;
  let fixture: ComponentFixture<VirtualTryOn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VirtualTryOn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VirtualTryOn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
