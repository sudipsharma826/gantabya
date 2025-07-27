import AddLocationPage from "@/components/addLocation";

export default async function AddLocation({
  params}:{
    params: Promise<{ tripId: string }>;
  }
){

  const {tripId} = await params;
  return (
    <AddLocationPage tripId={tripId} />
  );

}