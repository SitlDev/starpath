import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

// Requires SUPABASE_SERVICE_ROLE_KEY to bypass RLS for webhook updates
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get('Stripe-Signature') as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as any;

    try {
        if (event.type === 'checkout.session.completed') {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

            const priceId = subscription.items.data[0].price.id;
            let planTier = 'basic';
            if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) planTier = 'pro';
            else if (priceId === process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID) planTier = 'standard';

            await supabaseAdmin
                .from('profiles')
                .update({
                    stripe_subscription_id: subscription.id,
                    plan_tier: planTier
                })
                .eq('stripe_customer_id', session.customer as string);
        }

        if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object as any;
            await supabaseAdmin
                .from('profiles')
                .update({
                    plan_tier: 'free'
                })
                .eq('stripe_subscription_id', subscription.id);
        }
    } catch (err: any) {
        console.error('Webhook processing failed:', err.message);
        return new NextResponse(`Webhook Processing Error`, { status: 500 });
    }

    return new NextResponse('OK', { status: 200 });
}
