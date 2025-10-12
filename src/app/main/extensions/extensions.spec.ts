import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Extensions } from './extensions';
describe('Extensions', () => {
  let component: Extensions;
  let fixture: ComponentFixture<Extensions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Extensions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Extensions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
