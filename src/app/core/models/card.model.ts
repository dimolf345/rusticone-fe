export interface ICardAction<T = unknown> {
  actionName: string;
  item?: T;
  icon?: string;
  theme?: string;
  disabled?: boolean;
  tooltip?: string;
}

export interface ICardBadge {
  badgeVariant: string[] | string;
  badgeContent: string;
}

export interface ICardPayload {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  titleBadges?: ICardBadge[];
  descriptionBadges?: ICardBadge[];
  footer: string;
}

export interface ICardGroup<T = unknown> {
  key: string;
  title: string;
  items: T[];
  isOpen: boolean;
}

export type CardSize = 'small' | 'regular' | 'large';
export type CardLayout = 'vertical' | 'horizontal';

export type CardGroupBy<T = unknown> = string | ((item: T) => string | string[]);

export type CardGridCols = 1 | 2 | 3 | 4 | 5 | 'auto' | 'default';

