import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useRef, useState} from 'react';
import { FetcherWithComponents, Form } from 'react-router-dom';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';

  // Calculate progress for free shipping
  const subtotal = parseFloat(cart.cost?.subtotalAmount?.amount || '0');
  const freeShippingThreshold = 100; // $100 for free shipping
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = Math.max(freeShippingThreshold - subtotal, 0);

  return (
    <div aria-labelledby="cart-summary" className={`enhanced-cart-summary ${className}`}>
      {/* Free Shipping Progress */}
      {subtotal > 0 && subtotal < freeShippingThreshold && (
        <div className="free-shipping-progress">
          <div className="progress-header">
            <span className="progress-text">
              Add ${remainingForFreeShipping.toFixed(2)} more for FREE shipping!
            </span>
            <span className="progress-percentage">{progress.toFixed(0)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{width: `${progress}%`}}
            ></div>
          </div>
        </div>
      )}

      {subtotal >= freeShippingThreshold && (
        <div className="free-shipping-achieved">
          🎉 You've qualified for FREE shipping!
        </div>
      )}

      <div className="summary-content">
        <h3 className="summary-title">Order Summary</h3>
        
        <div className="summary-details">
          <dl className="cart-subtotal">
            <dt>Subtotal</dt>
            <dd>
              {cart.cost?.subtotalAmount?.amount ? (
                <Money data={cart.cost?.subtotalAmount} />
              ) : (
                '-'
              )}
            </dd>
          </dl>

          <CartDiscounts discountCodes={cart.discountCodes} />
          <CartGiftCard giftCardCodes={cart.appliedGiftCards} />
          
          {cart.cost?.totalTaxAmount?.amount && (
            <dl className="cart-tax">
              <dt>Tax</dt>
              <dd>
                <Money data={cart.cost.totalTaxAmount} />
              </dd>
            </dl>
          )}

          <dl className="cart-total">
            <dt>Total</dt>
            <dd>
              {cart.cost?.totalAmount?.amount ? (
                <Money data={cart.cost.totalAmount} />
              ) : (
                '-'
              )}
            </dd>
          </dl>
        </div>

        <div className="summary-benefits">
          <div className="benefit-item">
            <span className="benefit-icon">🚚</span>
            <span>Free shipping on orders over $100</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🔄</span>
            <span>30-day easy returns</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🔒</span>
            <span>Secure checkout</span>
          </div>
        </div>

        <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
      </div>
    </div>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!checkoutUrl) return null;

  const handleCheckout = () => {
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      window.location.href = checkoutUrl;
    }, 500);
  };

  return (
    <div className="checkout-actions">
      <button 
        className="checkout-btn primary"
        onClick={handleCheckout}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <div className="spinner"></div>
            Processing...
          </>
        ) : (
          <>
            🛒 Continue to Checkout
            <span className="checkout-arrow">→</span>
          </>
        )}
      </button>
      
      <div className="payment-methods">
        <span className="payment-label">We accept:</span>
        <div className="payment-icons">
          <span className="payment-icon">💳</span>
          <span className="payment-icon">🏦</span>
          <span className="payment-icon">📱</span>
        </div>
      </div>
    </div>
  );
}

function CartDiscounts({
  discountCodes,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div className="discounts-section">
      {/* Have existing discount, display it with a remove option */}
      <dl hidden={!codes.length} className="applied-discounts">
        <div className="discount-item">
          <dt>Discount(s)</dt>
          <UpdateDiscountForm>
            <div className="cart-discount">
              <code className="discount-code">{codes?.join(', ')}</code>
              <button className="remove-discount-btn">Remove</button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div className="discount-input-container">
          <input 
            type="text" 
            name="discountCode" 
            placeholder="Enter discount code" 
            className="discount-input"
          />
          <button type="submit" className="apply-discount-btn">Apply</button>
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
}) {
  const appliedGiftCardCodes = useRef<string[]>([]);
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const codes: string[] =
    giftCardCodes?.map(({lastCharacters}) => `***${lastCharacters}`) || [];

  function saveAppliedCode(code: string) {
    const formattedCode = code.replace(/\s/g, ''); // Remove spaces
    if (!appliedGiftCardCodes.current.includes(formattedCode)) {
      appliedGiftCardCodes.current.push(formattedCode);
    }
    giftCardCodeInput.current!.value = '';
  }

  function removeAppliedCode() {
    appliedGiftCardCodes.current = [];
  }

  return (
    <div className="gift-card-section">
      {/* Have existing gift card applied, display it with a remove option */}
      <dl hidden={!codes.length} className="applied-gift-cards">
        <div className="gift-card-item">
          <dt>Applied Gift Card(s)</dt>
          <UpdateGiftCardForm>
            <div className="cart-discount">
              <code className="gift-card-code">{codes?.join(', ')}</code>
              <button 
                className="remove-gift-card-btn"
                onClick={removeAppliedCode}
              >
                Remove
              </button>
            </div>
          </UpdateGiftCardForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateGiftCardForm
        giftCardCodes={appliedGiftCardCodes.current}
        saveAppliedCode={saveAppliedCode}
      >
        <div className="gift-card-input-container">
          <input
            type="text"
            name="giftCardCode"
            placeholder="Enter gift card code"
            ref={giftCardCodeInput}
            className="gift-card-input"
          />
          <button type="submit" className="apply-gift-card-btn">Apply</button>
        </div>
      </UpdateGiftCardForm>
    </div>
  );
}

function UpdateGiftCardForm({
  giftCardCodes,
  saveAppliedCode,
  children,
}: {
  giftCardCodes?: string[];
  saveAppliedCode?: (code: string) => void;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesUpdate}
      inputs={{
        giftCardCodes: giftCardCodes || [],
      }}
    >
      {(fetcher: FetcherWithComponents<any>) => {
        const code = fetcher.formData?.get('giftCardCode');
        if (code && saveAppliedCode) {
          saveAppliedCode(code as string);
        }
        return children;
      }}
    </CartForm>
  );
}
