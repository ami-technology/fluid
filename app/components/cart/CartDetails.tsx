import type {Variants} from 'framer-motion';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

import {Money} from '@shopify/hydrogen';
import {AnimatePresence} from 'framer-motion';
import {useMemo} from 'react';

import {cn} from '~/lib/utils';

import type {CartLayouts} from './Cart';

import {ProgressiveMotionDiv} from '../ProgressiveMotionDiv';
import {Button} from '../ui/Button';
import {Card, CardContent} from '../ui/Card';
import {CartDiscounts} from './CartDiscounts';
import {CartLines} from './CartLines';

export function CartDetails({
  cart,
  layout,
  onClose,
}: {
  cart?: CartApiQueryFragment;
  layout: CartLayouts;
  onClose?: () => void;
}) {
  // @todo: get optimistic cart cost
  const cartHasItems = !!cart && cart.totalQuantity > 0;

  const drawerMotionVariants: Variants = {
    hide: {
      height: 0,
    },
    show: {
      height: 'auto',
    },
  };

  const pageMotionVariants: Variants = {
    hide: {
      opacity: 0,
      transition: {
        duration: 0,
      },
    },
    show: {
      opacity: 1,
    },
  };

  return (
    <CartDetailsLayout layout={layout}>
      <CartLines layout={layout} lines={cart?.lines} onClose={onClose} />
      <div>
        <AnimatePresence>
          {cartHasItems && (
            <ProgressiveMotionDiv
              animate="show"
              className={cn([
                layout === 'page' &&
                  'lg:sticky lg:top-[var(--desktopHeaderHeight)]',
              ])}
              exit={'hide'}
              initial={layout === 'drawer' ? 'hide' : 'show'}
              variants={
                layout === 'drawer' ? drawerMotionVariants : pageMotionVariants
              }
            >
              <CartSummary cost={cart.cost} layout={layout}>
                <CartDiscounts
                  discountCodes={cart.discountCodes}
                  layout={layout}
                />
                <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
              </CartSummary>
            </ProgressiveMotionDiv>
          )}
        </AnimatePresence>
      </div>
    </CartDetailsLayout>
  );
}

function CartDetailsLayout(props: {
  children: React.ReactNode;
  layout: CartLayouts;
}) {
  return props.layout === 'drawer' ? (
    <>{props.children}</>
  ) : (
    <div className="container w-full gap-8 pb-12 md:grid md:grid-cols-2 md:items-start md:gap-8 lg:gap-16">
      {props.children}
    </div>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl: string}) {
  if (!checkoutUrl) return null;

  return (
    <div className="mt-2 flex flex-col">
      <Button asChild>
        <a href={checkoutUrl} target="_self">
          {/* Todo => add theme content string */}
          Continue to Checkout
        </a>
      </Button>
      {/* @todo: <CartShopPayButton cart={cart} /> */}
    </div>
  );
}

function CartSummary({
  children = null,
  cost,
  layout,
}: {
  children?: React.ReactNode;
  cost: CartApiQueryFragment['cost'];
  layout: CartLayouts;
}) {
  const Content = useMemo(
    () => (
      <div
        aria-labelledby="summary-heading"
        className={cn([
          layout === 'drawer' && 'grid gap-4 border-t border-border p-6',
          layout === 'page' && 'grid gap-6',
        ])}
      >
        <h2 className="sr-only">
          {/* Todo => add theme content string */}
          Order summary
        </h2>
        <dl className="grid">
          <div className="flex items-center justify-between font-medium">
            {/* Todo => add theme content string */}
            <span>Subtotal</span>
            <span>
              {cost?.subtotalAmount?.amount ? (
                <Money className="tabular-nums" data={cost?.subtotalAmount} />
              ) : (
                '-'
              )}
            </span>
          </div>
        </dl>
        {children}
      </div>
    ),
    [children, cost?.subtotalAmount, layout],
  );

  if (layout === 'drawer') {
    return Content;
  }

  return (
    <Card className="mt-5">
      <CardContent className="px-5 py-6 lg:p-8">{Content}</CardContent>
    </Card>
  );
}
