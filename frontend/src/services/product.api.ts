import type { ProductCreatePayload, ProductUpdatePayload } from "@/types/product/product.api";
import API from "./APIService";
import type { ProductDto } from "@/types/product/product.dto";

export async function getProducts(): Promise<ProductDto[]> {
    const response = await API.get("/product");
    return response.data;
}


export async function getProductById(id: number): Promise<ProductDto> {
    const response = await API.get(`/product/${id}`);
    return response.data;
}

export async function createProduct(payload: ProductCreatePayload) {
    const response = await API.post("/product", payload);

    return response.data;
}

export async function updateProduct(
    id: number,
    payload: ProductUpdatePayload
) {
    const response = await API.put(`/product/${id}`, payload);
    return response.data;
}