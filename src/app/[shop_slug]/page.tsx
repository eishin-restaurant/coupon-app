import { getShop } from '@/lib/getShop';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const TEXT = {
  thanks: '\u3054\u6765\u5e97\u3042\u308a\u304c\u3068\u3046\u3054\u3056\u3044\u307e\u3059',
  reviewLabel: '\u53e3\u30b3\u30df\u6295\u7a3f\u3067',
  presentLine1: '\u7279\u5225\u30af\u30fc\u30dd\u30f3\u3092',
  presentLine2: '\u30d7\u30ec\u30bc\u30f3\u30c8\uff01',
  googleButton: 'Google\u3067\u53e3\u30b3\u30df\u3092\u66f8\u304f',
  noticeLine1: '\u203b\u6295\u7a3f\u5b8c\u4e86\u5f8c\u3001\u30d6\u30e9\u30a6\u30b6\u306e\u623b\u308b\u30dc\u30bf\u30f3\u3067',
  noticeLine2: '\u3053\u306e\u30da\u30fc\u30b8\u306b\u623b\u308a\u3001',
  noticeLine3: '\u4e0b\u306e\u30dc\u30bf\u30f3\u3092\u30bf\u30c3\u30d7\u3057\u3066\u304f\u3060\u3055\u3044',
  postedButton: '\u6295\u7a3f\u3057\u307e\u3057\u305f',
  footer: 'produced by YTS Products',
};

export default async function WelcomePage({
  params,
}: {
  params: Promise<{ shop_slug: string }>;
}) {
  const { shop_slug } = await params;
  const shop = await getShop(shop_slug);

  if (!shop) {
    notFound();
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden">
        <header className="bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-10 text-center">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            {shop.name}
          </h1>
        </header>
        <div className="px-6 py-8 space-y-6">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900">{TEXT.thanks}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-5 text-center">
            <p className="text-sm text-amber-900 mb-1">{TEXT.reviewLabel}</p>
            <p className="text-lg font-bold text-amber-800">{TEXT.presentLine1}<br />{TEXT.presentLine2}</p>
          </div>
          <a href={shop.google_review_url} target="_blank" rel="noopener noreferrer" className="block w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-base py-4 px-6 rounded-xl text-center transition-colors shadow-md">
            {TEXT.googleButton}
          </a>
          <div className="border-t border-gray-200 pt-5">
            <p className="text-xs text-gray-600 leading-relaxed text-center">
              {TEXT.noticeLine1}<br />
              {TEXT.noticeLine2}<br />
              {TEXT.noticeLine3}
            </p>
          </div>
          <Link href={`/${shop_slug}/select`} className="block w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-medium text-base py-4 px-6 rounded-xl text-center transition-colors shadow-md">
            {TEXT.postedButton}
          </Link>
        </div>
        <footer className="bg-gray-50 px-6 py-3 text-center">
          <p className="text-xs text-gray-500">{TEXT.footer}</p>
        </footer>
      </div>
    </main>
  );
}