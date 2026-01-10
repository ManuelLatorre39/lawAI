import { mapFormToCreateProductPayload } from "@/mappers/product.mapper";
import type { ProductFormData } from "@/types/product/product.form";
import { useNavigate } from "react-router-dom";
import { ProductForm } from "./ProductForm";
import { createProduct } from "@/services/product.api";

const CreateProductPage = () => {
  const navigate = useNavigate();

  const onSubmit = async (data: ProductFormData) => {
    await createProduct(mapFormToCreateProductPayload(data));
    navigate('/products');
  };

  return (
    <ProductForm onSubmit={onSubmit} />
  );
};

export default CreateProductPage;