import { NextRequest, NextResponse } from 'next/server'
import { AuthUtils, JwtPayload } from '@/lib/auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: JwtPayload
}

export function withAuth(handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context?: any) => {
    try {
      const authHeader = req.headers.get('authorization')
      const token = AuthUtils.extractTokenFromHeader(authHeader || '')

      if (!token) {
        return NextResponse.json(
          { error: 'No token provided' },
          { status: 401 }
        )
      }

      const payload = AuthUtils.verifyToken(token)
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = payload

      return handler(authenticatedReq, context)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
  }
}

export function withRole(roles: string[]) {
  return function(handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) {
    return withAuth(async (req: AuthenticatedRequest, context?: any) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
      return handler(req, context)
    })
  }
}
