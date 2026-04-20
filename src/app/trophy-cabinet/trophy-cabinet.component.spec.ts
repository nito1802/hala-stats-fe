import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrophyCabinetComponent } from './trophy-cabinet.component';

describe('TrophyCabinetComponent', () => {
  let component: TrophyCabinetComponent;
  let fixture: ComponentFixture<TrophyCabinetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrophyCabinetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrophyCabinetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
