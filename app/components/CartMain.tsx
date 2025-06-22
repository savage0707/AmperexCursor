import {useOptimisticCart} from '@shopify/hydrogen';
import { Link } from 'react-router-dom';
import { useState, useEffect, Suspense } from 'react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {CartNotifications, CartQuickActions, CartSecurityBadge} from './CartNotifications';
import { Await } from 'react-router-dom';
import { useRootLoaderData } from '~/lib/root-loader';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  layout: CartLayout;
};

/**
 * The main cart component that displays the cart items and summary.
 * Enhanced with modern design, animations, and additional features.
 */
export function CartMain({layout}: CartMainProps) {
  const { cart: cartPromise } = useRootLoaderData();

  return (
    <Suspense fallback={<p>Loading cart...</p>}>
      <Await resolve={cartPromise}>
        {(cart) => <CartDisplay cart={cart as any} layout={layout} />}
      </Await>
    </Suspense>
  );
}

function CartDisplay({ cart, layout }: { cart: CartApiQueryFragment | null; layout: CartLayout }) {
  const [isLoading, setIsLoading] = useState(false);
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;

  // Simulate loading state for better UX
  useEffect(() => {
    if (cart?.lines?.nodes?.length) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cart?.lines?.nodes?.length]);

  return (
    <div className={`enhanced-cart ${className}`}>
      <CartEmpty hidden={linesCount} layout={layout} />
      
      {cartHasItems && (
        <>
          <CartNotifications cart={cart} />
          
          <div className="cart-header">
            <div className="cart-title">
              <h2>Your Shopping Cart</h2>
              <span className="cart-count">({cart.totalQuantity} items)</span>
            </div>
            <div className="cart-actions">
              <button 
                className="save-for-later-btn"
                onClick={() => setSavedItems([...savedItems, ...(cart?.lines?.nodes || [])])}
              >
                💾 Save for Later
              </button>
              <button 
                className="recommendations-btn"
                onClick={() => setShowRecommendations(!showRecommendations)}
              >
                🎯 Recommendations
              </button>
            </div>
          </div>

          <CartQuickActions />
        </>
      )}

      <div className="cart-details">
        {isLoading && (
          <div className="cart-loading">
            <div className="loading-spinner"></div>
            <p>Updating your cart...</p>
          </div>
        )}
        
        <div aria-labelledby="cart-lines" className="cart-items-container">
          <ul className="cart-items-list">
            {(cart?.lines?.nodes ?? []).map((line) => (
              <CartLineItem key={line.id} line={line} layout={layout} />
            ))}
          </ul>
        </div>

        {savedItems.length > 0 && (
          <div className="saved-items-section">
            <h3>Saved for Later ({savedItems.length})</h3>
            <div className="saved-items-grid">
              {savedItems.map((item, index) => (
                <div key={index} className="saved-item">
                  <div className="saved-item-image">
                    {item.merchandise?.image && (
                      <img 
                        src={item.merchandise.image.url} 
                        alt={item.merchandise.title}
                        width="60"
                        height="60"
                      />
                    )}
                  </div>
                  <div className="saved-item-details">
                    <h4>{item.merchandise?.product?.title}</h4>
                    <p className="saved-item-price">
                      {item.cost?.totalAmount?.amount} {item.cost?.totalAmount?.currencyCode}
                    </p>
                    <button 
                      className="move-to-cart-btn"
                      onClick={() => {
                        // Move item back to cart logic
                        setSavedItems(savedItems.filter((_, i) => i !== index));
                      }}
                    >
                      Move to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showRecommendations && (
          <div className="recommendations-section">
            <h3>You Might Also Like</h3>
            <div className="recommendations-grid">
              {/* Mock recommendations - in real app, fetch from API */}
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="recommendation-item">
                  <div className="recommendation-image">
                    <div className="placeholder-image"></div>
                  </div>
                  <div className="recommendation-details">
                    <h4>Recommended Product {item}</h4>
                    <p className="recommendation-price">$29.99</p>
                    <button className="add-to-cart-btn">Add to Cart</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {cartHasItems && (
          <>
            <CartSecurityBadge />
            <CartSummary cart={cart} layout={layout} />
          </>
        )}
      </div>
    </div>
  );
}

function CartEmpty({
  hidden = false,
  layout,
}: {
  hidden: boolean;
  layout?: CartLayout;
}) {
  const {close} = useAside();
  return (
    <div className="cart-empty" hidden={hidden}>
      <div className="empty-cart-icon">🛒</div>
      <h2>Your cart is empty</h2>
      <p>
        Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
        started!
      </p>
      <div className="empty-cart-actions">
        <Link 
          to="/collections" 
          onClick={close} 
          className="continue-shopping-btn"
        >
          Continue Shopping →
        </Link>
        <Link 
          to="/collections/all" 
          onClick={close} 
          className="browse-all-btn"
        >
          Browse All Products
        </Link>
      </div>
    </div>
  );
}
