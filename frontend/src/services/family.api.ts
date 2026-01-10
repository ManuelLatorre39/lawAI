import type { CreateFamilyPayload, UpdateFamilyPayload } from "@/types/family.api";
import API from "./APIService";
import type { FamilyDto } from "@/types/family.dto";

export async function getFamilies(): Promise<FamilyDto[]> {
    const response = await API.get("/family");
    return response.data;
}


export async function getFamilyById(id: number): Promise<FamilyDto> {
    const response = await API.get(`/family/${id}`);
    return response.data;
}

export async function createFamily(payload: CreateFamilyPayload) {
    const response = await API.post("/family", payload);

    return response.data;
}

export async function updateFamily(
    id: number,
    payload: UpdateFamilyPayload
) {
    const response = await API.put(`/family/${id}`, payload);
    return response.data;
}