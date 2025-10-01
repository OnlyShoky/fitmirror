import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualTryOnWithApikey } from './virtual-try-on-with-apikey';

describe('VirtualTryOnWithApikey', () => {
  let component: VirtualTryOnWithApikey;
  let fixture: ComponentFixture<VirtualTryOnWithApikey>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VirtualTryOnWithApikey]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VirtualTryOnWithApikey);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
