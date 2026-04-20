import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrophyAwardDetailsComponent } from './trophy-award-details.component';

describe('TrophyAwardDetailsComponent', () => {
  let component: TrophyAwardDetailsComponent;
  let fixture: ComponentFixture<TrophyAwardDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrophyAwardDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrophyAwardDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
