import { useState } from 'react';
import { ProductsPage } from './pages/ProductsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import type { Product } from './types/product';

function App() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (selectedProduct) {
    return (
      <CheckoutPage
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
      />
    );
  }

  return <ProductsPage onBuy={setSelectedProduct} />;
}

export default App;
