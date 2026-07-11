import * as React from 'react';

import {
  Card as CardPrimitive,
  CardContent as CardContentPrimitive,
  CardDescription as CardDescriptionPrimitive,
  CardFooter as CardFooterPrimitive,
  CardHeader as CardHeaderPrimitive,
  CardTitle as CardTitlePrimitive,
} from '../components/ui/card';
import type { CardContentProps, CardDescriptionProps, CardFooterProps, CardHeaderProps, CardProps, CardTitleProps } from './Card.types';

const CardInner = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => <CardPrimitive ref={ref} {...props} />);
CardInner.displayName = 'Card';

const CardHeaderInner = React.forwardRef<HTMLDivElement, CardHeaderProps>((props, ref) => <CardHeaderPrimitive ref={ref} {...props} />);
CardHeaderInner.displayName = 'CardHeader';

const CardTitleInner = React.forwardRef<HTMLDivElement, CardTitleProps>((props, ref) => <CardTitlePrimitive ref={ref} {...props} />);
CardTitleInner.displayName = 'CardTitle';

const CardDescriptionInner = React.forwardRef<HTMLDivElement, CardDescriptionProps>((props, ref) => <CardDescriptionPrimitive ref={ref} {...props} />);
CardDescriptionInner.displayName = 'CardDescription';

const CardContentInner = React.forwardRef<HTMLDivElement, CardContentProps>((props, ref) => <CardContentPrimitive ref={ref} {...props} />);
CardContentInner.displayName = 'CardContent';

const CardFooterInner = React.forwardRef<HTMLDivElement, CardFooterProps>((props, ref) => <CardFooterPrimitive ref={ref} {...props} />);
CardFooterInner.displayName = 'CardFooter';

export const Card = React.memo(CardInner) as typeof CardInner;
export const CardHeader = React.memo(CardHeaderInner) as typeof CardHeaderInner;
export const CardTitle = React.memo(CardTitleInner) as typeof CardTitleInner;
export const CardDescription = React.memo(CardDescriptionInner) as typeof CardDescriptionInner;
export const CardContent = React.memo(CardContentInner) as typeof CardContentInner;
export const CardFooter = React.memo(CardFooterInner) as typeof CardFooterInner;
