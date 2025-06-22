import React, {Suspense, useState} from 'react';
import { Await, NavLink, useAsyncValue, Link, Form } from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment, MenuItemFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu, collections, allCategoriesMenu} = header;
  
  // Add error handling for undefined shop data
  if (!shop) {
    return (
      <>
        <TopBar />
        <header className="header">
          <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
            <strong>AmpereX Pakistan</strong>
          </NavLink>
          <HeaderMenu viewport="desktop" />
          <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
        </header>
        <nav className="navigation-bar">
          <div className="mega-menu-container">
            <NavLink to="/collections/all" className="all-categories-button">
              ALL CATEGORIES
            </NavLink>
            <div className="mega-menu-panel">
              <div className="mega-menu-collection-list">
                {/* Fallback menu items */}
                <NavLink to="/collections">Collections</NavLink>
                <NavLink to="/collections/all">All Products</NavLink>
              </div>
            </div>
          </div>
        </nav>
      </>
    );
  }
  
  return (
    <>
      <TopBar />
      <header className="header">
        <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
          <strong>{shop?.name || 'AmpereX Pakistan'}</strong>
        </NavLink>
        <HeaderMenu viewport="desktop" />
        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
      </header>
      <nav className="navigation-bar">
        <div className="mega-menu-container">
          <NavLink to="/collections/all" className="all-categories-button">
            ALL CATEGORIES
          </NavLink>
          <div className="mega-menu-panel">
            <div className="mega-menu-collection-list">
              {allCategoriesMenu?.items?.map((item) => (
                <NavLink
                  to={item.url || ''}
                  key={item.id}
                >
                  {item.title}
                </NavLink>
              )) || (
                // Fallback menu items if allCategoriesMenu is not available
                <>
                  <NavLink to="/collections">Collections</NavLink>
                  <NavLink to="/collections/all">All Products</NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

function TopBar() {
  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <span>An XpressTraders Enterprise</span>
      </div>
      <div className="top-bar-right">
        <Link to="/contact">Chat Support</Link>
        <Link to="/contact">Easy Exchange</Link>
        <span>+92 123 4567890</span>
      </div>
    </div>
  );
}

export function HeaderMenu({
  viewport,
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  viewport: Viewport;
  menu?: HeaderQuery['menu'];
  primaryDomainUrl?: string;
  publicStoreDomain?: string;
}) {
  if (viewport === 'desktop') {
    return (
      <Form method="get" action="/search" className="header-search-form">
        <input type="search" name="q" placeholder="Search" />
        <button type="submit">Search</button>
      </Form>
    );
  }
  
  if (viewport === 'mobile') {
    return (
      <nav className="header-menu-mobile" role="navigation">
        {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
          if (!item.url) return null;
          // if the url is internal, we strip the domain
          const url =
            item.url.includes('myshopify.com') ||
            item.url.includes(publicStoreDomain || '') ||
            item.url.includes(primaryDomainUrl || '')
              ? new URL(item.url).pathname
              : item.url;
          const isExternal = !url.startsWith('/');
          return isExternal ? (
            <a href={url} key={item.id} rel="noopener noreferrer" target="_blank">
              {item.title}
            </a>
          ) : (
            <NavLink
              end
              key={item.id}
              prefetch="intent"
              style={activeLinkStyle}
              to={url}
            >
              {item.title}
            </NavLink>
          );
        })}
      </nav>
    );
  }
  
  return null;
}

function HeaderCtas({isLoggedIn, cart}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink>
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <h3>☰</h3>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button className="reset" onClick={() => open('search')}>
      Search
    </button>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      Cart {count === null ? <span>&nbsp;</span> : count}
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}
