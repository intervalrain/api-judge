import React from 'react'

interface PartialEvaluation {
  overall_score?: number
  summary?: string
  critical_issues?: string[]
  best_practices_followed?: string[]
  categories?: Record<string, {
    score?: number
    issues?: string[]
    suggestions?: string[]
  }>
}

interface EvaluationPlaceholderProps {
  evaluation?: PartialEvaluation
  streamingText?: string
}

const EvaluationPlaceholder: React.FC<EvaluationPlaceholderProps> = ({ 
  evaluation = {}, 
  streamingText = '' 
}) => {
  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score?: number) => {
    if (!score) return 'bg-gray-50 border-gray-200'
    if (score >= 80) return 'bg-green-100 border-green-200'
    if (score >= 60) return 'bg-yellow-100 border-yellow-200'
    return 'bg-red-100 border-red-200'
  }

  const getProgressBarColor = (score?: number) => {
    if (!score) return 'bg-gray-300'
    if (score >= 80) return 'bg-green-600'
    if (score >= 60) return 'bg-yellow-600'
    return 'bg-red-600'
  }

  const categoryNames: Record<string, string> = {
    resource_design: '資源設計',
    http_methods: 'HTTP 方法',
    status_codes: '狀態碼',
    naming_conventions: '命名規範',
    request_response: '請求/回應',
    versioning: '版本控制',
    documentation: '文件完整性',
  }

  const categoryIcons: Record<string, string> = {
    resource_design: '🏗️',
    http_methods: '🔧',
    status_codes: '📊',
    naming_conventions: '📝',
    request_response: '🔄',
    versioning: '📋',
    documentation: '📚',
  }

  const allCategories = Object.keys(categoryNames)

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">評估報告</h2>
        <div className="text-sm text-gray-400">
          🤖 AI 正在生成中...
        </div>
      </div>
      
      {/* Overall Score */}
      <div className={`mb-6 p-4 rounded-lg border ${getScoreBgColor(evaluation.overall_score)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">總體評分</h3>
            <p className="text-sm opacity-75 mt-1">整體 RESTful API 設計品質</p>
          </div>
          <div className="text-right">
            {evaluation.overall_score !== undefined ? (
              <div className={`text-3xl font-bold ${getScoreColor(evaluation.overall_score)} animate-fadeIn`}>
                {evaluation.overall_score}
              </div>
            ) : (
              <div className="text-3xl font-bold text-gray-300">
                <span className="animate-pulse">--</span>
              </div>
            )}
            <div className="text-sm text-gray-600">/ 100</div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-md font-semibold mb-2 flex items-center">
          📋 評估摘要
        </h3>
        {evaluation.summary ? (
          <p className="text-sm text-gray-700 leading-relaxed">{evaluation.summary}</p>
        ) : (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        )}
      </div>

      {/* Critical Issues */}
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-md font-semibold text-red-800 mb-3 flex items-center">
          🚨 關鍵問題
        </h3>
        {evaluation.critical_issues && evaluation.critical_issues.length > 0 ? (
          <ul className="space-y-2">
            {evaluation.critical_issues.map((issue, index) => (
              <li key={index} className="flex items-start text-sm text-red-700">
                <span className="text-red-500 mr-2 mt-0.5">•</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-2">
            <div className="h-3 bg-red-100 rounded animate-pulse"></div>
            <div className="h-3 bg-red-100 rounded animate-pulse w-4/5"></div>
          </div>
        )}
      </div>

      {/* Best Practices */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-md font-semibold text-green-800 mb-3 flex items-center">
          ✅ 遵循的最佳實踐
        </h3>
        {evaluation.best_practices_followed && evaluation.best_practices_followed.length > 0 ? (
          <ul className="space-y-2">
            {evaluation.best_practices_followed.map((practice, index) => (
              <li key={index} className="flex items-start text-sm text-green-700">
                <span className="text-green-500 mr-2 mt-0.5">•</span>
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-2">
            <div className="h-3 bg-green-100 rounded animate-pulse"></div>
            <div className="h-3 bg-green-100 rounded animate-pulse w-3/4"></div>
          </div>
        )}
      </div>

      {/* Category Scores */}
      <div className="space-y-3">
        <h3 className="text-md font-semibold mb-4">📈 分類評分詳細</h3>
        
        {allCategories.map((key) => {
          const category = evaluation.categories?.[key]
          const score = category?.score
          
          return (
            <div key={key} className="border border-gray-200 rounded-lg">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{categoryIcons[key]}</span>
                    <h4 className="font-medium">{categoryNames[key]}</h4>
                  </div>
                  <div className="flex items-center">
                    {score !== undefined ? (
                      <span className={`font-bold mr-3 ${getScoreColor(score)} animate-fadeIn`}>
                        {score}/100
                      </span>
                    ) : (
                      <span className="font-bold mr-3 text-gray-300">
                        <span className="animate-pulse">--/100</span>
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ease-out ${getProgressBarColor(score)} ${score ? 'animate-slideIn' : ''}`}
                    style={{ width: score ? `${score}%` : '0%' }}
                  ></div>
                </div>
                
                {/* Category details */}
                {category && (category.issues || category.suggestions) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {category.issues && category.issues.length > 0 && (
                      <div className="mb-3 animate-fadeIn">
                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          ⚠️ 發現的問題：
                        </p>
                        <ul className="space-y-1">
                          {category.issues.map((issue, index) => (
                            <li key={index} className="flex items-start text-xs text-gray-600 animate-slideInLeft" style={{ animationDelay: `${index * 100}ms` }}>
                              <span className="text-orange-500 mr-2 mt-1">•</span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {category.suggestions && category.suggestions.length > 0 && (
                      <div className="animate-fadeIn">
                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          💡 改進建議：
                        </p>
                        <ul className="space-y-1">
                          {category.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start text-xs text-blue-600 animate-slideInLeft" style={{ animationDelay: `${index * 100}ms` }}>
                              <span className="text-blue-500 mr-2 mt-1">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Streaming Text Preview */}
      {streamingText && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
            🤖 AI 即時回應預覽
          </h3>
          <div className="text-xs text-blue-700 whitespace-pre-wrap font-mono max-h-32 overflow-y-auto">
            {streamingText}
            <span className="animate-pulse">|</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>Generated by API Judge powered by Gemini AI</p>
        <p>評估時間: {new Date().toLocaleString('zh-TW')}</p>
      </div>
    </div>
  )
}

export default EvaluationPlaceholder