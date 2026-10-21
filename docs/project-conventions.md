# Project Conventions & Developer Guidelines

Welcome to **Il Rusticone Frontend (`rusticone-fe`)**. This document serves as the central reference guide for all developers contributing to this codebase. It outlines our architectural standards, reactivity patterns, styling conventions, naming rules, and testing requirements.

---

## 🏛️ 1. Architecture & Modern Angular Standards

- **Framework**: Angular 22+ with **Zoneless** change detection.
- **Standalone Architecture**: All components, directives, and pipes must be standalone (`standalone: true` by default in Angular).
- **Change Detection**: Always declare `changeDetection: ChangeDetectionStrategy.OnPush` on every component.
- **Signals First**:
  - Use Angular Signals (`signal()`, `computed()`, `effect()`, `linkedSignal()`, `resource()`, `debounced()`) for state and reactivity.
  - Use Signal-based component inputs & outputs:
    - Inputs: `input<T>()`, `input.required<T>()`, `input(default, { transform: booleanAttribute })`
    - Outputs: `output<T>()`
    - Two-way Model: `model<T>()`
  - Avoid legacy RxJS constructs (`BehaviorSubject`, `ReplaySubject`) when native Signals suffice.
- **Control Flow**:
  - Always use built-in template control flow syntax: `@if`, `@else`, `@for (...; track ...)`, `@switch`, `@let`, `@defer`.

---

## 🧩 2. Components & Services Conventions

### Services
- For singleton application services in `@core`, prefer the new **`@Service()`** decorator instead of traditional `@Injectable()`.
- Services must be declared with appropriate encapsulation and public readonly signals.

### Encapsulation & Field Modifiers
- Prefer JavaScript native private fields with the **`#` prefix** instead of the TypeScript `private` access modifier:
  ```typescript
  export class MyComponent {
    readonly #layoutService = inject(LayoutService);
    readonly #myPrivateState = signal<boolean>(false);
  }
  ```
- *Exception*: Angular signal query decorators (such as `viewChild` and `contentChild`) currently require TypeScript `private` due to Angular compiler runtime injection constraints (`NG1053`):
  ```typescript
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('input');
  ```

### File Separation
- Keep clean separation between files:
  - Component Logic: `component-name.ts`
  - Template: `component-name.html`
  - Styles: `component-name.css`
  - Unit Tests: `component-name.spec.ts`

---

## 🎨 3. Styling, Tailwind CSS v4 & Design System

### Design System & Theme
- **Theme**: DaisyUI v5 configured with the **`caramellatte`** warm Italian rustic theme palette.
- **Typography Tokens**:
  - `--font-display` (`Playfair Display`, serif): Reserved for branding, splash screens, and hero presentation titles.
  - `--font-body` (`DM Sans`, sans-serif): Used for body text, form elements, buttons, and administrative interfaces.
- **Semantic Colors**:
  - Rust Scale: `--color-rust-900` (`#34180e`), `--color-rust-800`, `--color-rust-700`, `--color-rust-600` (`#8b3a16`).
  - Terracotta Palette: `--color-terracotta` (`#c34e3a`), `--color-terracotta-100` to `--color-terracotta-800`.
  - Backgrounds: `--color-canvas-warm` (`#faf5ee`), `--color-input-bg` (`#f0e7dc`).

### Tailwind CSS v4 Component Styling Rules
- **No Long Inline Class Chains**: Avoid long Tailwind class chains directly in HTML templates.
- **Component `@apply` Pattern**: Create meaningful, semantic class names in the component's linked `.css` file and compose them using `@apply`.
- **Global Styles Reference**: Every component `*.css` file must begin with:
  ```css
  @reference "#styles";
  ```
  This references `src/styles.css` (mapped via `package.json` imports) so Tailwind v4 recognizes all theme tokens and custom utilities.

### 🔘 Button Micro-Interactions (`btn-scale`)
- **Always use the global `@utility btn-scale`** defined in `src/styles.css` for button hover and active scale animations (`hover:scale-[1.02] active:scale-[0.98]`).
- Do **not** write ad-hoc hover/active scale utility chains.
- Compose button styles in component `.css` like this:
  ```css
  .my-action-btn {
    @apply btn btn-primary btn-sm btn-scale gap-2 font-semibold text-white;
  }
  ```

---

## 📝 4. Forms & Validation

- Always use the Angular **`FormBuilder`** (or `NonNullableFormBuilder`) class to construct forms:
  ```typescript
  readonly #fb = inject(FormBuilder);
  readonly form = this.#fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });
  ```
- **Do not** instantiate forms directly with `new FormGroup({ ... })`.

---

## 🏷️ 5. Types & Interfaces Naming Conventions

- **Interface Prefix**: All TypeScript interfaces must be prefixed with an uppercase **`I`**:
  - `IUser`, `INavigationItem`, `IAlertItem`, `IErrorAction`, `IApiErrorHandler`, `ILayoutBreakpoint`.
- **Types**: Type aliases should use PascalCase descriptive names (e.g. `ScreenSize`, `SearchbarSize`).

---

## 🧪 6. Unit Testing Standards & Conventions (Vitest)

All component unit tests (`*.spec.ts`) must follow this standardized template:

### Structure & Variables
```typescript
import { ComponentRef, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getByTestId } from '@core';
import { beforeEach, describe, expect, it } from 'vitest';
import { MyComponent } from './my-component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let template: DebugElement;
  let _componentRef: ComponentRef<MyComponent>;

  const testIdPrefix = 'My Component - ';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    template = fixture.debugElement;
    _componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Layout', () => {
    it('should display the main card container', () => {
      const card = getByTestId(template, 'Card container', { prefix: testIdPrefix });
      expect(card).toBeTruthy();
    });
  });

  describe('Behavior', () => {
    it('should perform action when button is clicked', () => {
      const button = getByTestId(template, 'Submit button', { prefix: testIdPrefix });
      button?.nativeElement.click();
      fixture.detectChanges();
      // assertions...
    });
  });
});
```

### DOM Queries with `getByTestId`
- Import `getByTestId` from `@core`.
- In HTML templates, assign `data-testid` attributes with the component name prefix (e.g., `data-testId="My Component - Card container"`).
- Query using `getByTestId(template, 'Card container', { prefix: testIdPrefix })`.

### Describe Blocks Separation
- **`describe('Layout', () => { ... })`**: Pure static UI and DOM element presence tests.
- **`describe('Behavior', () => { ... })`**: User interactions, dynamic signal updates, navigation, and service integrations.

---

## 🚀 7. Commands & Scripts Reference

| Command | Description |
| :--- | :--- |
| `npm run start` | Runs local development server on `http://localhost:4200/` |
| `npm run build` | Compiles production bundle with strict Angular compilation |
| `npm test` | Runs unit tests across all suites with Vitest |
| `npm run lint` | Lints TypeScript and HTML templates using ESLint |
| `npm run lint:fix` | Automatically fixes linting and style issues |
