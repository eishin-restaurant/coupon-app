'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Coupon, Shop } from '@/lib/supabase';

const TEXT = {
  warningLine1: '\u26a0 \u30b9\u30bf\u30c3\u30d5\u3068\u78ba\u8a8d\u306e\u4e0a',
  warningLine2: '\u30bf\u30c3\u30d7\u3092\u304a\u9858\u3044\u3057\u307e\u3059',
  useButton: '\u4f7f\u7528\u6e08\u307f\u306b\u3059\u308b',
  used: '\u4f7f\u7528\u6e08\u307f',
  usedAt: '\u4f7f\u7528\u65e5\u6642',
  note1: '\u203b \u4e00\u5ea6\u30bf\u30c3\u30d7\u3059\u308b\u3068\u5143\u306b\u623b\u305b\u307e\u305b\u3093',
  tagPerPerson: '1\u540d1\u679a',
  tagPerGroup: '1\u7d441\u679a',
  tagUnlimited: '\u5236\u9650\u306a\u3057',
  tagCombinable: '\u30c6\u30fc\u30d6\u30eb\u4f75\u7528\u53ef',
  tagNotCombinable: '\u4f75\u7528\u4e0d\u53ef',
  loading: '\u8aad\u307f\u8fbc\u307f\u4e2d...',
  errorNotFound: '\u30af\u30fc\u30dd\u30f3\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093',
  confirmUse: '\u4f7f\u7528\u6e08\u307f\u306b\u3057\u307e\u3059\u304b\uff1f',
  confirmNote: '\u4e00\u5ea6\u5b9f\u884c\u3059\u308b\u3068\u5143\u306b\u623b\u305b\u307e\u305b\u3093',
  cancel: '\u30ad\u30e3\u30f3\u30bb\u30eb',
  confirm: '\u4f7f\u7528\u3059\u308b',
};

function getUnitText(unit: string): string {
  if (unit === 'per_person') return TEXT.tagPerPerson;
  if (unit === 'per_group') return TEXT.tagPerGroup;
  return TEXT.tagUnlimited;
}

interface Issue {
  id: string;
  coupon_id: string;
  code: string;
  issued_at: string;
  expires_at: string | null;
}

interface Use {
  id: string;
  used_at: string;
}

export default function CouponPage() {
  const params = useParams();
  const shop_slug = params.shop_slug as string;
  const code = params.code as string;

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [use, setUse] = useState<Use | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [using, setUsing] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        let deviceId = localStorage.getItem('yts_device_id');
        if (!deviceId) {
          deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
          localStorage.setItem('yts_device_id', deviceId);
        }

        const { data: shopData } = await supabase
          .from('shops')
          .select('*')
          .eq('slug', shop_slug)
          .maybeSingle();
        setShop(shopData);

        const { data: issueCheck } = await supabase
          .from('coupon_issues')
          .select('*')
          .eq('code', code)
          .maybeSingle();

        if (issueCheck) {
          setIssue(issueCheck);
          const { data: couponData } = await supabase
            .from('coupons')
            .select('*')
            .eq('id', issueCheck.coupon_id)
            .maybeSingle();
          setCoupon(couponData);

          const { data: useData } = await supabase
            .from('coupon_uses')
            .select('*')
            .eq('issue_id', issueCheck.id)
            .maybeSingle();
          if (useData) setUse(useData);
        } else {
          const couponId = code;
          const res = await fetch('/api/issue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coupon_id: couponId, device_id: deviceId }),
          });
          const data = await res.json();

          if (!res.ok) {
            setError(TEXT.errorNotFound);
            return;
          }

          window.location.replace(`/${shop_slug}/coupon/${data.code}`);
          return;
        }
      } catch (e) {
        console.error(e);
        setError(TEXT.errorNotFound);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [code, shop_slug]);

  async function handleUse() {
    if (!issue || using) return;
    setUsing(true);
    try {
      const { data, error } = await supabase
        .from('coupon_uses')
        .insert({ issue_id: issue.id })
        .select()
        .single();
      if (error) {
        console.error(error);
      } else {
        setUse(data);
      }
    } finally {
      setUsing(false);
      setShowConfirm(false);
    }
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">{TEXT.loading}</p>
      </main>
    );
  }

  if (error || !coupon || !issue) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">{error || TEXT.errorNotFound}</p>
      </main>
    );
  }

  const isOrange = coupon.badge_color === 'orange';
  const headerClass = isOrange ? 'bg-amber-600' : 'bg-emerald-700';
  const buttonClass = isOrange ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800' : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800';
  const tagClass = isOrange ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';

  const isUsed = use !== null;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden">
        <header className={`${isUsed ? 'bg-gray-400' : headerClass} px-6 py-6 text-center`}>
          <p className="text-sm text-white opacity-90">{shop?.name}</p>
          <h1 className={`text-2xl font-bold text-white mt-1 ${isUsed ? 'line-through opacity-80' : ''}`}>{coupon.name}</h1>
        </header>
        <div className="px-6 py-8">

          <div className="text-center mb-6">
            <p className="text-sm text-gray-700 mb-3">{coupon.description}</p>
            <div className="flex gap-2 justify-center flex-wrap">
              <span className={`text-xs px-3 py-1 rounded-full ${tagClass}`}>{getUnitText(coupon.usage_unit)}</span>
              <span className={`text-xs px-3 py-1 rounded-full ${tagClass}`}>{coupon.combinable ? TEXT.tagCombinable : TEXT.tagNotCombinable}</span>
            </div>
          </div>

          {isUsed ? (
            <div className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-6 text-center">
              <p className="text-2xl font-bold text-gray-500 mb-2">{TEXT.used}</p>
              <p className="text-xs text-gray-400">{TEXT.usedAt}: {new Date(use!.used_at).toLocaleString('ja-JP')}</p>
            </div>
          ) : showConfirm ? (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-5">
                <p className="text-base font-bold text-amber-900 mb-2">{TEXT.confirmUse}</p>
                <p className="text-xs text-amber-800">{TEXT.confirmNote}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowConfirm(false)} disabled={using} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-xl transition-colors">{TEXT.cancel}</button>
                <button type="button" onClick={handleUse} disabled={using} className={`flex-1 ${buttonClass} text-white font-medium py-3 rounded-xl transition-colors`}>{TEXT.confirm}</button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-center">
                <p className="text-xs text-amber-900">{TEXT.warningLine1}</p>
                <p className="text-xs text-amber-800">{TEXT.warningLine2}</p>
              </div>
              <button type="button" onClick={() => setShowConfirm(true)} className={`w-full ${buttonClass} text-white font-medium text-base py-4 px-6 rounded-xl shadow-md transition-colors`}>{TEXT.useButton}</button>
              <p className="text-xs text-gray-500 mt-3 text-center">{TEXT.note1}</p>
            </>
          )}
        </div>
        <footer className="bg-gray-50 px-6 py-3 text-center">
          <p className="text-xs text-gray-500">produced by YTS Products</p>
        </footer>
      </div>
    </main>
  );
}
