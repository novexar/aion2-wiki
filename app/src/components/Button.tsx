import type { ComponentPropsWithRef } from 'react';
import { buttonClass, type Size, type Variant } from './button-class';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  readonly variant?: Variant;
  readonly size?: Size;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return <button type={type} className={`${buttonClass(variant, size)} ${className}`} {...rest} />;
}
