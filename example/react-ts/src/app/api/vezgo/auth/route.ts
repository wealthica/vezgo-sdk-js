import { NextRequest, NextResponse } from "next/server";
import Vezgo from "vezgo-sdk-js";

const vezgo = Vezgo.init({
  clientId: process.env.VEZGO_CLIENT_ID || "",
  secret: process.env.VEZGO_CLIENT_SECRET,
  baseURL: process.env.VEZGO_API_URL || "https://api.vezgo.com/v1",
});

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("Authorization");
    const userId = authorization?.replace("Bearer ", "");

    const user = vezgo.login(userId);
    const token = await user.getToken();

    return NextResponse.json({ token, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
