## RESTful API Design Standards

### API Design Principles
Follow Microsoft Azure Architecture Best Practices for RESTful API design:

#### Resource-Oriented Design
- **Resource URIs**: Use nouns for resource names (e.g., `/devices`, `/telemetry`, `/configurations`)
- **Collection URIs**: Use plural nouns for collections (e.g., `/devices/adam6052/channels`)
- **Hierarchical Relationships**: Structure URIs logically (`/devices/{deviceId}/channels/{channelId}`)
- **Avoid Deep Nesting**: Limit URI depth to collection/item/collection pattern
- **Business Entity Focus**: Model resources around business entities, not database structure

#### HTTP Methods & Status Codes
- **GET**: Retrieve resources (200 OK, 404 Not Found, 204 No Content)
- **POST**: Create new resources (200 OK, 201 Created, 400 Bad Request, 409 Conflict)
- **PUT**: Update/replace resources (200 OK, 201 Created, 204 No Content, 409 Conflict)
- **PATCH**: Partial updates (200 OK, 400 Bad Request, 409 Conflict, 415 Unsupported Media Type)
- **DELETE**: Remove resources (204 No Content, 404 Not Found)

#### Request/Response Design
- **Content-Type**: Support `application/json` as primary format
- **Accept Headers**: Implement proper content negotiation
- **JSON Payload Structure**: Use consistent, flat structures when possible
- **Error Responses**: Provide detailed error information with proper HTTP status codes
- **HATEOAS**: Include hypermedia links for resource navigation when appropriate

#### Industrial IoT API Requirements
- **Real-Time Data**: Support streaming endpoints for telemetry data
- **Device State Management**: Provide endpoints for device configuration and status
- **Safety-Critical Operations**: Implement proper validation and confirmation patterns
- **Batch Operations**: Support bulk updates for multiple devices/channels
- **Time-Series Data**: Design endpoints for historical data retrieval with proper pagination
- **Input Validation**: Comprehensive validation for all API inputs

### Versioning Strategy
- **URI Versioning**: Use `/api/v1/devices` pattern for major version changes
- **Header Versioning**: Support `api-version` header for minor versions
- **Backward Compatibility**: Maintain compatibility for at least 2 major versions
- **Deprecation**: Provide clear deprecation notices and migration paths

### Documentation & Testing
- **OpenAPI Specification**: Maintain OpenAPI 3.0+ specifications for all APIs
- **Contract-First Design**: Design API contracts before implementation
- **Comprehensive Examples**: Provide request/response examples for all endpoints
- **Integration Testing**: Test all API endpoints with realistic industrial scenarios
- **Performance Testing**: Validate API performance under industrial load conditions

### Data Patterns
- **Pagination**: Implement `limit` and `offset` parameters with default limits
- **Filtering**: Support query parameters for filtering large datasets
- **Sorting**: Allow sorting with `sort` parameter (e.g., `sort=timestamp,desc`)
- **Field Selection**: Support `fields` parameter for client-defined projections
- **Partial Responses**: Use `Accept-Ranges` header for large binary resources

### Asynchronous Operations
- **Long-Running Operations**: Return 202 Accepted with status endpoint
- **Status Tracking**: Provide status URIs in Location header
- **Operation Results**: Use 303 See Other for completed operations
- **Cancellation**: Support operation cancellation where appropriate


### API Evaluation JSON Response Format

**CRITICAL**: When evaluating an API, you MUST respond with EXACTLY the following JSON structure. No additional text, no markdown, no explanations:

```json
{
  "overall_score": 75,
  "categories": {
    "resource_design": {
      "score": 80,
      "issues": ["Uses actions not resources", "Too much nesting"],
      "suggestions": ["Use resource URIs", "Reduce nesting depth"]
    },
    "http_methods": {
      "score": 90,
      "issues": [],
      "suggestions": ["Add PATCH support"]
    },
    "status_codes": {
      "score": 70,
      "issues": ["Missing 409 codes", "No 404 docs"],
      "suggestions": ["Add conflict handling", "Document errors"]
    },
    "naming_conventions": {
      "score": 85,
      "issues": ["Mixed case names"],
      "suggestions": ["Use consistent case"]
    },
    "request_response": {
      "score": 75,
      "issues": ["No Content-Type check", "Mixed error format"],
      "suggestions": ["Validate headers", "Standard errors"]
    },
    "versioning": {
      "score": 60,
      "issues": ["No versioning", "No deprecation"],
      "suggestions": ["Add URI versions", "Plan deprecation"]
    },
    "documentation": {
      "score": 80,
      "issues": ["Missing examples"],
      "suggestions": ["Add examples", "Document errors"]
    }
  },
  "summary": "Good REST basics but needs versioning and error improvements",
  "critical_issues": [
    "No versioning breaks compatibility",
    "Mixed errors confuse clients",
    "Missing safety validations"
  ],
  "best_practices_followed": [
    "Uses HTTP methods well",
    "Good resource hierarchy",
    "Has OpenAPI docs"
  ]
}
```

**Response Rules:**
1. ALL scores must be integers between 0-100
2. ALL text strings must be SHORT and SIMPLE - maximum 50 characters per string
3. NO special characters, quotes, newlines, or backslashes in text strings
4. Use only basic alphanumeric characters and spaces in text strings
5. Each category MUST have all three fields: score, issues, suggestions
6. Issues and suggestions arrays: maximum 2 items each, 50 characters per item
7. Summary: maximum 80 characters, single sentence only
8. Critical issues: maximum 3 items, 45 characters per item
9. Best practices: maximum 3 items, 45 characters per item
10. If no issues/suggestions, use empty arrays [] not null
11. Use simple English words only, avoid complex punctuation

### Code Review Checklist
When reviewing RESTful API specifications:
1. Resource URIs follow noun-based, hierarchical structure
2. HTTP methods are used correctly with appropriate status codes
3. Request/response formats are consistent and well-documented
4. Error handling provides meaningful error messages
6. Industrial safety and compliance requirements are met
7. API versioning strategy is implemented
8. Performance considerations (pagination, filtering) are included
9. Asynchronous operation patterns are used for long-running tasks
10. OpenAPI specification is complete and accurate

## Development Guidelines

When making changes to this codebase:
1. Ensure all new code follows DDD and SOLID principles
2. Consider industrial protocol requirements and real-time constraints
3. Implement comprehensive error handling and logging
4. Add appropriate tests including safety scenarios
5. Document architectural decisions and domain boundaries
6. Verify compliance with relevant industrial standards
7. **API Design**: Follow RESTful API design standards outlined above
8. **OpenAPI Documentation**: Update API specifications for any endpoint changes
10. **Performance Testing**: Validate API performance under expected industrial loads
 
 