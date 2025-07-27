import { locationSuggestion } from "@/lib/actions/addLocation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
        return NextResponse.json({ suggestions: [] });
    }
    
    try {
        const suggestions = await locationSuggestion(query);
        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error("Error in location suggestions API:", error);
        return NextResponse.json({ suggestions: [] }, { status: 500 });
    }
}
