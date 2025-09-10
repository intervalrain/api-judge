// Simple authentication utilities for internal use

export const AUTH_CREDENTIALS = {
  username: process.env.ACCOUNT,
  password: process.env.PASSWORD
}

export const AUTH_SESSION_KEY = 'api-judge-auth'

export function validateCredentials(username: string, password: string): boolean {
  return username === AUTH_CREDENTIALS.username && password === AUTH_CREDENTIALS.password
}

export function createAuthToken(): string {
  // Simple token generation for demo purposes
  const timestamp = Date.now()
  const token = btoa(`${AUTH_CREDENTIALS.username}:${timestamp}`)
  return token
}

export function validateAuthToken(token: string): boolean {
  try {
    const decoded = atob(token)
    const [username, timestampStr] = decoded.split(':')
    const timestamp = parseInt(timestampStr)
    
    // Check if token is for correct user and not too old (24 hours)
    const isValidUser = username === AUTH_CREDENTIALS.username
    const isNotExpired = Date.now() - timestamp < 24 * 60 * 60 * 1000
    
    return isValidUser && isNotExpired
  } catch {
    return false
  }
}

export function setAuthSession(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_SESSION_KEY, token)
  }
}

export function getAuthSession(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_SESSION_KEY)
  }
  return null
}

export function clearAuthSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_SESSION_KEY)
  }
}

export function isAuthenticated(): boolean {
  const token = getAuthSession()
  if (!token) return false
  return validateAuthToken(token)
}