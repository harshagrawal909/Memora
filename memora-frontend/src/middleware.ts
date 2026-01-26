import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import path from "path";

export function middleware(request: NextRequest) {
    const token= request.cookies.get("token")?.value;
    const {pathname} = request.nextUrl;

    const isPublicRoute = pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password" || pathname === "/reset-password" || pathname === "/verify";
    if(!token && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    if(token && isPublicRoute){
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard',
        '/login',
        '/signup',
        '/edit/:path*',
        '/',
        '/memories/:path*',
        '/create',
        '/forgot-password',
        '/reset-password',
        '/verify'
    ],
};