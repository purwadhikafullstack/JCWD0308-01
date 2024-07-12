import { JwtPayload, jwtDecode } from 'jwt-decode';
import { NextRequest, NextResponse } from 'next/server';
import { isTokenExp } from './lib/utils';

export interface CustomJwtPayload extends JwtPayload {
    role?: 'warAdm' | 'superAdm' | 'user';
    id?: string;
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const tokenCookie = req.cookies.get('token');
    const token = tokenCookie ? tokenCookie.value : null;
    const warAdmPath = ['/admins/products', '/admins/stocks', '/admins/transactions', '/admins/overview', '/admins/edit-profile', '/admins/change-password', '/admins/sales'];
    const superAdmPath = [...warAdmPath, '/admins/admins', '/admins/warehouses', '/admins/users'];
    const nextUrl = req.nextUrl.pathname;

    if (!token) {
        if (pathname.startsWith('/admins') || pathname.startsWith('/user')) {
            return NextResponse.redirect(new URL(`/auth?redirect=${nextUrl}`, req.url));
        }
        return NextResponse.next();
    } else {
        const isExp = isTokenExp(token);
        if (isExp) {
            const response = NextResponse.redirect(new URL('/auth', req.url));
            response.cookies.delete('token');
            response.cookies.delete('role');
            return response;
        } else {
            try {
                const decoded: CustomJwtPayload = jwtDecode(token);

                if (pathname.startsWith('/auth')) {
                    if (decoded.role === 'warAdm' || decoded.role === 'superAdm') {
                        return NextResponse.redirect(new URL('/admins/products', req.url));
                    }
                    return NextResponse.redirect(new URL('/', req.url));
                }

                if (warAdmPath.some(path => pathname.startsWith(path))) {
                    if (decoded.role === 'superAdm' || decoded.role === 'warAdm') {
                        return NextResponse.next();
                    }
                    return NextResponse.redirect(new URL('/', req.url));
                } else if (superAdmPath.some(path => pathname.startsWith(path))) {
                    if (decoded.role === 'superAdm') {
                        return NextResponse.next();
                    } else if (decoded.role === 'warAdm') {
                        return NextResponse.redirect(new URL('/admins/products', req.url));
                    }
                    return NextResponse.redirect(new URL('/', req.url));
                } else if (pathname.startsWith('/user')) {
                    if (decoded.role === 'user') {
                        return NextResponse.next();
                    }
                    if (decoded.role === 'warAdm' || decoded.role === 'superAdm') {
                        return NextResponse.redirect(new URL('/admins/products', req.url));
                    }
                    return NextResponse.redirect(new URL('/auth', req.url));
                } else if (pathname === '/') {
                    return NextResponse.next();
                } 
                // else if (pathname.startsWith('/catalog')) {
                //     if (decoded.role === 'warAdm' || decoded.role === 'superAdm') {
                //         return NextResponse.redirect(new URL('/admins/products', req.url));
                //     }
                //     return NextResponse.next();
                // }

                // Default fallback to nextUrl
                return NextResponse.redirect(new URL(nextUrl, req.url));

            } catch (err) {
                const response = NextResponse.redirect(new URL('/auth', req.url));
                response.cookies.delete('token');
                response.cookies.delete('role');
                return response;
            }
        }
    }
}

export const config = {
    matcher: ['/admins/:path*', '/user/:path*', '/auth', '/', '/catalog/:path*'],
};
