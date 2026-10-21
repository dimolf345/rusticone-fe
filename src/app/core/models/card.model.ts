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
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  titleBadges?: ICardBadge[];
  descriptionBadges?: ICardBadge[];
  footer: string;
  categories?: string[];
}

export type ICardItem = ICardPayload;
export type CardItem = ICardPayload;
export type CardAction<T = unknown> = ICardAction<T>;

export interface ICardGroup<T = unknown> {
  key: string;
  title: string;
  items: T[];
  isOpen: boolean;
}

export type CardSize = 'small' | 'regular' | 'large';
export type CardLayout = 'vertical' | 'horizontal';
export type CardRound = 'none' | 'regular' | 'full';

export type CardGroupBy<T = unknown> = string | ((item: T) => string | string[]);
