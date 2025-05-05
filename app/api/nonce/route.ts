import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET() {
  // Generate a random nonce
  const nonce = crypto.randomBytes(16).toString('hex')
  
  // Create response with nonce
  const response = NextResponse.json({ nonce })
  
  // Set cookie using response headers
  response.cookies.set({
    name: 'siwe',
    value: nonce,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
  })
  
  return response
} 