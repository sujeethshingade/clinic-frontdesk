import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export interface JwtPayload {
  userId: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function verifyToken(token: string): JwtPayload {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined')
  }
  return jwt.verify(token, JWT_SECRET) as unknown as JwtPayload
}

export function generateToken(payload: JwtPayload): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined')
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}
