import ProductItem from './ProductItem';

interface BookItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

type Props = {
  products: BookItem[];
  onClickItem?: (product: BookItem) => void;
};

const ProductList = ({ products, onClickItem }: Props) => {
  return (
    <div className="grid-4">
      {products.map((product) => (
        <ProductItem key={product.id} product={product} onClick={onClickItem} />
      ))}
    </div>
  );
};

export default ProductList;
