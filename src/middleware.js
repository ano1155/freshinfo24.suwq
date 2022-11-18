import { NextResponse, NextRequest } from "next/server";
import { HOST } from "../config";

export function middleware(request) {
  const url = request.nextUrl.clone();
  const referer = request.headers.get('referer');
  const userAgent = request.headers.get('user-agent');
  
  if (
    referer && referer.match(/^https?:\/\/([^\/]+\.)?facebook\.com(\/|$)/i) &&
    !userAgent.includes('facebookexternalhit')
    ) {
    const redirectUrl = HOST + url.pathname;
    return NextResponse.redirect(redirectUrl);
  }
}
