import { useState, useEffect } from 'react';
import type { CartApiQueryFragment } from 'storefrontapi.generated';

interface CartNotificationsProps {
  cart: CartApiQueryFragment | null;
}

export function CartNotifications({ cart }: CartNotificationsProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(true);

  useEffect(() => {
    if (!cart) return;

    const newNotifications = [];

    // Free shipping progress notification
    const subtotal = parseFloat(cart.cost?.subtotalAmount?.amount || '0');
    const freeShippingThreshold = 100;
    
    if (subtotal > 0 && subtotal < freeShippingThreshold) {
      const remaining = freeShippingThreshold - subtotal;
      newNotifications.push({
        id: 'free-shipping',
        type: 'info',
        icon: '🚚',
        title: 'Free Shipping Available!',
        message: `Add $${remaining.toFixed(2)} more to your cart for FREE shipping`,
        progress: (subtotal / freeShippingThreshold) * 100
      });
    } else if (subtotal >= freeShippingThreshold) {
      newNotifications.push({
        id: 'free-shipping-achieved',
        type: 'success',
        icon: '🎉',
        title: 'Free Shipping Applied!',
        message: 'Your order qualifies for free shipping'
      });
    }

    // Low stock warnings
    cart.lines?.nodes?.forEach((line) => {
      const quantityAvailable = (line.merchandise as any)?.quantityAvailable;
      if (quantityAvailable && quantityAvailable <= 5) {
        newNotifications.push({
          id: `low-stock-${line.id}`,
          type: 'warning',
          icon: '⚠️',
          title: 'Low Stock Alert',
          message: `${line.merchandise.product?.title} is running low on stock (${quantityAvailable} left)`
        });
      }
    });

    // Promotional notifications
    if (subtotal > 50 && subtotal < 100) {
      newNotifications.push({
        id: 'promo-10off',
        type: 'promo',
        icon: '🎁',
        title: 'Special Offer!',
        message: 'Use code SAVE10 for 10% off orders over $50'
      });
    }

    setNotifications(newNotifications);
  }, [cart]);

  if (!showNotifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="cart-notifications">
      <div className="notifications-header">
        <h3>Cart Updates</h3>
        <button 
          className="close-notifications-btn"
          onClick={() => setShowNotifications(false)}
        >
          ✕
        </button>
      </div>
      
      <div className="notifications-list">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`notification-item ${notification.type}`}
          >
            <div className="notification-icon">
              {notification.icon}
            </div>
            <div className="notification-content">
              <h4 className="notification-title">{notification.title}</h4>
              <p className="notification-message">{notification.message}</p>
              {notification.progress && (
                <div className="notification-progress">
                  <div 
                    className="progress-bar"
                    style={{ width: `${notification.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
            <button className="dismiss-notification-btn">
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CartQuickActions() {
  return (
    <div className="cart-quick-actions">
      <div className="quick-actions-grid">
        <button className="quick-action-card">
          <div className="action-icon">💳</div>
          <div className="action-content">
            <h4>Split Payment</h4>
            <p>Pay with multiple methods</p>
          </div>
        </button>
        
        <button className="quick-action-card">
          <div className="action-icon">📱</div>
          <div className="action-content">
            <h4>Save Cart</h4>
            <p>Get a link to return later</p>
          </div>
        </button>
        
        <button className="quick-action-card">
          <div className="action-icon">🎁</div>
          <div className="action-content">
            <h4>Gift Wrap</h4>
            <p>Add gift wrapping service</p>
          </div>
        </button>
        
        <button className="quick-action-card">
          <div className="action-icon">📧</div>
          <div className="action-content">
            <h4>Email Cart</h4>
            <p>Send cart to your email</p>
          </div>
        </button>
      </div>
    </div>
  );
}

export function CartSecurityBadge() {
  return (
    <div className="cart-security-badge">
      <div className="security-icons">
        <span className="security-icon" title="SSL Encrypted">🔒</span>
        <span className="security-icon" title="PCI Compliant">🛡️</span>
        <span className="security-icon" title="Secure Checkout">✅</span>
      </div>
      <div className="security-text">
        <p>Your payment information is secure</p>
        <small>256-bit SSL encryption</small>
      </div>
    </div>
  );
} 