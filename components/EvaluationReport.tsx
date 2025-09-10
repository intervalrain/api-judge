import React, { useState } from 'react'
import { APIEvaluation } from '../types/evaluation'
import { downloadMarkdownReport } from '../utils/markdownReportGenerator'

interface EvaluationReportProps {
  evaluation: APIEvaluation
}

const EvaluationReport: React.FC<EvaluationReportProps> = ({ evaluation }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-200'
    if (score >= 60) return 'bg-yellow-100 border-yellow-200'
    return 'bg-red-100 border-red-200'
  }

  const getProgressBarColor = (score: number) => {
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

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategory(expandedCategory === categoryKey ? null : categoryKey)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">評估報告</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => downloadMarkdownReport(evaluation)}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            匯出 Markdown
          </button>
          <button
            onClick={() => window.print()}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            列印報告
          </button>
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
            <div className={`text-3xl font-bold ${getScoreColor(evaluation.overall_score)}`}>
              {evaluation.overall_score}
            </div>
            <div className="text-sm text-gray-600">/ 100</div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-md font-semibold mb-2 flex items-center">
          📋 評估摘要
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">{evaluation.summary}</p>
      </div>

      {/* Critical Issues */}
      {evaluation.critical_issues.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-md font-semibold text-red-800 mb-3 flex items-center">
            🚨 關鍵問題
          </h3>
          <ul className="space-y-2">
            {evaluation.critical_issues.map((issue, index) => (
              <li key={index} className="flex items-start text-sm text-red-700">
                <span className="text-red-500 mr-2 mt-0.5">•</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Best Practices */}
      {evaluation.best_practices_followed.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-md font-semibold text-green-800 mb-3 flex items-center">
            ✅ 遵循的最佳實踐
          </h3>
          <ul className="space-y-2">
            {evaluation.best_practices_followed.map((practice, index) => (
              <li key={index} className="flex items-start text-sm text-green-700">
                <span className="text-green-500 mr-2 mt-0.5">•</span>
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Category Scores */}
      <div className="space-y-3">
        <h3 className="text-md font-semibold mb-4">📈 分類評分詳細</h3>
        
        {Object.entries(evaluation.categories).map(([key, category]) => {
          const isExpanded = expandedCategory === key
          
          return (
            <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(key)}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{categoryIcons[key]}</span>
                    <h4 className="font-medium">{categoryNames[key] || key}</h4>
                  </div>
                  <div className="flex items-center">
                    <span className={`font-bold mr-3 ${getScoreColor(category.score)}`}>
                      {category.score}/100
                    </span>
                    <svg
                      className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(category.score)}`}
                    style={{ width: `${category.score}%` }}
                  ></div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                  {category.issues.length > 0 && (
                    <div className="mb-3 mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        ⚠️ 發現的問題：
                      </p>
                      <ul className="space-y-1">
                        {category.issues.map((issue, index) => (
                          <li key={index} className="flex items-start text-xs text-gray-600">
                            <span className="text-orange-500 mr-2 mt-1">•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {category.suggestions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        💡 改進建議：
                      </p>
                      <ul className="space-y-1">
                        {category.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start text-xs text-blue-600">
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
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>Generated by API Judge powered by Gemini AI</p>
        <p>評估時間: {new Date().toLocaleString('zh-TW')}</p>
      </div>
    </div>
  )
}

export default EvaluationReport