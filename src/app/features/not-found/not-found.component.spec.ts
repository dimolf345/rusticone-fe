import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import NotFoundComponent from './not-found.component';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the not-found component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the 404 error heading and message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.error-title')?.textContent).toContain('Ooops, hai sbagliato pagina!');
    expect(compiled.querySelector('.status-code')?.textContent).toContain('404');
  });

  it('should have a link returning to the home page', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const homeLink = compiled.querySelector('.home-btn');
    expect(homeLink).toBeTruthy();
    expect(homeLink?.getAttribute('href') || homeLink?.getAttribute('routerlink') || homeLink?.textContent).toBeTruthy();
  });
});
