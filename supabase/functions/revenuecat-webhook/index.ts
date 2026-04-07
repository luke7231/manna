/**
 * RevenueCat Webhook → Supabase Edge Function
 *
 * 설정 방법:
 *   1. Supabase Dashboard > Edge Functions > Deploy
 *   2. RevenueCat Dashboard > Project > Integrations > Webhooks
 *      → Endpoint URL: https://<project-ref>.supabase.co/functions/v1/revenuecat-webhook
 *      → Authorization Header: Bearer <SUPABASE_ANON_KEY>
 *   3. Edge Function Secrets에 추가:
 *      - REVENUECAT_WEBHOOK_AUTH_KEY: RevenueCat에서 설정한 Authorization 값
 *      - SUPABASE_SERVICE_ROLE_KEY: Supabase Service Role Key (admin 권한)
 *
 * 처리 이벤트:
 *   INITIAL_PURCHASE / RENEWAL  → is_gold = true, 첫 구매 시 만나돌 +500
 *   CANCELLATION / EXPIRATION / BILLING_ISSUE → is_gold = false
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RC_WEBHOOK_AUTH = Deno.env.get('REVENUECAT_WEBHOOK_AUTH_KEY') ?? '';

const ACTIVATE_EVENTS = new Set(['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION']);
const DEACTIVATE_EVENTS = new Set(['CANCELLATION', 'EXPIRATION', 'BILLING_ISSUE']);

Deno.serve(async (req: Request) => {
  // Authorization 검증
  const authHeader = req.headers.get('Authorization') ?? '';
  if (RC_WEBHOOK_AUTH && authHeader !== `Bearer ${RC_WEBHOOK_AUTH}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const event = body?.event;
  if (!event) return new Response('No event', { status: 400 });

  const eventType: string = event.type;
  const appUserId: string = event.app_user_id; // RevenueCat userId = Supabase auth.uid()
  const expiresAtMs: number | null = event.expiration_at_ms ?? null;

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  if (ACTIVATE_EVENTS.has(eventType)) {
    const expiresAt = expiresAtMs ? new Date(expiresAtMs).toISOString() : null;

    const { error } = await supabase
      .from('profiles')
      .update({ is_gold: true, gold_expires_at: expiresAt })
      .eq('id', appUserId);

    if (error) {
      console.error('activate error', error);
      return new Response('DB error', { status: 500 });
    }

    // 최초 구매 시 만나돌 500개 지급
    if (eventType === 'INITIAL_PURCHASE') {
      // 해당 유저의 pair 찾기
      const { data: pair } = await supabase
        .from('pairs')
        .select('id')
        .or(`user1_id.eq.${appUserId},user2_id.eq.${appUserId}`)
        .eq('status', 'connected')
        .single();

      if (pair) {
        await supabase.rpc('add_pebbles', { p_pair_id: pair.id, p_amount: 500 });
      }
    }

    console.log(`[webhook] ${eventType} → user ${appUserId} is_gold=true`);

  } else if (DEACTIVATE_EVENTS.has(eventType)) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_gold: false })
      .eq('id', appUserId);

    if (error) {
      console.error('deactivate error', error);
      return new Response('DB error', { status: 500 });
    }

    console.log(`[webhook] ${eventType} → user ${appUserId} is_gold=false`);
  }

  return new Response('OK', { status: 200 });
});
