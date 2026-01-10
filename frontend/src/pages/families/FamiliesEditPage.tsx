import { useNavigate, useParams } from "react-router-dom"
import { FamilyForm } from "./FamilyForm"
import { useQuery } from "@tanstack/react-query";
import { mapFamilyDtoToFormData, mapFormToUpdateFamilyPayload } from "@/mappers/family.mapper";
import { getFamilyById, updateFamily } from "@/services/family.api";

const FamiliesEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ["family", id],
        queryFn: () => getFamilyById(Number(id)),
        enabled: !!id,
    });

    if (isLoading) return <div>Loading...</div>;
    if (!data) return <div>Family not found</div>;

    return (
        <FamilyForm
            defaultValues={mapFamilyDtoToFormData(data)}
            submitLabel="Update Family"
            onSubmit={async (formData) => {
                await updateFamily(Number(id), mapFormToUpdateFamilyPayload(formData));
                navigate("/families");
            }}
        />
    );
};

export default FamiliesEditPage;