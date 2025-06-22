import https from 'https';
import fs from 'fs';

// Read environment variables
const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key] = value;
  }
});

const storeDomain = envVars.PUBLIC_STORE_DOMAIN;
const accessToken = envVars.PUBLIC_STOREFRONT_API_TOKEN;

console.log('=== Checking Shopify Store Data ===');

// GraphQL query to check available data
const query = `
{
  shop {
    name
  }
  collections(first: 10) {
    nodes {
      id
      title
      handle
    }
  }
  products(first: 5) {
    nodes {
      id
      title
      handle
    }
  }
}
`;

const data = JSON.stringify({ query });

const options = {
  hostname: storeDomain,
  port: 443,
  path: '/api/2024-01/graphql.json',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'X-Shopify-Storefront-Access-Token': accessToken
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(responseData);
      
      if (result.errors) {
        console.log('\n❌ API Errors:');
        result.errors.forEach(error => {
          console.log('-', error.message);
        });
      } else {
        console.log('\n✅ Store Data Retrieved Successfully!');
        
        console.log('\n=== Available Collections ===');
        if (result.data.collections.nodes.length > 0) {
          result.data.collections.nodes.forEach(collection => {
            console.log(`- ${collection.title} (handle: ${collection.handle})`);
          });
        } else {
          console.log('❌ No collections found in store');
        }
        
        console.log('\n=== Available Products ===');
        if (result.data.products.nodes.length > 0) {
          result.data.products.nodes.forEach(product => {
            console.log(`- ${product.title} (handle: ${product.handle})`);
          });
        } else {
          console.log('❌ No products found in store');
        }
        
        console.log('\n=== Issue Analysis ===');
        console.log('The 500 error is likely caused by:');
        console.log('1. Missing "main-menu" menu in Shopify admin');
        console.log('2. Missing "footer" menu in Shopify admin');
        console.log('3. The root loader is trying to query non-existent menus');
        
        console.log('\n=== Solutions ===');
        console.log('1. Create menus in Shopify admin:');
        console.log('   - Go to: https://riv00a-0e.myshopify.com/admin/navigation');
        console.log('   - Create a "main-menu" menu');
        console.log('   - Create a "footer" menu');
        console.log('\n2. OR update the code to handle missing menus gracefully');
      }
    } catch (error) {
      console.log('\n❌ Error parsing response:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.log('\n❌ Request error:', error.message);
});

req.write(data);
req.end(); 