import {
  CustomerService,
  LineItemService,
  MedusaRequest,
  MedusaResponse,
  RegionService,
} from '@medusajs/medusa';
import {
  DeleteWishlistItem,
  WishlistItem,
} from '../../../../../types/wishlist';
import {
  REGION_NOT_FOUND,
  WISHLIST_ITEM_NOT_FOUND,
} from '../../../../../consts/error-message';
import {
  CUSTOMER_SERVICE,
  LINE_ITEM_SERVICE,
  REGION_SERVICE,
} from '../../../../../consts/di-keys';

export const POST = async (
  req: MedusaRequest<WishlistItem>,
  res: MedusaResponse
) => {
  const lineItemService: LineItemService = req.scope.resolve(LINE_ITEM_SERVICE);
  const customerService: CustomerService = req.scope.resolve(CUSTOMER_SERVICE);
  const regionService: RegionService = req.scope.resolve(REGION_SERVICE);

  let customer = await customerService.retrieve(req.params.id);
  const regions = await regionService.list();

  if (!regions.length) {
    return res.status(404).json({ message: REGION_NOT_FOUND });
  }

  const region = regions[0];
  const lineItem = await lineItemService.generate(
    req.body.variant_id,
    region.id,
    req.body.quantity ?? 1,
    { metadata: req.body.metadata }
  );

  const wishlist =
    (customer.metadata && (customer.metadata.wishlist as any[])) ?? [];
  const newWishlist = {
    id: lineItem.variant_id,
    quantity: lineItem.quantity,
    metadata: req.body.metadata ?? {},
  };
  customer = await customerService.update(customer.id, {
    metadata: { wishlist: [...wishlist, newWishlist] },
  });

  return res.json({ customer });
};

export const DELETE = async (
  req: MedusaRequest<DeleteWishlistItem>,
  res: MedusaResponse
) => {
  const customerService = req.scope.resolve(CUSTOMER_SERVICE);

  let customer = await customerService.retrieve(req.params.id);

  const wishlist = (customer.metadata && customer.metadata.wishlist) ?? [];

  const newWishlist = [...wishlist];
  const index = newWishlist.findIndex(
    (item) => item.id === req.body.variant_id
  );
  if (index === -1) {
    return res.status(404).json({ message: WISHLIST_ITEM_NOT_FOUND });
  }
  newWishlist.splice(index, 1);

  customer = await customerService.update(customer.id, {
    metadata: { wishlist: newWishlist },
  });

  return res.json({ customer });
};
