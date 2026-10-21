# GenericCard Component (`<app-generic-card>`)

The `GenericCard` component is a flexible, highly configurable presentation card designed for **Il Rusticone**. It handles everything from customer-facing buffet package showcases and menu items to administrative catalogs and compact mobile lists.

---

## 📌 Key Capabilities

- **Dual Rendering Modes**:
  1. **Payload-driven mode (`payload`)**: Pass a structured data model ([ICardPayload](file:///Users/lucadimolfetta/Documents/code/rusticone-fe/src/app/core/models/card.model.ts)) to automatically render lazy-loaded images, titles, badge chips, descriptions, footers, and actions.
  2. **Content Projection mode (`ng-content`)**: Compose custom templates with `<card-image>`, `<card-content>`, and `<card-actions>` slots for specialized layouts.
- **Adaptive Action Display**:
  - Automatically toggles between standard bottom action buttons and a compact popover menu ([PopoverMenu](file:///Users/lucadimolfetta/Documents/code/rusticone-fe/src/app/components/popover-menu/popover-menu.ts)) based on card size (`small` vs `regular`/`large`), screen breakpoint (via [LayoutService](file:///Users/lucadimolfetta/Documents/code/rusticone-fe/src/app/core/services/layout.service.ts)), or explicit setting (`actionsDisplay`).
- **Flexible Dimensions & Theming**:
  - **Sizes**: `small` | `regular` (default) | `large`
  - **Layouts**: `vertical` (default) | `horizontal`
  - **Corner Radii**: `none` | `regular` (default) | `full`
- **Signal-First & Zoneless**:
  - Built with modern Angular Signals (`input()`, `model()`, `computed()`, `output()`) and `ChangeDetectionStrategy.OnPush`.
- **CardListContainer Ready**:
  - Exposes an internal `cardTemplate` ViewChild to allow seamless group projection and virtualization inside [CardListContainer](file:///Users/lucadimolfetta/Documents/code/rusticone-fe/src/app/components/card-list-container/card-list-container.ts).

---

## 🎛️ API Reference

### Component Selector & Import

```typescript
import { GenericCard } from '@components/generic-card/generic-card';
// Or relative:
import { GenericCard } from './components/generic-card/generic-card';
```

```html
<app-generic-card ... />
```

### Inputs (`input()` / `model()`)

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `payload` | `ICardPayload \| null` | `null` | Structured card data. When non-null, activates payload-driven template mode. |
| `size` | `model<CardSize>` | `'regular'` | Card dimension scale: `'small'`, `'regular'`, or `'large'`. |
| `layout` | `model<CardLayout>` | `'vertical'` | Flex direction: `'vertical'` (stacked) or `'horizontal'` (row). |
| `round` | `model<CardRound>` | `'regular'` | Corner radius style: `'none'`, `'regular'` (`rounded-2xl`), or `'full'` (`rounded-3xl`). |
| `actions` | `input<ICardAction[]>` | `[]` | List of action buttons/menu items associated with the card. |
| `actionsDisplay` | `input<'auto' \| 'buttons' \| 'menu'>` | `'auto'` | Force button bar (`'buttons'`), popover menu (`'menu'`), or responsive auto-detection (`'auto'`). |
| `actionAlwaysVisible`| `input<boolean>` | `false` | Whether actions should always stay visible regardless of container states. |
| `showImgeDetail` | `input<boolean>` | `false` | Boolean toggle for advanced image detail view. |
| `footerClass` | `input<string>` | `''` | Extra CSS class names for styling the card footer (e.g. price highlight). |
| `testId` | `input<string>` | `'Generic Card'` | Base test ID identifier for automated testing queries. |

### Outputs (`output()`)

| Event | Type | Description |
| :--- | :--- | :--- |
| `action` | `output<ICardAction>()` | Emits when an action is clicked (either from bottom button bar or popover menu item). Attaches the card's `payload` to the action item payload. |
| `cardClick` | `output<void>()` | Emits when the card container itself is clicked. Does not fire on action or menu clicks due to internal `stopPropagation`. |

---

## 📐 Data Interfaces

### `ICardPayload`

```typescript
export interface ICardPayload {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  titleBadges?: ICardBadge[];
  descriptionBadges?: ICardBadge[];
  footer: string;
}
```

### `ICardBadge`

```typescript
export interface ICardBadge {
  badgeVariant: string[] | string; // DaisyUI badge classes (e.g. 'badge-primary', 'badge-accent')
  badgeContent: string;
}
```

### `ICardAction<T = unknown>`

```typescript
export interface ICardAction<T = unknown> {
  actionName: string;
  item?: T;
  icon?: string;      // Heroicon name (e.g. 'heroPencil', 'heroTrash')
  theme?: string;     // DaisyUI / Tailwind button class (e.g. 'btn-primary', 'text-error')
  disabled?: boolean;
  tooltip?: string;
}
```

---

## 💡 Usage Examples

### 1. Standard Vertical Catalog Card

Ideal for customer-facing menus and buffet packages.

```html
<app-generic-card
  [payload]="pizzaPayload"
  [actions]="cardActions"
  (action)="onHandleAction($event)"
  (cardClick)="onOpenDetails(pizzaPayload)"
/>
```

```typescript
readonly pizzaPayload: ICardPayload = {
  title: 'Pizza Rustica Speciale',
  description: 'Mozzarella di bufala campana DOP, datterini arrosto, salsiccia e basilico fresco.',
  imageUrl: '/assets/images/pizza-rustica.webp',
  imageAlt: 'Pizza Rustica Speciale',
  footer: '€ 12,50',
  titleBadges: [
    { badgeVariant: 'badge-accent', badgeContent: 'Bestseller' },
  ],
  descriptionBadges: [
    { badgeVariant: 'badge-outline text-stone-500', badgeContent: 'Cotto a legna' },
  ],
};

readonly cardActions: ICardAction[] = [
  { actionName: 'Aggiungi', theme: 'btn-primary', icon: 'heroPlus' },
];

onHandleAction(act: ICardAction): void {
  console.log('Action triggered:', act.actionName, act.item);
}
```

---

### 2. Horizontal Compact Card (Small Layout)

Useful for order summaries, side drawers, and mobile list views.

```html
<app-generic-card
  [payload]="pizzaPayload"
  size="small"
  layout="horizontal"
  round="regular"
  [actions]="adminActions"
  (action)="onAdminAction($event)"
/>
```

> [!NOTE]
> When `size="small"` or when on mobile screens, `GenericCard` automatically transitions action buttons into a sleek ellipsis popover menu (`<app-popover-menu>`) positioned right next to the content.

---

### 3. Content Projection (Custom Template Mode)

When `payload` is `null` (or omitted), `GenericCard` acts as a structural wrapper utilizing content projection:

```html
<app-generic-card size="regular" layout="vertical">
  <card-image>
    <img src="/assets/buffet-hero.jpg" alt="Buffet Catering" class="h-48 w-full object-cover" />
  </card-image>

  <card-content>
    <h3 class="font-display text-xl font-bold">Buffet Cerimonie</h3>
    <p class="text-stone-600 text-sm">Pacchetto completo da 30 a 100 persone con pizzaiolo dedicato.</p>
  </card-content>

  <card-actions>
    <button type="button" class="btn btn-primary btn-sm btn-scale">
      Richiedi Preventivo
    </button>
  </card-actions>
</app-generic-card>
```

---

### 4. Integration with `CardListContainer`

`GenericCard` works directly with [CardListContainer](file:///Users/lucadimolfetta/Documents/code/rusticone-fe/src/app/components/card-list-container/card-list-container.ts) to provide collapsible categories, grid layout synchronization, and content children grouping:

```html
<app-card-list-container [groupBy]="'category'">
  <app-generic-card [payload]="margheritaPayload" />
  <app-generic-card [payload]="diavolaPayload" />
  <app-generic-card [payload]="tiramisuPayload" />
</app-card-list-container>
```

---

## 🎨 Styling & Theming

- **DaisyUI `caramellatte` Theme**: Uses `--color-base-100`, `--color-rust-600`, and `--color-terracotta` tokens for borders, hover elevation, and price accents.
- **Typography**:
  - Titles render in **Playfair Display** (`font-display`).
  - Descriptions, badges, and footers render in **DM Sans** (`font-body`).
- **Button Micro-Interactions**:
  - Buttons adhere to `@utility btn-scale` defined in `styles.css` for subtle hover (`scale-[1.02]`) and active click (`scale-[0.98]`) feedback.
- **Image Hover Effects**:
  - Card images smoothly scale up (`scale-105`) on card hover with GPU-accelerated ease-out transitions.

---

## 🧪 Testing Standards

Following the project's testing conventions in `AGENTS.md`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getByTestId, ICardPayload } from '@core';
import { GenericCard } from './generic-card';

describe('GenericCard', () => {
  let component: GenericCard;
  let fixture: ComponentFixture<GenericCard>;
  let template: DebugElement;

  const testIdPrefix = 'Generic Card - ';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericCard],
    }).compileComponents();

    fixture = TestBed.createComponent(GenericCard);
    component = fixture.componentInstance;
    template = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should render payload image and footer correctly', () => {
    const mockPayload: ICardPayload = {
      title: 'Margherita',
      description: 'Pomodoro e mozzarella',
      imageUrl: '/img.jpg',
      imageAlt: 'Margherita',
      footer: '8.50 €',
    };

    fixture.componentRef.setInput('payload', mockPayload);
    fixture.detectChanges();

    const image = getByTestId(template, 'Image', { prefix: testIdPrefix });
    const footer = getByTestId(template, 'Footer', { prefix: testIdPrefix });

    expect(image?.nativeElement.getAttribute('src')).toBe('/img.jpg');
    expect(footer?.nativeElement.textContent.trim()).toBe('8.50 €');
  });
});
```

---

## 🔗 Related Components & Services

- [PopoverMenu](file:///Users/lucadimolfetta/Documents/code/rusticone-fe/src/app/components/popover-menu/popover-menu.ts): Sub-component managing responsive action menus and native HTML Popover API positioning.
- [CardListContainer](file:///Users/lucadimolfetta/Documents/code/rusticone-fe/src/app/components/card-list-container/card-list-container.ts): Container supporting grouping, search filtering, and responsive grid layouts for generic cards.
- [LayoutService](file:///Users/lucadimolfetta/Documents/code/rusticone-fe/src/app/core/services/layout.service.ts): Supplies reactive screen size signals determining when cards collapse actions into the popover menu.
