import { http, HttpResponse, delay } from 'msw'
import { mockOfficers, mockCustomers, mockLocations, evaluationCriteria } from '@/components/mystery-shopper/mockData'
import { v4 as uuidv4 } from 'uuid'
import type { MysteryShopperEvaluation } from '@/types/mysteryShopper'

// Base API URL
const API_URL = '/api'

// In-memory store for mystery shopper evaluations
let mysteryShopperEvaluations: MysteryShopperEvaluation[] = []

export const mysteryShopperHandlers = [
  // GET /api/mystery-shopper/officers - Get all officers
  http.get(`${API_URL}/mystery-shopper/officers`, async () => {
    await delay(300) // Simulate network delay
    return HttpResponse.json({
      success: true,
      data: mockOfficers
    })
  }),

  // GET /api/mystery-shopper/customers - Get all customers
  http.get(`${API_URL}/mystery-shopper/customers`, async () => {
    await delay(300)
    return HttpResponse.json({
      success: true,
      data: mockCustomers
    })
  }),

  // GET /api/mystery-shopper/locations - Get all locations
  http.get(`${API_URL}/mystery-shopper/locations`, async () => {
    await delay(300)
    return HttpResponse.json({
      success: true,
      data: mockLocations
    })
  }),

  // GET /api/mystery-shopper/evaluation-criteria - Get evaluation criteria
  http.get(`${API_URL}/mystery-shopper/evaluation-criteria`, async () => {
    await delay(300)
    return HttpResponse.json({
      success: true,
      data: evaluationCriteria
    })
  }),

  // POST /api/mystery-shopper/evaluations - Submit new evaluation
  http.post(`${API_URL}/mystery-shopper/evaluations`, async ({ request }) => {
    await delay(500)
    
    const body = await request.json() as Omit<MysteryShopperEvaluation, 'id' | 'createdAt' | 'status'>
    const evaluation: MysteryShopperEvaluation = {
      ...body,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      status: 'submitted'
    }
    
    // Add new evaluation to the top
    mysteryShopperEvaluations.unshift(evaluation)
    
    return HttpResponse.json({
      success: true,
      data: evaluation,
      message: 'Evaluation submitted successfully'
    }, { status: 201 })
  }),

  // GET /api/mystery-shopper/evaluations - Get all evaluations
  http.get(`${API_URL}/mystery-shopper/evaluations`, async ({ request }) => {
    await delay(500)
    
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
    
    // Defensive sort: newest first
    const sortedEvaluations = [...mysteryShopperEvaluations].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    // Calculate pagination
    const totalCount = sortedEvaluations.length
    const totalPages = Math.ceil(totalCount / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedEvaluations = sortedEvaluations.slice(startIndex, endIndex)
    
    return HttpResponse.json({
      success: true,
      data: paginatedEvaluations,
      pagination: {
        currentPage: page,
        totalPages,
        pageSize,
        totalCount,
        hasPrevious: page > 1,
        hasNext: page < totalPages
      }
    })
  })
] 