import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  return (
    <div aria-labelledby="cart-summary" className="desktop-cart-summary">
      <h2 className="desktop-summary-title">Order Summary</h2>
      <div className="desktop-summary-details">
        {cart.lines.nodes.map((line) => (
          <dl className="desktop-summary-row" key={line.id}>
            <dt>
              {line.merchandise.product.title} &times; {line.quantity}
            </dt>
            <dd>
              <Money data={line.cost.totalAmount} />
            </dd>
          </dl>
        ))}
        <dl className="desktop-summary-row total">
          <dt>Total</dt>
          <dd>
            {cart.cost?.totalAmount?.amount ? (
              <Money data={cart.cost?.totalAmount} />
            ) : (
              '-'
            )}
          </dd>
        </dl>
      </div>
      <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
      <div className="cart-warranty-info">
        <p>
          <strong>Warranty Information:</strong>
        </p>
        <p>
          All our products come with a 1-year standard warranty. For extended
          warranty options, please contact customer support.
        </p>
      </div>
    </div>
  );
}
function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  if (!checkoutUrl) return null;

  return (
    <div>
      <a href={checkoutUrl} target="_self" className="desktop-checkout-btn">
        Continue to Checkout
      </a>
      <br />
    </div>
  );
}
