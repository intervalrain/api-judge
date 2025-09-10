import type { NextApiRequest, NextApiResponse } from 'next'

interface LogoutResponse {
  success: boolean
  message: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<LogoutResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  // Clear the HTTP-only cookie
  res.setHeader('Set-Cookie', 'auth-token=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0')

  return res.status(200).json({
    success: true,
    message: '登出成功'
  })
}