import { ComponentFixture, TestBed } from '@angular/core/testing';
import AdminQuotes from './admin-quotes';

describe('AdminQuotes', () => {
  let component: AdminQuotes;
  let fixture: ComponentFixture<AdminQuotes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminQuotes],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminQuotes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
