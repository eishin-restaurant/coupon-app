import { createClient } from '@supabase/supabase-js';

// 環境変数から接続情報を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// クライアント側で使うSupabaseクライアント（公開キー使用）
export const supabase = createClient(supabaseUrl, supabasePublishableKey);

// 型定義（後でテーブル構造に合わせて拡張）
export type Coupon = {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  usage_timing: 'today' | 'takeout';
  usage_unit: 'per_group' | 'per_person' | 'unlimited';
  combinable: boolean;
  validity_days: number | null;
  is_published: boolean;
  is_fixed: boolean;
  display_order: number;
  badge_label: string | null;
  badge_color: string | null;
  created_at: string;
  updated_at: string;
};

export type Shop = {
  id: string;
  name: string;
  slug: string;
  google_review_url: string;
  description: string | null;
  is_active: boolean;
};

export type CouponIssue = {
  id: string;
  coupon_id: string;
  code: string;
  device_id: string | null;
  issued_at: string;
  expires_at: string | null;
};