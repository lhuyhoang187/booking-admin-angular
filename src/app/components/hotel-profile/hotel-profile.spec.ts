import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelProfile } from './hotel-profile';

describe('HotelProfile', () => {
  let component: HotelProfile;
  let fixture: ComponentFixture<HotelProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(HotelProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
