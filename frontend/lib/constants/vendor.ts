export const SHOP_CATEGORIES = [
  'Food',
  'Grocery',
  'Electronics',
  'Fashion',
  'Home',
  'Beauty',
  'Health',
  'Other',
] as const

export const PRODUCT_UNITS = ['piece', 'kg', 'litre', 'pack', 'dozen'] as const

export const BULK_CSV_TEMPLATE = `name,description,price,category,stock,unit,sku
Sample Product,Short description,99.00,Food,10,piece,SKU-001
`
