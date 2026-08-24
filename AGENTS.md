# Il Rusticone - Frontend Guidelines & Agent Instructions

## 🍕 Project Overview

**Rusticone Frontend (`rusticone-fe`)** is the client web application for **"Il Rusticone"**, an artisanal pizzeria offering a dedicated buffet catering service.
The application showcases catering buffet packages, menu customization, quote/order requests, and will feature an **interactive AI chatbot** to assist customers in estimating catering needs, answering menu questions, and building customized buffet proposals.

---

## 🛠️ Technology Stack & Architecture

- **Framework**: Angular 22+ (Standalone Components, Zoneless reactivity with Signals).
- **Styling**:
  - Tailwind CSS v4 (`@tailwindcss/postcss`).
  - DaisyUI v5 (Theme configured: `caramellatte`).
  - Typography: `Playfair Display` (headings/display font) and `DM Sans` (body font).
- **State Management & Reactivity**:
  - Prefer modern Angular Signals (`signal()`, `computed()`, `effect()`, `linkedSignal()`, `resource()`).
  - Use Signal-based inputs & outputs (`input()`, `output()`, `model()`).
  - Avoid legacy RxJS constructs where native Signals suffice.
- **Control Flow**:
  - Use built-in control flow syntax (`@if`, `@for`, `@switch`, `@let`, `@defer`).
- **Forms**:
  - Reactive Forms (`FormGroup`, `FormControl`, `NonNullableFormBuilder`) or Signal-based Forms where appropriate.
- **Testing**:
  - Vitest + JSDOM (`npm test`).
- **AI / Chatbot Integration (Upcoming)**:
  - Streaming conversational UI for catering recommendations and smart buffet builder.

---

## 📐 Project Structure & Conventions

```
src/
├── app/
│   ├── core/               # Singleton services, interceptors, guards, global configs
│   ├── shared/             # Reusable UI components (buttons, modals, cards), pipes, directives
│   ├── features/           # Feature-based domain modules (routes & pages)
│   │   ├── home/           # Landing page & hero presentation
│   │   ├── buffet/         # Buffet packages, menu builder, item catalog
│   │   ├── quote/          # Quote request & order summary
│   │   └── chat/           # AI chatbot assistant for catering inquiries
│   ├── app.config.ts       # Application providers (router, http, zoneless, etc.)
│   ├── app.routes.ts       # Root routing definitions
│   └── app.ts              # Root standalone component
├── assets/ / public/       # Static assets, images, icons, manifests
├── styles.css              # Global styles, Tailwind imports, theme configurations
└── index.html              # HTML entrypoint
```

---

## 🎯 Development & Agent Guidelines

### 1. Modern Angular Standards

- **Always use Standalone Components** (`standalone: true` is default in recent Angular versions; omit legacy `NgModule` unless strictly interacting with third-party legacy libraries).
- **Zoneless & Signal-first**:
  - Design components around Signals for local and shared state.
  - Utilize `ChangeDetectionStrategy.OnPush` across all components.
  - Leverage `@defer (on viewport | on interaction)` for performance and lazy-loading heavy UI elements (e.g. buffet menus, modals, chatbot widget).
- **Clean File Separation**:
  - Follow Angular style conventions: `*.component.ts` (or `*.ts` matching convention), `*.html`, and `*.css` when necessary.

### 2. UI & Design System

- **Brand Identity**: Warm, artisanal, Italian rustic yet elegant dining aesthetic.
- **DaisyUI & Tailwind**:
  - Rely on DaisyUI semantic classes (`btn`, `card`, `badge`, `modal`, `fieldset`, `label`, `input`, etc.) with the `caramellatte` theme palette.
  - Apply `--font-display` (`font-display` / Playfair Display) for titles and `--font-body` (`font-body` / DM Sans) for text.
- **Tailwind CSS & Component Styling Convention**:
  - **Do NOT write long Tailwind class chains directly in HTML templates** (unless there are only 1 or 2 classes to apply).
  - For a higher number of classes, create meaningful, semantic class names in the component's linked `*.css` file and compose them using Tailwind's `@apply` syntax.
  - In component `*.css` files, include `@reference "<relative-path>/styles.css";` at the top so Tailwind v4 recognizes custom `@theme` tokens and utilities.
- **Mobile-First & Accessible**:
  - Ensure fully responsive layouts for mobile catering requests.
  - Adhere to WCAG accessibility guidelines (semantic HTML, proper ARIA labels, keyboard navigation).

### 3. AI Assistant Integration Guidelines (Future-proofing)

- Design modular UI components for the chat widget to easily embed or dock anywhere in the flow.
- Maintain decoupled service layers for streaming AI responses, conversation state management, and buffet tool-calling / action triggers.

### 4. Code Formatting & Style

- **Prettier**: Use Prettier for formatting (`"semi": true`, `"singleQuote": true`, `"printWidth": 100`). Always end statements with semicolons.
- **Icons**: This project uses `@ng-icons/core` to provide icons. `NgIcon` component should be used to display icons. The icons are imported from `@ng-icons/heroicons/outline` or `@ng-icons/heroicons/solid`.
### 5. Git & Commits

- Use Conventional Commits (`feat:`, `fix:`, `style:`, `refactor:`, `test:`, `docs:`).

### 6. Component creation conventions
- For component attributes and methods, prefer using the "#" prefix instead of the "private" access modifier

### 7. Forms & Validation
- Create forms using `FormBuilder` class, don't create directly FormGroups with syntax like form = new FormGroup({})