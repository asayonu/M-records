import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth/token";

export async function GET(request: Request) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("session", "invalid");
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(COOKIE_NAME);
  return response;
}
