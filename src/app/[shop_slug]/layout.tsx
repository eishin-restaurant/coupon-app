import { ReactNode } from 'react';
import { getShop } from '@/lib/getShop';
import { notFound } from 'next/navigation';

export default async function ShopLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ shop_slug: string }>;
}) {
  const { shop_slug } = await params;
  const shop = await getShop(shop_slug);

  if (!shop) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {children}
    </div>
  );
}