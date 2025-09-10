import React, { useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'

interface SwaggerInputProps {
  onSubmit: (content: string) => void
  loading: boolean
}

const SwaggerInput: React.FC<SwaggerInputProps> = ({ onSubmit, loading }) => {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const text = await file.text()
      setContent(text)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  })

  const handleSubmit = () => {
    if (!content.trim()) {
      alert('請輸入 OpenAPI/Swagger 規格')
      return
    }

    try {
      JSON.parse(content)
      onSubmit(content)
    } catch (error) {
      alert('請輸入有效的 JSON 格式')
    }
  }

  const handleClear = () => {
    setContent('')
  }

  const handlePaste = () => {
    navigator.clipboard.readText().then(text => {
      setContent(text)
    }).catch(() => {
      alert('無法讀取剪貼簿內容，請手動貼上')
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">輸入 OpenAPI/Swagger 規格</h2>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 mb-4 transition-colors cursor-pointer ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive ? '放開檔案以上傳' : '拖放 JSON 檔案到這裡或點擊選擇'}
          </p>
          <p className="text-xs text-gray-500 mt-1">支援 .json 格式檔案</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            或直接輸入/貼上 JSON 內容
          </label>
          <button
            type="button"
            onClick={handlePaste}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={loading}
          >
            從剪貼簿貼上
          </button>
        </div>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-y"
          placeholder={`{
  "openapi": "3.0.0",
  "info": {
    "title": "Your API",
    "version": "1.0.0"
  },
  "paths": {
    "/example": {
      "get": {
        "summary": "Example endpoint"
      }
    }
  }
}`}
          disabled={loading}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '評估中...' : '開始評估'}
        </button>
        <button
          onClick={handleClear}
          disabled={loading}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          清除
        </button>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-xs text-yellow-800">
          ⚠️ 每分鐘只能提交一個 API 規格進行評估
        </p>
        <p className="text-xs text-yellow-700 mt-1">
          💡 使用範例檔案 <code className="bg-yellow-100 px-1 rounded">example-swagger.json</code> 來測試功能
        </p>
      </div>
    </div>
  )
}

export default SwaggerInput