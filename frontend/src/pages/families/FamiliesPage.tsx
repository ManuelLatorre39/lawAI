import { useQuery } from "@tanstack/react-query";
import { ButtonCustom } from "@/components/ButtonCustom/ButtonCustom"
import { getFamilies } from "@/services/family.api";
import { useNavigate } from "react-router-dom"


const FamiliesPage = () => {
  const navigate = useNavigate()

  const {
    data: families,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["families"],
    queryFn: getFamilies,
  });

  if (isLoading) return <div>Loading families...</div>;
  if (isError) return <div>Error loading families</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Families</h1>
      <div className="flex justify-end mb-4">
        <ButtonCustom label={'Create Family'} onClick={() => navigate("/families/create")} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {families?.map((family) => (
          <div key={family.id} className="p-6 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="font-semibold mb-2">{family.name}</h3>
            <p className="text-sm text-slate-600">{family.description}</p>
            <button
              onClick={() => navigate(`/families/edit/${family.id}`)}
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

export default FamiliesPage