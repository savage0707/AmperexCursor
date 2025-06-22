import {useOptimisticCart} from '@shopify/hydrogen';
import { Link } from 'react-router';
import { useState, useEffect, Suspense } from 'react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import { Await } from 'react-router';
import { useRootLoaderData } from '~/lib/root-loader';

export type CartLayout = 'page' | 'aside' | 'desktop';

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

  const cartHasItems = cart?.totalQuantity && cart.totalQuantity > 0;

  useEffect(() => {
    if (cart?.lines?.nodes?.length) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cart?.lines?.nodes?.length]);

  if (layout === 'page') {
    // DESKTOP LAYOUT
    return (
      <div className="desktop-cart">
        {cartHasItems ? (
          <>
            <div className="desktop-cart-header">
              <div className="desktop-cart-title">
                <h1>Shopping Cart</h1>
                <span className="desktop-cart-count">({cart.totalQuantity} items)</span>
              </div>
              <Link to="/collections/all" className="desktop-continue-shopping">
                ← Continue Shopping
              </Link>
            </div>
            <div className="desktop-cart-content">
              <div className="desktop-cart-items-section">
                <div className="desktop-cart-items-header">
                  <h2>Items</h2>
                  <span className="desktop-items-count">{cart.totalQuantity} items</span>
                </div>
                {isLoading && (
                  <div className="desktop-cart-loading">
                    <div className="loading-spinner"></div>
                    <p>Updating your cart...</p>
                  </div>
                )}
                <div className="desktop-cart-items-list">
                  {(cart?.lines?.nodes ?? []).map((line) => (
                    <CartLineItem key={line.id} line={line} layout="desktop" />
                  ))}
                </div>
              </div>
              <div className="desktop-cart-summary-section">
                <div className="desktop-cart-summary-sticky">
                  <CartSummary cart={cart} layout="desktop" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <CartEmpty layout="page" />
        )}
      </div>
    );
  }

  // MOBILE/ASIDE LAYOUT
  return (
    <div className={`enhanced-cart`}>
      {cartHasItems ? (
        <>
          <div className="cart-header">
            <div className="cart-title">
              <h2>Your Shopping Cart</h2>
              <span className="cart-count">({cart.totalQuantity} items)</span>
            </div>
          </div>
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
            {cart && (
              <CartSummary cart={cart} layout={layout} />
            )}
          </div>
        </>
      ) : (
        <CartEmpty layout={layout} />
      )}
    </div>
  );
}

function CartEmpty({
  layout,
}: {
  layout?: CartLayout;
}) {
  const {close} = useAside();
  
  if (layout === 'page') {
    return (
      <div className="desktop-cart-empty">
        <div className="desktop-empty-cart-content">
          <div className="desktop-empty-cart-icon">🛒</div>
          <h1>Your cart is empty</h1>
          <p>
            Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
            started!
          </p>
          <div className="desktop-empty-cart-actions">
            <Link 
              to="/collections" 
              className="desktop-primary-btn"
            >
              Start Shopping
            </Link>
            <Link 
              to="/collections/all" 
              className="desktop-secondary-btn"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-empty">
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
