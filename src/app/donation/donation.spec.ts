import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Donation } from './donation';

describe('Donation', () => {
  let component: Donation;
  let fixture: ComponentFixture<Donation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Donation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Donation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
