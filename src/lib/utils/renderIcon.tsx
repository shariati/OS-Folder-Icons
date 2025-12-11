import * as LucideIcons from 'lucide-react';
import * as HeroIcons from '@heroicons/react/24/solid';
import * as Unicons from '@iconscout/react-unicons';
import * as GrommetIcons from 'grommet-icons';
import { clsx } from 'clsx';

export type IconType = 'lucide' | 'fontawesome' | 'heroicons' | 'unicons' | 'grommet-icons';

export function renderIcon(type: IconType, name: string, className?: string, color?: string) {
  if (!name) return null;

  try {
    if (type === 'lucide') {
      const Icon = (LucideIcons as any)[name];
      return Icon ? <Icon className={className} color={color} /> : null;
    } else if (type === 'fontawesome') {
      return <i className={clsx(name, className)} style={{ color }} />;
    } else if (type === 'heroicons') {
      // HeroIcons exports might differ (e.g. StarIcon vs Star)
      // Adjust based on how they are imported/used in project
      const Icon = (HeroIcons as any)[name] || (HeroIcons as any)[`${name}Icon`];
      return Icon ? <Icon className={className} style={{ color }} /> : null;
    } else if (type === 'unicons') {
      const Icon = (Unicons as any)[name];
      return Icon ? <Icon className={className} color={color} /> : null;
    } else if (type === 'grommet-icons') {
      const Icon = (GrommetIcons as any)[name];
      return Icon ? <Icon className={className} color={color} /> : null;
    }
  } catch (e) {
    console.warn(`Failed to render icon ${name} of type ${type}`, e);
    return null;
  }
  return null;
}
