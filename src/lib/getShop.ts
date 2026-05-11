import { supabase } from '@/lib/supabase';
import type { Shop } from '@/lib/supabase';

/**
 * 店舗slugから店舗情報を取得
 * @param slug 店舗の識別子（例: "eishin"）
 * @returns 店舗情報、見つからなければnull
 */
export async function getShop(slug: string): Promise<Shop | null> {
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching shop:', error);
    return null;
  }

  return data;
}