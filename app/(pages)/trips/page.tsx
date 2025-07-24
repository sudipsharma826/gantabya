import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Trips(){
    //only accessible if the user is logged in
    const session = await auth();
    if (!session) {
        return (
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
                <p>You must be logged in to view this page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 container mx-auto px-4 py-8">
            <div>
                <Link href={"/trips/create"}>
                    <Button className="cursor-pointer">New Trip</Button>
                </Link>
            </div>
        </div>
    );
}