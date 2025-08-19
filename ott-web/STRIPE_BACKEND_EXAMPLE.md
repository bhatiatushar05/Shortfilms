# Stripe Backend Integration Guide

This guide shows how to implement the backend API endpoints needed for the Stripe subscription system.

## 🚀 **Backend Requirements**

You'll need a backend server (Node.js/Express, Python/Django, etc.) with these endpoints:

### 1. **Create Checkout Session**
```javascript
// POST /api/stripe/create-checkout-session
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { planId, userId, successUrl, cancelUrl } = req.body
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: getStripePriceId(planId), // Map plan ID to Stripe price ID
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: getUserEmail(userId), // Get user email from your database
      metadata: {
        userId: userId,
        planId: planId
      }
    })
    
    res.json({ sessionId: session.id })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

### 2. **Create Customer Portal Session**
```javascript
// POST /api/stripe/create-portal-session
app.post('/api/stripe/create-portal-session', async (req, res) => {
  try {
    const { userId, returnUrl } = req.body
    
    const customer = await getStripeCustomerId(userId) // Get from your database
    const session = await stripe.billingPortal.sessions.create({
      customer: customer,
      return_url: returnUrl,
    })
    
    res.json({ url: session.url })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

### 3. **Get Subscription Status**
```javascript
// GET /api/stripe/subscription-status/:userId
app.get('/api/stripe/subscription-status/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const subscription = await getSubscriptionFromDatabase(userId)
    
    res.json({
      status: subscription.status,
      plan: subscription.plan,
      nextBilling: subscription.nextBilling,
      features: subscription.features
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

## 🔧 **Stripe Setup**

### 1. **Install Stripe**
```bash
npm install stripe
```

### 2. **Initialize Stripe**
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
```

### 3. **Environment Variables**
```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

## 📊 **Database Schema**

### **Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Subscriptions Table**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  stripe_subscription_id TEXT UNIQUE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 **Plan Mapping**

### **Stripe Price IDs**
```javascript
const PLAN_PRICES = {
  'basic': 'price_basic_monthly_id',
  'premium': 'price_premium_monthly_id'
}

function getStripePriceId(planId) {
  return PLAN_PRICES[planId]
}
```

## 🔄 **Webhook Handling**

### **Stripe Webhook Endpoint**
```javascript
// POST /api/stripe/webhook
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }
  
  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object)
      break
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object)
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object)
      break
  }
  
  res.json({ received: true })
})
```

## 🚀 **Quick Start**

### 1. **Get Stripe Keys**
- Sign up at [stripe.com](https://stripe.com)
- Get your test keys from the dashboard

### 2. **Update Frontend**
```javascript
// In your .env file
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 3. **Test Integration**
- Use Stripe test card: `4242 4242 4242 4242`
- Any future date for expiry
- Any 3-digit CVC

## 🔒 **Security Notes**

- **Never expose secret keys** in frontend code
- **Always verify webhook signatures**
- **Use HTTPS in production**
- **Implement proper authentication** for API endpoints

## 📱 **Mobile Support**

The Stripe checkout works on mobile devices automatically. For better mobile experience, consider:

- **Stripe Elements** for custom payment forms
- **Apple Pay/Google Pay** integration
- **Mobile-optimized checkout** flows

## 🎉 **What You Get**

- **Secure payment processing**
- **Automatic subscription management**
- **Customer portal for self-service**
- **Webhook-based real-time updates**
- **Professional checkout experience**

## 📞 **Support**

- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **Stripe Support**: Available in your dashboard
- **Community**: [stripe-community.com](https://stripe-community.com)

---

**Note**: This is a basic implementation. For production, add proper error handling, logging, monitoring, and security measures.
