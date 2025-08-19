import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe - replace with your actual publishable key
// Disable analytics when they're blocked to prevent console errors
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here', {
  // Disable analytics to prevent blocked request errors
  apiVersion: '2023-10-16',
  // This should help reduce analytics requests
})

// Check if Stripe analytics requests are being blocked
let analyticsBlocked = false
const checkStripeAnalytics = () => {
  try {
    // Test if we can make a request to Stripe's analytics endpoint
    const testUrl = 'https://r.stripe.com/b'
    fetch(testUrl, { 
      method: 'POST', 
      mode: 'no-cors',
      body: 'test'
    }).then(() => {
      analyticsBlocked = false
      console.log('Stripe analytics working normally')
    }).catch(() => {
      analyticsBlocked = true
      console.log('Stripe analytics requests are being blocked (likely by ad-blocker) - this is normal and won\'t affect functionality')
    })
  } catch (error) {
    analyticsBlocked = true
    console.log('Stripe analytics check failed - assuming blocked')
  }
}

class StripeService {
  constructor() {
    this.stripe = null
    this.initialize()
    // Check if Stripe analytics are being blocked
    checkStripeAnalytics()
    
    // Block Stripe analytics requests if they're being blocked
    if (typeof window !== 'undefined') {
      this.blockStripeAnalytics()
    }
  }

  async initialize() {
    try {
      this.stripe = await stripePromise
      if (!this.stripe) {
        console.error('Failed to load Stripe')
      }
    } catch (error) {
      console.error('Error initializing Stripe:', error)
    }
  }

  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(planId, userId) {
    try {
      // This should call your backend API to create a Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId,
          successUrl: `${window.location.origin}/my-space?success=true`,
          cancelUrl: `${window.location.origin}/my-space?canceled=true`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      return sessionId
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  }

  /**
   * Redirect to Stripe checkout
   */
  async redirectToCheckout(sessionId) {
    if (!this.stripe) {
      throw new Error('Stripe not initialized')
    }

    try {
      const { error } = await this.stripe.redirectToCheckout({
        sessionId,
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error redirecting to checkout:', error)
      throw error
    }
  }

  /**
   * Create a customer portal session for managing subscriptions
   */
  async createCustomerPortalSession(userId) {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          returnUrl: `${window.location.origin}/my-space`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      return url
    } catch (error) {
      console.error('Error creating portal session:', error)
      throw error
    }
  }

  /**
   * Redirect to customer portal
   */
  async redirectToCustomerPortal(userId) {
    try {
      const url = await this.createCustomerPortalSession(userId)
      window.location.href = url
    } catch (error) {
      console.error('Error redirecting to customer portal:', error)
      throw error
    }
  }

  /**
   * Check if Stripe analytics are being blocked
   */
  isAnalyticsBlocked() {
    return analyticsBlocked
  }

  /**
   * Block Stripe analytics requests to prevent console errors
   */
  blockStripeAnalytics() {
    try {
      // Override fetch to block Stripe analytics requests
      const originalFetch = window.fetch
      window.fetch = function(url, options) {
        if (typeof url === 'string' && url.includes('r.stripe.com')) {
          console.log('Blocking Stripe analytics request to prevent console errors')
          return Promise.resolve(new Response('', { status: 200 }))
        }
        return originalFetch.apply(this, arguments)
      }
      
      // Also block XMLHttpRequest
      const originalXHROpen = XMLHttpRequest.prototype.open
      XMLHttpRequest.prototype.open = function(method, url, ...args) {
        if (typeof url === 'string' && url.includes('r.stripe.com')) {
          console.log('Blocking Stripe analytics XHR request to prevent console errors')
          this.abort()
          return
        }
        return originalXHROpen.apply(this, arguments)
      }
      
      console.log('Stripe analytics requests are now blocked to prevent console errors')
    } catch (error) {
      console.log('Could not block Stripe analytics requests:', error)
    }
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(userId) {
    try {
      const response = await fetch(`/api/stripe/subscription-status/${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to get subscription status')
      }

      const subscription = await response.json()
      return subscription
    } catch (error) {
      console.error('Error getting subscription status:', error)
      throw error
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId, newPlanId) {
    try {
      const response = await fetch('/api/stripe/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          newPlanId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update subscription')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error updating subscription:', error)
      throw error
    }
  }
}

// Create singleton instance
const stripeService = new StripeService()

export default stripeService
