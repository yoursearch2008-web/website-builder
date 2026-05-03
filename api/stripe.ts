import type { VercelRequest, VercelResponse } from '@vercel/node'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
const DOMAIN = process.env.DOMAIN || 'unitsprosai.xyz'

const prices = new Map<string, { amount: number; name: string }>([
  ['starter', { amount: 200, name: 'Starter - 100 queries/day' }],
  ['pro', { amount: 500, name: 'Pro - Unlimited queries' }],
])

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.query.path || ''

  if (path === 'checkout') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { plan, successUrl, cancelUrl } = req.body

    if (!STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe not configured' })
    }

    const price = prices.get(plan || 'starter')
    if (!price) {
      return res.status(400).json({ error: 'Invalid plan' })
    }

    try {
      const sessionRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'mode': 'subscription',
          'success_url': successUrl || `https://${DOMAIN}/ai?paid=true`,
          'cancel_url': cancelUrl || `https://${DOMAIN}/ai?cancelled=true`,
          'line_items[0][price_data][currency]': 'usd',
          'line_items[0][price_data][unit_amount]': String(price.amount),
          'line_items[0][price_data][product_data][name]': price.name,
          'line_items[0][price_data][product_data][description]': `OpenServe AI ${plan} plan`,
          'line_items[0][quantity]': '1',
        }),
      })

      const session = await sessionRes.json()

      if (session.error) {
        return res.status(400).json({ error: session.error.message })
      }

      return res.status(200).json({ url: session.url, sessionId: session.id })
    } catch (e) {
      return res.status(500).json({ error: 'Checkout failed', details: String(e) })
    }
  }

  if (path === 'webhook') {
    const sig = req.headers['stripe-signature']
    const body = JSON.stringify(req.body)

    if (!STRIPE_WEBHOOK_SECRET || !sig) {
      return res.status(400).json({ error: 'Missing webhook config' })
    }

    try {
      const event = JSON.parse(body)
      
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        const customerEmail = session.customer_email
        console.log('Payment completed for:', customerEmail)
      }

      if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object
        console.log('Subscription cancelled:', subscription.id)
      }

      return res.status(200).json({ received: true })
    } catch (e) {
      return res.status(400).json({ error: 'Webhook error' })
    }
  }

  if (path === 'portal') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { customerId } = req.body

    if (!STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe not configured' })
    }

    try {
      const portalRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          customer: customerId,
          return_url: `https://${DOMAIN}/ai`,
        }),
      })

      const portal = await portalRes.json()

      if (portal.error) {
        return res.status(400).json({ error: portal.error.message })
      }

      return res.status(200).json({ url: portal.url })
    } catch (e) {
      return res.status(500).json({ error: 'Portal failed', details: String(e) })
    }
  }

  return res.status(404).json({ error: 'Not found' })
}