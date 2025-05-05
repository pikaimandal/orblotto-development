import { NextRequest, NextResponse } from 'next/server'
import { MiniAppWalletAuthSuccessPayload, verifySiweMessage } from '@worldcoin/minikit-js'

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload
  nonce: string
}

export async function POST(req: NextRequest) {
  const { payload, nonce } = await req.json() as IRequestPayload
  
  // Get the stored nonce from request cookies
  const storedNonce = req.cookies.get('siwe')?.value
  
  if (nonce !== storedNonce) {
    return NextResponse.json({
      status: 'error',
      isValid: false,
      message: 'Invalid nonce',
    })
  }
  
  try {
    const validMessage = await verifySiweMessage(payload, nonce)
    
    // Create response with success data
    const response = NextResponse.json({
      status: 'success',
      isValid: validMessage.isValid,
      address: payload.address,
    })
    
    // Clear the nonce cookie
    response.cookies.delete('siwe')
    
    return response
  } catch (error: any) {
    // Handle errors in validation or processing
    return NextResponse.json({
      status: 'error',
      isValid: false,
      message: error.message,
    })
  }
} 