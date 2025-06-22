import {type LoaderFunctionArgs} from 'react-router';
import { Await, useLoaderData, Link, type MetaFunction, useRouteLoaderData } from 'react-router';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';

export const meta: MetaFunction = () => {
  return [{title: 'Hydrogen | Home'}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: LoaderFunctionArgs) {
  try {
    const [{collections}] = await Promise.all([
      context.storefront.query(FEATURED_COLLECTION_QUERY),
      // Add other queries here, so that they are loaded in parallel
    ]);

    return {
      featuredCollection: collections.nodes[0] || null,
    };
  } catch (error) {
    console.error('Error loading featured collection:', error);
    return {
      featuredCollection: null,
    };
  }
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const {header} = useRouteLoaderData('root') as {header: HeaderQuery};

  return (
    <div className="home">
      <HeroSection />
      <CategoryCarousel collections={header?.collections} />
      <ClearanceBanner />
      <FeaturedCollection collection={data.featuredCollection} />
      <WhyChooseUs />
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

function HeroSection() {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1>Welcome to AmpereX Pakistan</h1>
        <p>Your one-stop shop for the best electronic components.</p>
        <Link to="/collections/all" className="button">
          Shop Now
        </Link>
      </div>
    </div>
  );
}

function CategoryCarousel({
  collections,
}: {
  collections: HeaderQuery['collections'];
}) {
  // Handle undefined or empty collections
  if (!collections?.nodes || collections.nodes.length === 0) {
    return (
      <div className="category-carousel">
        <div className="category-carousel-items">
          {/* Fallback category items */}
          <Link to="/collections" className="category-item">
            <span className="category-icon">📱</span>
            <span className="category-title">Collections</span>
          </Link>
          <Link to="/collections/all" className="category-item">
            <span className="category-icon">🛍️</span>
            <span className="category-title">All Products</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="category-carousel">
      <div className="category-carousel-items">
        {collections.nodes.map((collection) => (
          <Link
            key={collection.id}
            to={`/collections/${collection.handle}`}
            className="category-item"
          >
            {/* In a real store, you'd use collection metafields for icons */}
            <span className="category-icon">📱</span>
            <span className="category-title">{collection.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ClearanceBanner() {
  return (
    <div className="clearance-banner">
      <div className="clearance-content">
        <h2>CLEARANCE COUNTDOWN</h2>
        <p>GRAB YOUR SCREEN BEFORE IT'S GONE!</p>
      </div>
      <div className="clearance-action">
        <span>STARTING FROM</span>
        <strong>18.9 KWD</strong>
        <Link to="/collections/all" className="button">
          SHOP NOW
        </Link>
      </div>
    </div>
  );
}

function WhyChooseUs() {
  return (
    <div className="why-choose-us">
      <h2>Why Choose AmpereX?</h2>
      <div className="why-choose-us-grid">
        <div className="feature-item">
          {/* You can replace these with actual icons later */}
          <span className="feature-icon">✓</span>
          <h3>Quality Components</h3>
          <p>We source the best components to ensure high quality and reliability.</p>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🚚</span>
          <h3>Fast Shipping</h3>
          <p>Get your parts delivered quickly to your doorstep, anywhere in Pakistan.</p>
        </div>
        <div className="feature-item">
          <span className="feature-icon">💬</span>
          <h3>Expert Support</h3>
          <p>Our team is here to help you with any questions you may have.</p>
        </div>
      </div>
    </div>
  );
}

function FeaturedCollection({
  collection,
}: {
  collection: FeaturedCollectionFragment;
}) {
  if (!collection) {
    return (
      <div className="featured-collection-section">
        <h2>Featured Products</h2>
        <div className="featured-products-grid">
          <p>Loading featured products...</p>
        </div>
      </div>
    );
  }
  
  const image = collection?.image;
  const products = collection.products?.nodes || [];

  return (
    <div className="featured-collection-section">
      <h2>{collection.title}</h2>
      <div className="featured-products-grid">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              loading="lazy"
            />
          ))
        ) : (
          <p>No products available in this collection.</p>
        )}
      </div>
    </div>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const RECOMMENDED_PRODUCT_FRAGMENT = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
`;

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
    products(first: 4) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
  ${RECOMMENDED_PRODUCT_FRAGMENT}
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
  ${RECOMMENDED_PRODUCT_FRAGMENT}
`;
