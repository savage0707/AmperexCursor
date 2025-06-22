import { Await } from 'react-router';
import { Suspense } from 'react';
import { CartForm } from '@shopify/hydrogen';
import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { CartMain } from '~/components/CartMain';
import { useRootLoaderData } from '~/lib/root-loader';

export async function action({ request, context }: ActionFunctionArgs) {
  const { session, cart } = context;
  const formData = await request.formData();
  const { action, inputs } = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result: any;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate:
      const formDiscountCode = inputs.discountCode;
      const discountCodes = formDiscountCode ? [formDiscountCode] : [];
      result = await cart.updateDiscountCodes(discountCodes);
      break;
    case CartForm.ACTIONS.GiftCardCodesUpdate:
        result = await cart.updateGiftCardCodes(inputs.giftCardCodes);
        break;
    default:
      throw new Error(`${action} action is not supported`);
  }

  const cartId = result.cart.id;
  const headers = cart.setCartId(result.cart.id);

  const { cart: cartResult, errors } = result;

  // The Consumable an action returns is used by the optimistic cart UI
  // to update the cart in the UI before the action completes.
  return data(
    {
      cart: cartResult,
      errors,
      analytics: {
        cartId,
      },
    },
    {
      status,
      headers,
    },
  );
}

export async function loader({ context }: LoaderFunctionArgs) {
  const { cart } = context;
  return data(await cart.get());
}

export default function Cart() {
  const rootData = useRootLoaderData();
  const cartPromise = rootData.cart;

  return (
    <div className="cart-page">
      <Suspense fallback={<p>Loading cart...</p>}>
        <Await resolve={cartPromise}>
          {(cart) => (
            <CartMain cart={cart as any} layout="page" />
          )}
        </Await>
      </Suspense>
    </div>
  );
}
