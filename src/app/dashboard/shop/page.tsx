
'use client';

import dynamic from 'next/dynamic';
import Loading from './loading';

const ShopClientPage = dynamic(() => import('./ShopClientPage'), {
  ssr: false,
  loading: () => <Loading />,
});

export default function ShopPage() {
  return <ShopClientPage />;
}
