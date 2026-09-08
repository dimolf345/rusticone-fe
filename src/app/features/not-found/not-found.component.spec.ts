import { ComponentRef, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService, getByTestId } from '@core';
import { MockAuthService, mockUser } from '@core/mocks';
import NotFoundComponent from './not-found.component';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;
  let template: DebugElement;
  let _componentRef: ComponentRef<NotFoundComponent>;

  const testIdPrefix = 'Not Found - ';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useClass: MockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    template = fixture.debugElement;
    _componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create the not-found component', () => {
    expect(component).toBeTruthy();
  });

  describe('Layout', () => {
    it('should display a card with error information', () => {
      expect(getByTestId(template, 'Card container', { prefix: testIdPrefix })).toBeTruthy();
    });

    it('should display the error title', () => {
      expect(getByTestId(template, 'Error Title', { prefix: testIdPrefix })).toBeTruthy();
    });
  });

  describe('Behavior', () => {
    let authService: AuthService;

    beforeEach(() => {
      authService = TestBed.inject(AuthService);
    });

    it('should redirect to DASHBOARD if the user is logged In', () => {
      authService.setCurrentUser(mockUser);
      fixture.detectChanges();
      const redirectElement = getByTestId(template, 'Redirect url', { prefix: testIdPrefix });
      expect(redirectElement).toBeTruthy();
      expect(redirectElement!.attributes['href']).toBe(component['paths'].DASHBOARD.ROOT);
    });

    it('should redirect to LANDING if the user is NOT logged in', () => {
      authService.setCurrentUser(null);
      fixture.detectChanges();
      const redirectElement = getByTestId(template, 'Redirect url', { prefix: testIdPrefix });
      expect(redirectElement).toBeTruthy();
      expect(redirectElement!.attributes['href']).toBe(component['paths'].LANDING);
    });
  });



});
