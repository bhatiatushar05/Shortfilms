// Stripe completely disabled to prevent console errors
// Uncomment and configure when ready to use Stripe
// import { loadStripe } from '@stripe/stripe-js'

// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
const stripePromise = Promise.resolve(null)

// Check if Stripe analytics requests are being blocked
let analyticsBlocked = false
const checkStripeAnalytics = () => {
  // Skip analytics check to prevent console errors
  analyticsBlocked = true
  console.log('Stripe analytics disabled to prevent console errors')
}

class StripeService {
  constructor() {
    this.stripe = null
    this.initialize()
    // Skip analytics check to prevent console errors
    analyticsBlocked = true
  }

  async initialize() {
    try {
      this.stripe = await stripePromise
      if (!this.stripe) {
        console.log('Stripe disabled - billing features unavailable')
      }
    } catch (error) {
      console.log('Stripe disabled - billing features unavailable')
    }
  }

  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(planId, userId) {
    console.log('Stripe disabled - billing features unavailable')
    throw new Error('Billing features are currently disabled')
  }

  /**
   * Redirect to Stripe checkout
   */
  async redirectToCheckout(sessionId) {
    console.log('Stripe disabled - billing features unavailable')
    throw new Error('Billing features are currently disabled')
  }

  /**
   * Create a customer portal session for managing subscriptions
   */
  async createCustomerPortalSession(userId) {
    console.log('Stripe disabled - billing features unavailable')
    throw new Error('Billing features are currently disabled')
  }

  /**
   * Redirect to customer portal
   */
  async redirectToCustomerPortal(userId) {
    console.log('Stripe disabled - billing features unavailable')
    throw new Error('Billing features are currently disabled')
  }

  /**
   * Check if Stripe analytics are being blocked
   */
  isAnalyticsBlocked() {
    return analyticsBlocked
  }

  // Removed blockStripeAnalytics method to prevent console errors

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
