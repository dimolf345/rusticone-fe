import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavbarNavigationItem } from './navbar-navigation-item';

describe('NavbarNavigationItem', () => {
  let component: NavbarNavigationItem;
  let fixture: ComponentFixture<NavbarNavigationItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarNavigationItem],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarNavigationItem);
    fixture.componentRef.setInput('item', {
      label: 'Home',
      route: '/dashboard/customer',
      icon: 'heroHome',
    });
    fixture.componentRef.setInput('screenSize', 'desktop');
    fixture.componentRef.setInput('isCollapsed', false);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute showLabel correctly based on collapse state and screen size', () => {
    expect(component.showLabel()).toBe(true);

    fixture.componentRef.setInput('isCollapsed', true);
    expect(component.showLabel()).toBe(false);

    fixture.componentRef.setInput('screenSize', 'tablet');
    expect(component.showLabel()).toBe(true);
  });
});
