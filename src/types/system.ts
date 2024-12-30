import { ReactNode } from 'react';

export interface System {
  id: string;
  name?: string;
  shortName?: string;
  icon?: string;
  description?: string;
  year?: string;
  manufacturer?: string;
  color?: string;
  gradient?: string;
  component?: ReactNode;
}