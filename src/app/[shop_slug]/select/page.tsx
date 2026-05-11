'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Coupon, Shop } from '@/lib/supabase';

const TEXT = {
  title: '\u30af\u30fc\u30dd\u30f3\u3092\u304a\u9078\u3073\u304f\u3060\u3055\u3044',
  thanks: '\u53e3\u30b3\u30df\u6295\u7a3f\u3042\u308a\u304c\u3068\u3046\u3054\u3056\u3044\u307e\u3059\uff01',
  selectOne: '\u3044\u305a\u308c\u304b',
  selectOneSuffix: '\u3092\u9078\u3093\u3067\u304f\u3060\u3055\u3044',
  selectOneEmphasis: '1\u3064',
  badgeToday: '\u672c\u65e5\u9069\u7528',
  tagPerPerson: '1\u540d1\u679a',
  tagPerGroup: '1\u7d441\u679a',
  tagUnlimited: '\u5236\u9650\u306a\u3057',
  tagCombinable: '\u30c6\u30fc\u30d6\u30eb\u4f75\u7528\u53ef',
  tagNotCombinable: '\u4f75\u7528\u4e0d\u53ef',
  submitButton: '\u3053\u306e\u30af\u30fc\u30dd\u30f3\u3092\u4f7f\u3046',
  noticeLine1: '\u203b \u9078\u629e\u306f1\u4eba1\u56de\u306e\u307f\u30fb\u5909\u66f4\u4e0d\u53ef',
  noticeLine2: '\u203b \u3054\u5bb6\u65cf\u30fb\u3054\u53cb\u4eba\u304c\u53e3\u30b3\u30df\u6295\u7a3f\u3055\u308c\u305f\u5834\u5408\u306f',
  noticeLine3: '\u5404\u81ea\u3053\u306e\u30da\u30fc\u30b8\u304b\u3089\u53d6\u5f97\u3067\u304d\u307e\u3059',
  loading: '\u8aad\u307f\u8fbc\u307f\u4e2d...',
  errorMessage: '\u30af\u30fc\u30dd\u30f3\u306e\u8aad\u307f\u8fbc\u307f\u306b\u5931\u6557\u3057\u307e\u3057\u305f',
};

function getUnitText(unit: string): string {
  if (unit === 'per_person') return TEXT.tagPerPerson;
  if (unit === 'per_group') return TEXT.tagPerGroup;
  return TEXT.tagUnlimited;
}

export default function SelectPage() {
  const params = useParams();
  const router = useRouter();
  const shop_slug = params.shop_slug as string;

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: shopData } = await supabase
          .from('shops')
          .select('*')
          .eq('slug', shop_slug)
          .eq('is_active', true)
          .maybeSingle();

        if (!shopData) {
          setError(TEXT.errorMessage);
          setLoading(false);
          return;
        }
        setShop(shopData);

        const { data: couponData } = await supabase
          .from('coupons')
          .select('*')
          .eq('shop_id', shopData.id)
          .eq('is_published', true)
          .order('display_order', { ascending: true });

        setCoupons(couponData || []);
        if (couponData && couponData.length > 0) {
          setSelectedId(couponData[0].id);
        }
      } catch (e) {
        setError(TEXT.errorMessage);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [shop_slug]);

  function handleSubmit() {
    if (!selectedId) return;
    router.push(`/${shop_slug}/coupon/${selectedId}`);
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">{TEXT.loading}</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden">
        <header className="bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-6 text-center">
          <p className="text-sm text-white opacity-90">{shop?.name}</p>
          <h1 className="text-xl font-bold text-white mt-1">{TEXT.title}</h1>
        </header>
        <div className="px-5 py-6 space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">{TEXT.thanks}</p>
            <p className="text-base font-medium text-gray-900 mt-2">
              {TEXT.selectOne}
              <span className="text-amber-600 font-bold mx-1">{TEXT.selectOneEmphasis}</span>
              {TEXT.selectOneSuffix}
            </p>
          </div>
          <div className="space-y-3">
            {coupons.map((coupon) => {
              const isSelected = selectedId === coupon.id;
              const isOrange = coupon.badge_color === 'orange';
              const cardClass = isOrange
                ? 'bg-amber-50 border-amber-600'
                : 'bg-emerald-50 border-emerald-600';
              const radioColor = isOrange ? 'bg-amber-600' : 'bg-emerald-600';
              const badgeColor = isOrange ? 'bg-amber-600' : 'bg-emerald-700';
              const tagColor = isOrange
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800';
              const textColor = isOrange ? 'text-amber-900' : 'text-emerald-900';

              return (
                <button
                  key={coupon.id}
                  type="button"
                  onClick={() => setSelectedId(coupon.id)}
                  className={`relative w-full text-left rounded-xl px-4 py-4 pl-12 transition-all ${cardClass} ${isSelected ? 'border-2 shadow-md' : 'border'}`}
                >
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? `${radioColor} border-transparent` : 'border-gray-300 bg-white'}`}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-bold text-base ${textColor}`}>{coupon.name}</h3>
                    {coupon.badge_label && (
                      <span className={`text-xs text-white px-2 py-0.5 rounded shrink-0 ${badgeColor}`}>{coupon.badge_label}</span>
                    )}
                  </div>
                  <p className={`text-xs ${textColor} opacity-80 mb-2`}>{coupon.description}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded ${tagColor}`}>{getUnitText(coupon.usage_unit)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${tagColor}`}>{coupon.combinable ? TEXT.tagCombinable : TEXT.tagNotCombinable}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedId}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium text-base py-4 px-6 rounded-xl shadow-md transition-colors"
          >
            {TEXT.submitButton}
          </button>
          <div className="border-t border-gray-200 pt-4 space-y-1">
            <p className="text-xs text-gray-500 text-center">{TEXT.noticeLine1}</p>
            <p className="text-xs text-gray-500 text-center">{TEXT.noticeLine2}</p>
            <p className="text-xs text-gray-500 text-center">{TEXT.noticeLine3}</p>
          </div>
        </div>
        <footer className="bg-gray-50 px-6 py-3 text-center">
          <p className="text-xs text-gray-500">produced by YTS Products</p>
        </footer>
      </div>
    </main>
  );
}
