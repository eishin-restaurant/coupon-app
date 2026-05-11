import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateCouponCode } from '@/lib/generateCode';

/**
 * \u30af\u30fc\u30dd\u30f3\u767a\u884c\u7528API
 * POST /api/issue
 * body: {\ncoupon_id: string,\ndevice_id: string\n}
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { coupon_id, device_id } = body;

    if (!coupon_id) {
      return NextResponse.json({ error: 'coupon_id is required' }, { status: 400 });
    }

    // \u30b5\u30fc\u30d0\u30fc\u50b4\u3067supabase\u30af\u30e9\u30a4\u30a2\u30f3\u30c8\u3092\u514d\u3048\u308b
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    // \u30af\u30fc\u30dd\u30f3\u60c5\u5831\u5168\u53e6
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', coupon_id)
      .eq('is_published', true)
      .maybeSingle();

    if (couponError || !coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    // \u30af\u30fc\u30dd\u30f3\u7572\u53f7\u751f\u6210
    const code = generateCouponCode('EISHIN');

    // \u6709\u52b9\u671f\u9650\u8a2d\u5b9a
    let expires_at: string | null = null;
    if (coupon.usage_timing === 'today') {
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      expires_at = endOfDay.toISOString();
    } else if (coupon.validity_days) {
      const future = new Date();
      future.setDate(future.getDate() + coupon.validity_days);
      expires_at = future.toISOString();
    }

    // \u767a\u884c\u5b9f\u884c
    const { data: issue, error: issueError } = await supabase
      .from('coupon_issues')
      .insert({
        coupon_id,
        code,
        device_id,
        expires_at,
      })
      .select()
      .single();

    if (issueError) {
      console.error('Issue error:', issueError);
      return NextResponse.json({ error: 'Failed to issue coupon' }, { status: 500 });
    }

    return NextResponse.json({ code, issue });
  } catch (err) {
    console.error('Issue API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
