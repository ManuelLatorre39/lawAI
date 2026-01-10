import { ButtonCustom } from "@/components/ButtonCustom/ButtonCustom"
import { getProducts } from "@/services/product.api";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom"

const ProductsPage = () => {
  const navigate = useNavigate()

  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  if (isLoading) return <div>Loading products...</div>;
  if (isError) return <div>Error loading products</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Products</h1>
      <div className="flex justify-end mb-4">
        <ButtonCustom label={'Create Product'} onClick={() => navigate("/products/create")} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products?.map((product) => (
          <div key={product.id} className="p-6 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="font-semibold mb-2">{product.name}</h3>
            <p className="text-sm text-slate-600">{product.description}</p>
            <button
              onClick={() => navigate(`/products/edit/${product.id}`)}
              className="mt-4 px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800"
            >
              Edit Details
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductsPage