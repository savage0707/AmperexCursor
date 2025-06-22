import { useRouteLoaderData } from 'react-router';
import type { RootLoader } from '~/root';

export function useRootLoaderData() {
  const data = useRouteLoaderData<RootLoader>('root');
  if (!data) {
    throw new Error('No root loader data found');
  }
  return data;
} 