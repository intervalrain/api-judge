import { GoogleGenerativeAI } from "@google/generative-ai"
import type { NextApiRequest, NextApiResponse } from "next"
import { readFileSync } from "fs"
import { join } from "path"

// 讀取 context.md 檔案
const contextContent = readFileSync(
  join(process.cwd(), 'context.md'),
  'utf-8'
)

interface APIEvaluation {
  overall_score: number
  categories: {
    resource_design: {
      score: number
      issues: string[]
      suggestions: string[]
    }
    http_methods: {
      score: number
      issues: string[]
      suggestions: string[]
    }
    status_codes: {
      score: number
      issues: string[]
      suggestions: string[]
    }
    naming_conventions: {
      score: number
      issues: string[]
      suggestions: string[]
    }
    request_response: {
      score: number
      issues: string[]
      suggestions: string[]
    }
    versioning: {
      score: number
      issues: string[]
      suggestions: string[]
    }
    documentation: {
      score: number
      issues: string[]
      suggestions: string[]
    }
  }
  summary: string
  critical_issues: string[]
  best_practices_followed: string[]
}

const rateLimitMap = new Map<string, number>()

// Clean text for JSON safety
function cleanJsonText(text: string): string {
  return text
    .replace(/"/g, '') // Remove quotes
    .replace(/\\/g, '') // Remove backslashes  
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .replace(/\r/g, ' ') // Replace carriage returns
    .replace(/\t/g, ' ') // Replace tabs
    .replace(/[^\w\s.,!?-]/g, '') // Keep only safe characters
    .trim()
    .substring(0, 50) // Limit length
}

// Clean evaluation object
function cleanEvaluation(evaluation: APIEvaluation): APIEvaluation {
  const cleaned = { ...evaluation }
  
  // Clean summary
  cleaned.summary = cleanJsonText(evaluation.summary || '')
  
  // Clean arrays
  cleaned.critical_issues = (evaluation.critical_issues || []).map(item => cleanJsonText(item)).slice(0, 3)
  cleaned.best_practices_followed = (evaluation.best_practices_followed || []).map(item => cleanJsonText(item)).slice(0, 3)
  
  // Clean categories
  Object.keys(cleaned.categories || {}).forEach(key => {
    const category = cleaned.categories[key]
    if (category) {
      category.issues = (category.issues || []).map(item => cleanJsonText(item)).slice(0, 2)
      category.suggestions = (category.suggestions || []).map(item => cleanJsonText(item)).slice(0, 2)
    }
  })
  
  return cleaned
}

// Fallback function to create a basic evaluation from partial AI response
function createFallbackEvaluation(response: string): APIEvaluation | null {
  console.log("Creating fallback evaluation from response...")
  
  try {
    // Extract any numbers that might be scores
    const scoreMatches = response.match(/(\d+)/g)
    const scores = scoreMatches ? scoreMatches.map(s => parseInt(s)).filter(n => n >= 0 && n <= 100) : []
    
    // Use first valid score as overall, or default to 50
    const overallScore = scores.length > 0 ? scores[0] : 50
    
    // Create basic categories with extracted scores or defaults
    const categoryNames = ['resource_design', 'http_methods', 'status_codes', 'naming_conventions', 'request_response', 'versioning', 'documentation']
    const categories: any = {}
    
    categoryNames.forEach((name, index) => {
      categories[name] = {
        score: scores[index + 1] || overallScore || 50,
        issues: [`從部分回應中無法完整解析 ${name} 的詳細問題`],
        suggestions: [`建議重新進行評估以獲得 ${name} 的詳細建議`]
      }
    })
    
    // Try to extract any readable text for summary
    let summary = "由於 AI 回應格式問題，僅能提供部分評估結果。"
    const summaryMatch = response.match(/"summary":\s*"([^"]*)/i)
    if (summaryMatch && summaryMatch[1]) {
      summary = summaryMatch[1].substring(0, 200) + "..."
    }
    
    return {
      overall_score: overallScore,
      categories,
      summary,
      critical_issues: ["AI 回應格式錯誤，評估可能不完整"],
      best_practices_followed: ["需要重新評估以獲得準確結果"]
    }
  } catch (error) {
    console.error("Failed to create fallback evaluation:", error)
    return null
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  // Simple rate limiting (commented out for development)
  const clientIp = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown"
  const now = Date.now()
  const lastRequest = rateLimitMap.get(clientIp as string) || 0
  
  // Uncomment for production
  // if (now - lastRequest < 60000) {
  //   return res.status(429).json({ error: "每分鐘只能提交一個 API 規格進行評估" })
  // }
  
  rateLimitMap.set(clientIp as string, now)

  try {
    const { swagger } = req.body

    if (!swagger) {
      return res.status(400).json({ error: "請提供 OpenAPI/Swagger 規格" })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: "API Key 未設定" })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    
    const swaggerString = typeof swagger === "string" ? swagger : JSON.stringify(swagger, null, 2)

    const systemPrompt = `You are an expert API design reviewer. 

Context and Standards to follow:
${contextContent}

CRITICAL INSTRUCTIONS:
1. Your response MUST be ONLY a valid JSON object - NO other text
2. Do NOT use markdown code blocks (no \`\`\`json or \`\`\`)
3. Do NOT add any explanations before or after the JSON
4. Follow EXACTLY the JSON format shown in the context above
5. ALL text strings MUST be SHORT - maximum 50 characters each
6. Use SIMPLE words only - no quotes, no special characters
7. Each category MUST have: score (integer 0-100), issues (array), suggestions (array)
8. Arrays: maximum 2-3 items, each under 50 characters
9. Summary: maximum 80 characters, simple sentence
10. NO complex punctuation, NO newlines, NO escaped characters`

    const prompt = `${systemPrompt}

Here is the API specification to review:

${swaggerString}

RESPOND WITH ONLY THE VALID JSON OBJECT. USE SHORT SIMPLE TEXT ONLY. NO QUOTES IN TEXT VALUES. NO SPECIAL CHARACTERS. COPY THE EXACT FORMAT FROM CONTEXT EXAMPLE. START WITH { AND END WITH }.`

    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control')

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" })
    
    // Send initial status
    res.write(`data: ${JSON.stringify({ type: 'status', message: '正在連接 Gemini AI...' })}\n\n`)
    
    const streamResult = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.05, // Very low temperature for maximum consistency
        maxOutputTokens: 4096,
        topP: 0.9,
        topK: 40,
        responseMimeType: "application/json", // Enforce JSON output
      },
    })

    res.write(`data: ${JSON.stringify({ type: 'status', message: '開始接收 AI 回應...' })}\n\n`)
    
    let fullResponse = ''
    
    for await (const chunk of streamResult.stream) {
      const chunkText = chunk.text()
      if (chunkText) {
        fullResponse += chunkText
        
        // Send streaming chunk to client
        res.write(`data: ${JSON.stringify({ 
          type: 'chunk', 
          text: chunkText,
          accumulated: fullResponse.length 
        })}\n\n`)
        
        console.log("Streaming chunk:", chunkText.substring(0, 100))
      }
    }
    
    console.log("Full response received, length:", fullResponse.length)
    console.log("Full response (first 500 chars):", fullResponse.substring(0, 500))
    console.log("Full response (last 500 chars):", fullResponse.substring(Math.max(0, fullResponse.length - 500)))
    
    res.write(`data: ${JSON.stringify({ type: 'status', message: '正在解析評估結果...' })}\n\n`)
    
    // Extract JSON from response - AI should respond with pure JSON
    let jsonString = fullResponse.trim()
    
    // If AI still wrapped in code blocks despite instructions, extract it
    const codeBlockMatch = fullResponse.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1].trim()
      console.log("Found JSON in code block (ignoring AI instruction)")
    }
    
    // Find the main JSON object if there's extra text
    const jsonObjectMatch = jsonString.match(/\{[\s\S]*\}/)
    if (jsonObjectMatch) {
      jsonString = jsonObjectMatch[0]
      console.log("Extracted JSON object from response")
    } else {
      console.error("Failed to extract JSON from response:", fullResponse)
      res.write(`data: ${JSON.stringify({ type: 'error', message: '無法從回應中提取 JSON' })}\n\n`)
      res.end()
      return
    }
    
    // Validate JSON completeness before parsing
    const openBraces = (jsonString.match(/\{/g) || []).length
    const closeBraces = (jsonString.match(/\}/g) || []).length
    const openBrackets = (jsonString.match(/\[/g) || []).length
    const closeBrackets = (jsonString.match(/\]/g) || []).length
    
    if (openBraces !== closeBraces || openBrackets !== closeBrackets) {
      console.warn(`JSON structure incomplete - braces: ${openBraces}/${closeBraces}, brackets: ${openBrackets}/${closeBrackets}`)
      console.log("Attempting to fix incomplete JSON...")
      
      // Try to fix common incomplete JSON issues
      let fixedJsonString = jsonString.trim()
      
      // Add missing closing braces
      while (openBraces > closeBraces && closeBraces < 10) { // Safety limit
        fixedJsonString += '}'
        console.log(`Added closing brace. Now: ${(fixedJsonString.match(/\}/g) || []).length} closing braces`)
        break // Only add one at a time to avoid infinite loop
      }
      
      // Add missing closing brackets for arrays
      while (openBrackets > closeBrackets && closeBrackets < 10) { // Safety limit
        fixedJsonString += ']'
        console.log(`Added closing bracket. Now: ${(fixedJsonString.match(/\]/g) || []).length} closing brackets`)
        break // Only add one at a time
      }
      
      jsonString = fixedJsonString
    }
    
    console.log("Final JSON string length:", jsonString.length)
    console.log("Final JSON string (first 200 chars):", jsonString.substring(0, 200))
    console.log("Final JSON string (last 200 chars):", jsonString.substring(Math.max(0, jsonString.length - 200)))
    
    let evaluation: APIEvaluation
    try {
      evaluation = JSON.parse(jsonString) as APIEvaluation
      evaluation = cleanEvaluation(evaluation) // Clean all text content
      console.log("Successfully parsed and cleaned JSON!")
    } catch (parseError) {
      console.error("JSON parsing failed:")
      console.error("Parse error:", parseError)
      console.error("JSON string that failed to parse:", jsonString)
      
      // Try additional fixes for common JSON issues
      let repairedJson = jsonString
      
      // Handle different types of JSON parsing errors
      if (parseError instanceof Error && (
        parseError.message.includes('Unterminated string') || 
        parseError.message.includes('Expected') ||
        parseError.message.includes('Unexpected token') ||
        parseError.message.includes('after property value')
      )) {
        console.log(`Attempting to fix JSON parsing error: ${parseError.message}`)
        
        // Find position mentioned in error
        const positionMatch = parseError.message.match(/at position (\d+)/)
        if (positionMatch) {
          const position = parseInt(positionMatch[1])
          console.log(`Error at position: ${position}`)
          console.log(`Context: "${jsonString.substring(Math.max(0, position - 50), position + 50)}"`)
          
          // Strategy 1: Try to find a safe truncation point
          // Look backwards for a safe place to truncate (complete key-value pair)
          let depth = 0
          let inString = false
          let lastSafePos = -1
          
          for (let i = position - 1; i >= 0; i--) {
            const char = jsonString[i]
            const prevChar = i > 0 ? jsonString[i - 1] : ''
            
            // Track string state
            if (char === '"' && prevChar !== '\\') {
              inString = !inString
            }
            
            if (!inString) {
              // Track nesting depth
              if (char === '}' || char === ']') depth++
              if (char === '{' || char === '[') depth--
              
              // Found a safe truncation point
              if (depth === 0 && (char === ',' || char === '{' || char === '[')) {
                lastSafePos = char === ',' ? i : i + 1
                break
              }
            }
          }
          
          if (lastSafePos !== -1) {
            console.log(`Found safe truncation at position: ${lastSafePos}`)
            repairedJson = jsonString.substring(0, lastSafePos)
            
            // Remove trailing comma if present
            repairedJson = repairedJson.replace(/,\s*$/, '')
            
            // Add missing closing characters
            const openBraces = (repairedJson.match(/\{/g) || []).length
            const closeBraces = (repairedJson.match(/\}/g) || []).length
            const openBrackets = (repairedJson.match(/\[/g) || []).length
            const closeBrackets = (repairedJson.match(/\]/g) || []).length
            
            for (let i = closeBrackets; i < openBrackets; i++) {
              repairedJson += ']'
            }
            for (let i = closeBraces; i < openBraces; i++) {
              repairedJson += '}'
            }
            
            console.log("Repaired JSON (last 200 chars):", repairedJson.substring(Math.max(0, repairedJson.length - 200)))
          } else {
            console.log("Could not find safe truncation point, using original strategy")
            
            // Fallback to original strategy - find last complete structure
            let truncatePos = Math.max(0, position - 100) // Go back a bit from error position
            
            // Find last complete field or structure
            for (let i = truncatePos; i >= 0; i--) {
              if (jsonString[i] === ',' || jsonString[i] === '{') {
                truncatePos = jsonString[i] === ',' ? i : i + 1
                break
              }
            }
            
            repairedJson = jsonString.substring(0, truncatePos)
            
            // Add missing closing characters
            const openBraces = (repairedJson.match(/\{/g) || []).length
            const closeBraces = (repairedJson.match(/\}/g) || []).length
            const openBrackets = (repairedJson.match(/\[/g) || []).length
            const closeBrackets = (repairedJson.match(/\]/g) || []).length
            
            for (let i = closeBrackets; i < openBrackets; i++) {
              repairedJson += ']'
            }
            for (let i = closeBraces; i < openBraces; i++) {
              repairedJson += '}'
            }
          }
        }
        
        // Try parsing the repaired JSON
        try {
          evaluation = JSON.parse(repairedJson) as APIEvaluation
          evaluation = cleanEvaluation(evaluation) // Clean the parsed result
          console.log("Successfully parsed and cleaned repaired JSON!")
        } catch (secondError) {
          console.error("Repaired JSON also failed to parse:", secondError)
          console.log("Attempting fallback partial data extraction...")
          
          // Fallback: Try to extract any usable data from the response
          evaluation = createFallbackEvaluation(fullResponse)
          if (evaluation) {
            console.log("Created fallback evaluation from partial data")
          } else {
            res.write(`data: ${JSON.stringify({ 
              type: 'error', 
              message: `JSON 解析失敗，所有修復嘗試都失敗: ${parseError instanceof Error ? parseError.message : '未知錯誤'}` 
            })}\n\n`)
            res.end()
            return
          }
        }
      } else {
        // For non-recognized errors, try fallback extraction
        console.log("Unrecognized parsing error, attempting fallback...")
        evaluation = createFallbackEvaluation(fullResponse)
        if (!evaluation) {
          res.write(`data: ${JSON.stringify({ 
            type: 'error', 
            message: `JSON 解析失敗: ${parseError instanceof Error ? parseError.message : '未知錯誤'}` 
          })}\n\n`)
          res.end()
          return
        }
      }
    }
    
    // Validate response structure
    if (!evaluation.overall_score || !evaluation.categories || !evaluation.summary) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: '評估結果格式不正確' })}\n\n`)
      res.end()
      return
    }

    // Send final result
    res.write(`data: ${JSON.stringify({ 
      type: 'complete', 
      evaluation,
      timestamp: new Date().toISOString()
    })}\n\n`)
    
    res.end()
  } catch (error) {
    console.error("Evaluation error details:")
    console.error("Error type:", error?.constructor?.name)
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("Full error object:", error)
    
    const errorMessage = error instanceof Error ? error.message : "評估過程發生錯誤"
    console.error("Sending error response:", errorMessage)
    
    // Check if response headers have been set (streaming mode)
    if (res.headersSent) {
      // Send error through SSE
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        message: errorMessage,
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? {
          type: error?.constructor?.name,
          stack: error instanceof Error ? error.stack : undefined
        } : undefined
      })}\n\n`)
      res.end()
    } else {
      // Send regular JSON error response
      return res.status(500).json({ 
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? {
          type: error?.constructor?.name,
          stack: error instanceof Error ? error.stack : undefined
        } : undefined
      })
    }
  }
}