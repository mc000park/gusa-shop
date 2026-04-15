interface BookItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

type Props = {
  product: BookItem;
  onClick?: (product: BookItem) => void;
};

const ProductItem = ({ product, onClick }: Props) => {
  return (
    <div className="product-card" onClick={() => onClick?.(product)}>
      <img
        className="product-card-img"
        src={product.imageUrl}
        alt={product.name}
      />
      <h3>{product.name}</h3>
      <p>{product.price.toLocaleString()}원</p>
      <button>장바구니</button>
    </div>
  );
};

export default ProductItem;
