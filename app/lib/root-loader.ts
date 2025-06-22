import { useRouteLoaderData } from 'react-router-dom';
import type { SerializeFrom } from '@shopify/remix-oxygen';
import type { RootLoader } from '~/root';

export function useRootLoaderData() {
  const data = useRouteLoaderData('root') as SerializeFrom<RootLoader>;
  if (!data) {
    throw new Error('No root loader data found');
  }
  return data;
} 