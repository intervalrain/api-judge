import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import SwaggerInput from '../components/SwaggerInput'
import EvaluationReport from '../components/EvaluationReport'
import EvaluationPlaceholder from '../components/EvaluationPlaceholder'
import { APIEvaluation } from '../types/evaluation'
import { isAuthenticated, clearAuthSession, getAuthSession } from '../utils/auth'

export default function Home() {
  const [evaluation, setEvaluation] = useState<APIEvaluation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [streamingStatus, setStreamingStatus] = useState<string | null>(null)
  const [streamingText, setStreamingText] = useState<string>('')
  const [partialEvaluation, setPartialEvaluation] = useState<any>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check authentication on page load
    if (!isAuthenticated()) {
      router.push('/login')
    } else {
      setAuthChecked(true)
    }
  }, [router])

  const handleEvaluate = async (swaggerContent: string) => {
    setLoading(true)
    setError(null)
    setEvaluation(null)
    setStreamingStatus(null)
    setStreamingText('')
    setPartialEvaluation({})

    try {
      console.log('Starting streaming evaluation...')
      console.log('Swagger content length:', swaggerContent.length)
      console.log('Swagger content preview:', swaggerContent.substring(0, 200))
      
      const token = getAuthSession()
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ swagger: swaggerContent }),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        // Handle non-streaming error response
        const errorData = await response.json()
        
        // If unauthorized, redirect to login
        if (response.status === 401) {
          clearAuthSession()
          router.push('/login')
          return
        }
        
        throw new Error(errorData.error || `評估失敗 (${response.status})`)
      }

      // Check if response is SSE
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('text/event-stream')) {
        throw new Error('伺服器未回傳串流格式')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('無法讀取串流回應')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          console.log('Stream complete')
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        
        // Process complete SSE messages
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || '' // Keep incomplete message
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              console.log('SSE message:', data)
              
              switch (data.type) {
                case 'status':
                  setStreamingStatus(data.message)
                  break
                  
                case 'chunk':
                  setStreamingText(prev => {
                    const newText = prev + data.text
                    
                    // Try to extract partial JSON data for progressive updates
                    try {
                      const partialMatch = newText.match(/\{[\s\S]*/)
                      if (partialMatch) {
                        const partial = partialMatch[0]
                        
                        const partialData: any = {
                          categories: {}
                        }
                        
                        // Extract overall score
                        const scoreMatch = partial.match(/"overall_score":\s*(\d+)/)
                        if (scoreMatch) {
                          partialData.overall_score = parseInt(scoreMatch[1])
                          console.log('🎯 Overall score detected:', partialData.overall_score)
                        }
                        
                        // Extract summary if complete
                        const summaryMatch = partial.match(/"summary":\s*"([^"]*)"/)
                        if (summaryMatch) {
                          partialData.summary = summaryMatch[1]
                          console.log('📝 Summary detected:', partialData.summary.substring(0, 50))
                        }
                        
                        // Extract category information more comprehensively
                        const categoryNames = ['resource_design', 'http_methods', 'status_codes', 'naming_conventions', 'request_response', 'versioning', 'documentation']
                        
                        categoryNames.forEach(categoryName => {
                          // Look for complete category blocks
                          const categoryPattern = new RegExp(`"${categoryName}":\\s*\\{([^}]*(?:\\{[^}]*\\}[^}]*)*)\\}`, 'g')
                          const categoryMatch = categoryPattern.exec(partial)
                          
                          if (categoryMatch) {
                            const categoryContent = categoryMatch[1]
                            const category: any = {}
                            
                            // Extract score
                            const scoreMatch = categoryContent.match(/"score":\s*(\d+)/)
                            if (scoreMatch) {
                              category.score = parseInt(scoreMatch[1])
                              console.log(`🏆 ${categoryName} score:`, category.score)
                            }
                            
                            // Extract issues array
                            const issuesMatch = categoryContent.match(/"issues":\s*\[([^\]]*)\]/)
                            if (issuesMatch) {
                              try {
                                category.issues = JSON.parse(`[${issuesMatch[1]}]`)
                                console.log(`⚠️ ${categoryName} issues:`, category.issues.length)
                              } catch {}
                            }
                            
                            // Extract suggestions array
                            const suggestionsMatch = categoryContent.match(/"suggestions":\s*\[([^\]]*)\]/)
                            if (suggestionsMatch) {
                              try {
                                category.suggestions = JSON.parse(`[${suggestionsMatch[1]}]`)
                                console.log(`💡 ${categoryName} suggestions:`, category.suggestions.length)
                              } catch {}
                            }
                            
                            partialData.categories[categoryName] = category
                          }
                        })
                        
                        // Extract critical issues
                        const criticalIssuesMatch = partial.match(/"critical_issues":\s*\[([^\]]*)\]/)
                        if (criticalIssuesMatch) {
                          try {
                            partialData.critical_issues = JSON.parse(`[${criticalIssuesMatch[1]}]`)
                            console.log('🚨 Critical issues detected:', partialData.critical_issues.length)
                          } catch {}
                        }
                        
                        // Extract best practices
                        const practicesMatch = partial.match(/"best_practices_followed":\s*\[([^\]]*)\]/)
                        if (practicesMatch) {
                          try {
                            partialData.best_practices_followed = JSON.parse(`[${practicesMatch[1]}]`)
                            console.log('✅ Best practices detected:', partialData.best_practices_followed.length)
                          } catch {}
                        }
                        
                        // Only update if we have meaningful data
                        if (Object.keys(partialData.categories).length > 0 || partialData.overall_score || partialData.summary) {
                          setPartialEvaluation(partialData)
                        }
                      }
                    } catch (parseError) {
                      // Ignore parsing errors, just continue streaming
                      console.log('Parsing error (normal during streaming):', parseError)
                    }
                    
                    return newText
                  })
                  break
                  
                case 'complete':
                  console.log('Evaluation complete:', data.evaluation)
                  setEvaluation(data.evaluation)
                  setStreamingStatus(null)
                  setStreamingText('')
                  setPartialEvaluation(null)
                  break
                  
                case 'error':
                  throw new Error(data.message || '評估過程發生錯誤')
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError, line)
            }
          }
        }
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '發生未知錯誤'
      console.error('Streaming evaluation error details:')
      console.error('Error type:', err?.constructor?.name)
      console.error('Error message:', errorMessage)
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace')
      console.error('Full error object:', err)
      
      setError(errorMessage)
      setStreamingStatus(null)
      setStreamingText('')
      setPartialEvaluation(null)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setEvaluation(null)
    setError(null)
    setStreamingStatus(null)
    setStreamingText('')
    setPartialEvaluation(null)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuthSession()
      router.push('/login')
    }
  }

  // Show loading while checking authentication
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚖️</div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>API Judge - RESTful API Design Checker</title>
        <meta name="description" content="使用 Gemini AI 評估 OpenAPI/Swagger 規格是否符合 RESTful 設計標準" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="text-2xl mr-2">⚖️</span>
                  API Judge
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  RESTful API Design Checker powered by Gemini AI
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Advantech WiseIoT Internal Tool
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {evaluation && (
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    新評估
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                >
                  登出
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <SwaggerInput onSubmit={handleEvaluate} loading={loading} />
              
              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-sm font-medium text-red-800">評估失敗</h3>
                  </div>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              )}
            </div>
            
            {/* Report Section */}
            <div>
              {/* Evaluation Placeholder - Shows immediately when evaluation starts */}
              {partialEvaluation && (
                <div className="animate-fadeIn">
                  <EvaluationPlaceholder 
                    evaluation={partialEvaluation} 
                    streamingText={streamingText}
                  />
                </div>
              )}
              
              {/* Final Evaluation Report */}
              {evaluation && !loading && (
                <div className="animate-fadeIn">
                  <EvaluationReport evaluation={evaluation} />
                </div>
              )}
              
              {/* Welcome State */}
              {!evaluation && !loading && !error && !partialEvaluation && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 text-center h-64 flex flex-col justify-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">準備開始評估</h3>
                  <p className="text-gray-600 text-sm">
                    請在左側輸入您的 OpenAPI/Swagger 規格<br />
                    AI 會分析並提供詳細的改進建議
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-sm text-gray-500">
              <p>
                Powered by{' '}
                <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  Google Gemini AI
                </a>
                {' '} | Built with ❤️ for better API design | No more subjective judgement
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}