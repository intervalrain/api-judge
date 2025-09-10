export interface APIEvaluation {
  overall_score: number
  categories: {
    resource_design: CategoryEvaluation
    http_methods: CategoryEvaluation
    status_codes: CategoryEvaluation
    naming_conventions: CategoryEvaluation
    request_response: CategoryEvaluation
    versioning: CategoryEvaluation
    documentation: CategoryEvaluation
  }
  summary: string
  critical_issues: string[]
  best_practices_followed: string[]
}

export interface CategoryEvaluation {
  score: number
  issues: string[]
  suggestions: string[]
}