import type { NextApiRequest, NextApiResponse } from 'next'
import { validateCredentials, createAuthToken } from '../../../utils/auth'

interface LoginRequest {
  username: string
  password: string
}

interface LoginResponse {
  success: boolean
  token?: string
  message?: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  const { username, password }: LoginRequest = req.body

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: '請提供帳號和密碼'
    })
  }

  if (validateCredentials(username, password)) {
    const token = createAuthToken()
    
    // Set HTTP-only cookie for additional security (optional)
    res.setHeader('Set-Cookie', `auth-token=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=86400`)
    
    return res.status(200).json({
      success: true,
      token,
      message: '登入成功'
    })
  } else {
    return res.status(401).json({
      success: false,
      message: '帳號或密碼錯誤'
    })
  }
}