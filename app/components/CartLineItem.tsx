import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import { Link } from 'react-router';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import { useState } from 'react';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart with enhanced design and features.
 * Displays product image, title, price with modern styling and animations.
 */
export function CartLineItem({
  layout,
  line,
}: {
  layout: CartLayout;
  line: CartLine;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Desktop layout
  if (layout === 'desktop') {
    return (
      <div className="desktop-cart-line">
        <div className="desktop-cart-line-image">
          {image && (
            <Image
              alt={title}
              aspectRatio="1/1"
              data={image}
              height={100}
              loading="lazy"
              width={100}
            />
          )}
        </div>

        <div className="desktop-cart-line-details">
          <h3 className="desktop-cart-line-title">
            <Link to={lineItemUrl}>{product.title}</Link>
          </h3>
          {selectedOptions.length > 0 && (
            <p className="desktop-cart-line-variant">
              {selectedOptions.map((option) => `${option.name}: ${option.value}`).join(', ')}
            </p>
          )}
        </div>

        <div className="desktop-cart-line-price">
          <ProductPrice price={line?.cost?.totalAmount} />
          {line?.cost?.compareAtAmount && (
            <div className="compare-price">
              <ProductPrice price={line?.cost?.compareAtAmount} />
            </div>
          )}
        </div>

        <div className="desktop-cart-line-actions">
          <DesktopCartLineQuantity line={line} />
          <CartLineRemoveButton lineIds={[id]} disabled={!!(line as any).isOptimistic} />
        </div>
      </div>
    );
  }

  // Mobile/Aside layout (existing code)
  return (
    <li 
      key={id} 
      className={`enhanced-cart-line ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="cart-line-content">
        <div className="cart-line-image-container">
          {image && (
            <Image
              alt={title}
              aspectRatio="1/1"
              data={image}
              height={120}
              loading="lazy"
              width={120}
              className="cart-line-image"
            />
          )}
          <div className="image-overlay">
            <button 
              className="quick-view-btn"
              onClick={() => setShowQuickActions(!showQuickActions)}
            >
              👁️
            </button>
          </div>
        </div>

        <div className="cart-line-details">
          <div className="cart-line-header">
            <Link
              to={lineItemUrl}
              onClick={() => {
                if (layout === 'aside') {
                  close();
                }
              }}
              className="product-title-link"
            >
              <h3 className="product-title">{product.title}</h3>
            </Link>
            <div className="cart-line-price">
              <ProductPrice price={line?.cost?.totalAmount} />
              {line?.cost?.compareAtAmount && (
                <span className="compare-price">
                  <ProductPrice price={line?.cost?.compareAtAmount} />
                </span>
              )}
            </div>
          </div>

          <div className="cart-line-options">
            {selectedOptions.map((option) => (
              <span key={option.name} className="option-tag">
                {option.name}: {option.value}
              </span>
            ))}
          </div>

          <div className="cart-line-actions">
            <CartLineQuantity line={line} />
            <div className="secondary-actions">
              <button className="save-for-later-action">
                💾 Save
              </button>
              <CartLineRemoveButton lineIds={[id]} disabled={!!(line as any).isOptimistic} />
            </div>
          </div>
        </div>
      </div>

      {showQuickActions && (
        <div className="quick-actions-panel">
          <button className="quick-action-btn">🔍 View Details</button>
          <button className="quick-action-btn">📱 Share</button>
          <button className="quick-action-btn">⭐ Add to Wishlist</button>
        </div>
      )}
    </li>
  );
}

/**
 * Enhanced quantity controls with better UX and visual feedback.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity} = line;
  const isOptimistic = (line as any).isOptimistic;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="enhanced-cart-line-quantity">
      <div className="quantity-controls">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || !!isOptimistic}
            name="decrease-quantity"
            value={prevQuantity}
            className="quantity-btn decrease"
          >
            <span>−</span>
          </button>
        </CartLineUpdateButton>
        
        <span className="quantity-display">{quantity}</span>
        
        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            aria-label="Increase quantity"
            name="increase-quantity"
            value={nextQuantity}
            disabled={!!isOptimistic}
            className="quantity-btn increase"
          >
            <span>+</span>
          </button>
        </CartLineUpdateButton>
      </div>
      
      <div className="quantity-info">
        <span className="quantity-label">Qty</span>
        {quantity > 1 && (
          <span className="quantity-total">
            Total: ${(parseFloat(line.cost?.totalAmount?.amount || '0') * quantity).toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Enhanced remove button with confirmation and better styling.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="remove-button-container">
      {!showConfirm ? (
        <button 
          className="remove-btn"
          onClick={() => setShowConfirm(true)}
          disabled={disabled}
        >
          🗑️ Remove
        </button>
      ) : (
        <div className="confirm-remove">
          <span>Remove item?</span>
          <CartForm
            fetcherKey={getUpdateKey(lineIds)}
            route="/cart"
            action={CartForm.ACTIONS.LinesRemove}
            inputs={{lineIds}}
          >
            <button 
              className="confirm-yes-btn"
              disabled={disabled} 
              type="submit"
            >
              Yes
            </button>
          </CartForm>
          <button 
            className="confirm-no-btn"
            onClick={() => setShowConfirm(false)}
          >
            No
          </button>
        </div>
      )}
    </div>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @param lineIds - line ids affected by the update
 * @returns
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}

/**
 * Desktop-specific quantity controls
 */
function DesktopCartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity} = line;
  const isOptimistic = (line as any).isOptimistic;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="desktop-quantity-controls">
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          aria-label="Decrease quantity"
          disabled={quantity <= 1 || !!isOptimistic}
          name="decrease-quantity"
          value={prevQuantity}
          className="desktop-quantity-btn decrease"
        >
          <span>−</span>
        </button>
      </CartLineUpdateButton>
      
      <span className="desktop-quantity-display">{quantity}</span>
      
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          aria-label="Increase quantity"
          name="increase-quantity"
          value={nextQuantity}
          disabled={!!isOptimistic}
          className="desktop-quantity-btn increase"
        >
          <span>+</span>
        </button>
      </CartLineUpdateButton>
    </div>
  );
}
