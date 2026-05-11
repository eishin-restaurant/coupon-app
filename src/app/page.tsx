import { supabase, Coupon } from '@/lib/supabase';

export default async function Home() {
  const { data: coupons, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          🍣 お食事処えいしん - 接続テスト
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">エラー発生</p>
            <p className="text-sm">{error.message}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            登録されているクーポン
          </h2>

          {coupons && coupons.length > 0 ? (
            <ul className="space-y-4">
              {coupons.map((coupon: Coupon) => (
                <li
                  key={coupon.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{coupon.name}</h3>
                    {coupon.badge_label && (
                      <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                        {coupon.badge_label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {coupon.description}
                  </p>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <span>
                      タイミング: {coupon.usage_timing === 'today' ? '本日' : '持帰り'}
                    </span>
                    <span>•</span>
                    <span>
                      単位: {coupon.usage_unit === 'per_person' ? '1名1枚' : '1組1枚'}
                    </span>
                    <span>•</span>
                    <span>
                      併用: {coupon.combinable ? '可' : '不可'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">クーポンが見つかりません</p>
          )}
        </div>
      </div>
    </main>
  );
}