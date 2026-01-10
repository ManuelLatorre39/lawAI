import { useNavigate, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query";
import { getProductById, updateProduct } from "@/services/product.api";
import { ProductForm } from "./ProductForm";
import { mapFormToUpdateProductPayload } from "@/mappers/product.mapper";
import { mapProductDtoToFormData } from "@/mappers/family.mapper";

const EditProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ["product", id],
        queryFn: () => getProductById(Number(id)),
        enabled: !!id,
    });

    if (isLoading) return <div>Loading...</div>;
    if (!data) return <div>Product not found</div>;

    return (
        <ProductForm
            defaultValues={mapProductDtoToFormData(data)}
            submitLabel="Update Product"
            onSubmit={async (formData) => {
                await updateProduct(Number(id), mapFormToUpdateProductPayload(formData));
                navigate("/products");
            }}
        />
    );
};

export default EditProductPage;