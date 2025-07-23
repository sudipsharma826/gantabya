import Loading from "@/components/loading";

export default function Page() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loading size="lg" variant="glow" text="Loading..." showText={true} />
    </div>
    
  );
}