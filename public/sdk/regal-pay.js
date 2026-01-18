/**
 * Regal Pay JavaScript SDK
 * Version: 1.0.0
 * 
 * Usage:
 * <script src="https://yourdomain.com/sdk/regal-pay.js"></script>
 * <script>
 *   const regalPay = new RegalPay('your_api_key');
 *   regalPay.createButton({
 *     amount: 500.00,
 *     orderId: 'order_123',
 *     containerId: 'regal-pay-button',
 *     onSuccess: (data) => console.log('Success:', data),
 *     onCancel: () => console.log('Cancelled'),
 *     onError: (error) => console.error('Error:', error)
 *   });
 * </script>
 */

(function(window) {
  'use strict';

  const REGAL_PAY_API_URL = window.location.origin; // Will be replaced with actual API URL
  const SDK_VERSION = '1.0.0';

  class RegalPay {
    constructor(apiKey, options = {}) {
      if (!apiKey) {
        throw new Error('RegalPay: API key is required');
      }

      this.apiKey = apiKey;
      this.environment = options.environment || 'production';
      this.apiUrl = options.apiUrl || REGAL_PAY_API_URL;
      this.debug = options.debug || false;
    }

    /**
     * Create a checkout session and render a "Pay with Regal Pay" button
     * @param {Object} params - Checkout parameters
     * @param {number} params.amount - Order amount
     * @param {string} params.orderId - Merchant's order ID
     * @param {string} params.containerId - ID of container element for button
     * @param {Object} params.orderMetadata - Additional order data (optional)
     * @param {string} params.customerEmail - Customer email (optional)
     * @param {string} params.customerPhone - Customer phone (optional)
     * @param {Function} params.onSuccess - Success callback
     * @param {Function} params.onCancel - Cancel callback
     * @param {Function} params.onError - Error callback
     */
    createButton(params) {
      const {
        amount,
        orderId,
        containerId,
        orderMetadata = {},
        customerEmail,
        customerPhone,
        onSuccess,
        onCancel,
        onError
      } = params;

      // Validation
      if (!amount || amount <= 0) {
        throw new Error('RegalPay: Valid amount is required');
      }
      if (!orderId) {
        throw new Error('RegalPay: Order ID is required');
      }
      if (!containerId) {
        throw new Error('RegalPay: Container ID is required');
      }

      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`RegalPay: Container element with ID "${containerId}" not found`);
      }

      // Create button
      const button = this._createButtonElement(amount);
      container.appendChild(button);

      // Add click handler
      button.addEventListener('click', async () => {
        try {
          button.disabled = true;
          button.innerHTML = this._getLoadingButtonHTML();

          // Create checkout session
          const session = await this._createCheckoutSession({
            amount,
            orderId,
            orderMetadata,
            customerEmail,
            customerPhone
          });

          if (!session.success || !session.sessionUrl) {
            throw new Error(session.error || 'Failed to create checkout session');
          }

          // Open checkout in new window or redirect
          this._openCheckout(session.sessionUrl, session.session, onSuccess, onCancel,onError);

        } catch (error) {
          console.error('RegalPay checkout error:', error);
          button.disabled = false;
          button.innerHTML = this._getButtonHTML(amount);
          if (onError) onError(error);
        }
      });

      return button;
    }

    /**
     * Create a checkout session via API
     */
    async _createCheckoutSession(params) {
      const returnUrl = `${window.location.origin}/regal-pay-success`;
      const cancelUrl = `${window.location.origin}/regal-pay-cancel`;

      const response = await fetch(`${this.apiUrl}/api/checkout/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RegalPay-API-Key': this.apiKey,
          'X-RegalPay-SDK-Version': SDK_VERSION
        },
        body: JSON.stringify({
          orderAmount: params.amount,
          orderId: params.orderId,
          orderMetadata: params.orderMetadata,
          customerEmail: params.customerEmail,
          customerPhone: params.customerPhone,
          returnUrl: returnUrl,
          cancelUrl: cancelUrl,
          webhookUrl: this._getWebhookUrl()
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `API request failed: ${response.status}`);
      }

      return await response.json();
    }

    /**
     * Open checkout flow
     */
    _openCheckout(sessionUrl, sessionData, onSuccess, onCancel, onError) {
      // Open in popup window
      const width = 600;
      const height = 800;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      const popup = window.open(
        sessionUrl,
        'RegalPayCheckout',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      if (!popup) {
        // Fallback to redirect if popup blocked
        window.location.href = sessionUrl;
        return;
      }

      // Poll for popup close
      const pollTimer = setInterval(() => {
        if (popup.closed) {
          clearInterval(pollTimer);
          // Check if success or cancel
          this._checkCheckoutResult(sessionData.id, onSuccess, onCancel, onError);
        }
      }, 500);
    }

    /**
     * Check checkout result after popup closes
     */
    async _checkCheckoutResult(sessionId, onSuccess, onCancel, onError) {
      try {
        const response = await fetch(`${this.apiUrl}/api/checkout/status/${sessionId}`, {
          headers: {
            'X-RegalPay-API-Key': this.apiKey
          }
        });

        const result = await response.json();

        if (result.status === 'completed') {
          if (onSuccess) onSuccess(result);
        } else if (result.status === 'cancelled') {
          if (onCancel) onCancel();
        }
      } catch (error) {
        console.error('Error checking checkout result:', error);
        if (onError) onError(error);
      }
    }

    /**
     * Create button element
     */
    _createButtonElement(amount) {
      const button = document.createElement('button');
      button.className = 'regal-pay-button';
      button.innerHTML = this._getButtonHTML(amount);
      this._applyButtonStyles(button);
      return button;
    }

    /**
     * Get button HTML
     */
    _getButtonHTML(amount) {
      return `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
          <path d="M2 7h20M2 12h20M2 17h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>Pay with Regal Pay</span>
        <span style="margin-left: auto; font-size: 14px; opacity: 0.9;">
          From $${this._calculateMonthlyPayment(amount)}/mo
        </span>
      `;
    }

    /**
     * Get loading button HTML
     */
    _getLoadingButtonHTML() {
      return `
        <svg class="regal-pay-spinner" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/>
        </svg>
        <span style="margin-left: 8px;">Opening Regal Pay...</span>
      `;
    }

    /**
     * Apply button styles
     */
    _applyButtonStyles(button) {
      button.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 24px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      `;

      button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
      });

      button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
      });

      // Add spinner animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes regal-pay-spin {
          to { transform: rotate(360deg); }
        }
        .regal-pay-spinner {
          animation: regal-pay-spin 1s linear infinite;
        }
      `;
      document.head.appendChild(style);
    }

    /**
     * Calculate estimated monthly payment (assuming 4-month plan)
     */
    _calculateMonthlyPayment(amount) {
      return (amount / 4).toFixed(2);
    }

    /**
     * Get webhook URL from merchant site
     */
    _getWebhookUrl() {
      // Merchant can set this via meta tag
      const meta = document.querySelector('meta[name="regal-pay-webhook"]');
      return meta ? meta.getAttribute('content') : null;
    }

    /**
     * Log debug messages
     */
    _log(...args) {
      if (this.debug) {
        console.log('[RegalPay SDK]', ...args);
      }
    }
  }

  // Expose to global scope
  window.RegalPay = RegalPay;

})(window);
