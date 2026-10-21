# CardListContainer Component (`<app-card-list-container>`)

## 📦 Overview

`CardListContainer` is a high-level container component designed to manage and display lists of cards in both **grouped** (accordion-style categorized sections) and **ungrouped** (responsive CSS grid) layouts.

It handles data coordination, filtering, loading/error/empty lifecycle states, and delegates layout rendering to two dedicated subcomponents:
- **`CardListGrid` (`<app-card-list-grid>`)**: Renders non-grouped items or projected generic cards in a responsive grid.
- **`CardListGrouped` (`<app-card-list-grouped>`)**: Renders collapsible category groups with item counts and chevron indicators.

---

## 🏗️ Architecture & Separation of Concerns

```
<app-card-list-container>
  ├── Loading / Error / Empty states
  ├── Data resolution (httpResource or direct items)
  ├── Search filtering & group ordering
  │
  ├── @if (isGrouped())
  │     └── <app-card-list-grouped>
  │           └── <details> per category
  │                 └── <app-generic-card> or custom template
  └── @else
        └── <app-card-list-grid>
              └── <app-generic-card> or custom template
```

### Key Subcomponents & Helpers

1. **`card-list.util.ts`**:
   - `itemTrackBy(item, index)`: Standard track-by resolver by `id`, `_id`, `title`, or `name`. Dumb/generic across any item type.

2. **`CardListGrid` (`<app-card-list-grid>`)**:
   - Inputs: `items`, `hasResolvedItems`, `actions`, `cardTemplate`.
   - Output: `cardAction`.
   - Projects `<ng-content>` when resolved items are not provided.

3. **`CardListGrouped` (`<app-card-list-grouped>`)**:
   - Inputs: `groups`, `contentGroups`, `hasResolvedItems`, `actions`, `initialCollapsed`, `cardTemplate`.
   - Output: `cardAction`.
   - Manages individual accordion expansion states (`open`, `toggle`).

---

## ⚙️ Inputs & Outputs

### Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `httpResource` | `CardResourceRef<unknown>` | `undefined` | Angular `httpResource` or `ResourceRef` managing async fetch lifecycle. |
| `items` | `unknown[]` | `undefined` | Static or signal-driven items array. |
| `actions` | `ICardAction[]` | `[]` | Action items passed to child `GenericCard` popover menus. |
| `searchTerm` | `string` | `''` | Query filter against item title, description, or categories. |
| `groupBy` | `string \| ((item: unknown) => string \| string[])` | `undefined` | Enables grouped mode by property name or custom grouping function. |
| `groupOrder` | `string[]` | `undefined` | Explicit ordering array for category headers. |
| `initialCollapsed` | `boolean` | `false` | Whether groups default to collapsed on load. |
| `emptyTitle` | `string` | `'Nessun elemento'` | Empty state header message. |
| `emptySubtitle` | `string` | `'Non ci sono schede da visualizzare.'` | Empty state detail message. |
| `loadingMessage` | `string` | `'Caricamento in corso...'` | Message displayed during resource loading. |

### Outputs

| Output | Event Type | Description |
|---|---|---|
| `cardAction` | `ICardAction` | Emitted when an action is selected in any child `GenericCard`. |
| `cardActions` | `ICardAction` | Alias for `cardAction`. |

---

## 💻 Usage Examples

### 1. Grouped with `httpResource` and Actions (e.g., Admin Menu)

```html
<app-card-list-container
  [httpResource]="productsResource"
  [searchTerm]="searchQuery()"
  groupBy="categories"
  [actions]="cardActions"
  (cardAction)="onCardAction($event)"
/>
```

### 2. Ungrouped Grid with Direct Items

```html
<app-card-list-container
  [items]="featuredProducts()"
  (cardAction)="handleSelection($event)"
/>
```

### 3. Content Projection with `<app-generic-card>`

```html
<app-card-list-container [groupBy]="'category'">
  <app-generic-card [payload]="pizzaPayload" />
  <app-generic-card [payload]="drinkPayload" />
</app-card-list-container>
```
