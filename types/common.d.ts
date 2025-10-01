type GoodsType = {
  category: string;
  goodsName: string;
  quantity: number;
  brand?: string;
  model?: string;
  id?: string | number;
  barcode?: string;
  cover?: string;
  sales?: number;
  price?: number;
  brandData?: BrandType
};
type BrandType = {
  id?: string
  brandName?: string;
  logo?: string;
  enName?: string;
  code?: string;
  remark?: string;
};
