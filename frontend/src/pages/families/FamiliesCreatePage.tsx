import { createFamily } from "@/services/family.api"
import { useNavigate } from "react-router-dom"
import { FamilyForm } from "./FamilyForm"
import type { FamilyFormData } from "@/types/family.form";
import { mapFormToCreateFamilyPayload } from "@/mappers/family.mapper";

const FamiliesCreatePage = () => {
    const navigate = useNavigate();

    const onSubmit = async (data: FamilyFormData) => {
        await createFamily(mapFormToCreateFamilyPayload(data));
        navigate("/dashboard/families");
    };

    return (
        <FamilyForm
            onSubmit={onSubmit}
            submitLabel="Create Family"
        />
    );
};

export default FamiliesCreatePage