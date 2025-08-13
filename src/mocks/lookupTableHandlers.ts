import { http, HttpResponse } from 'msw'
import { BASE_API_URL } from '@/config/api'

// Mock data for lookup tables
const mockLookupTables = [
  // UK Counties
  { lookupId: 1, category: 'UK_Counties', value: 'Bedfordshire', description: 'UK County: Bedfordshire', code: '', sortOrder: 0, isActive: true },
  { lookupId: 2, category: 'UK_Counties', value: 'Berkshire', description: 'UK County: Berkshire', code: '', sortOrder: 1, isActive: true },
  { lookupId: 3, category: 'UK_Counties', value: 'Bristol', description: 'UK County: Bristol', code: '', sortOrder: 2, isActive: true },
  { lookupId: 4, category: 'UK_Counties', value: 'Buckinghamshire', description: 'UK County: Buckinghamshire', code: '', sortOrder: 3, isActive: true },
  { lookupId: 5, category: 'UK_Counties', value: 'Cambridgeshire', description: 'UK County: Cambridgeshire', code: '', sortOrder: 4, isActive: true },
  { lookupId: 6, category: 'UK_Counties', value: 'Cheshire', description: 'UK County: Cheshire', code: '', sortOrder: 5, isActive: true },
  { lookupId: 7, category: 'UK_Counties', value: 'Cornwall', description: 'UK County: Cornwall', code: '', sortOrder: 6, isActive: true },
  { lookupId: 8, category: 'UK_Counties', value: 'Cumbria', description: 'UK County: Cumbria', code: '', sortOrder: 7, isActive: true },
  { lookupId: 9, category: 'UK_Counties', value: 'Derbyshire', description: 'UK County: Derbyshire', code: '', sortOrder: 8, isActive: true },
  { lookupId: 10, category: 'UK_Counties', value: 'Devon', description: 'UK County: Devon', code: '', sortOrder: 9, isActive: true },
  { lookupId: 11, category: 'UK_Counties', value: 'Dorset', description: 'UK County: Dorset', code: '', sortOrder: 10, isActive: true },
  { lookupId: 12, category: 'UK_Counties', value: 'Durham', description: 'UK County: Durham', code: '', sortOrder: 11, isActive: true },
  { lookupId: 13, category: 'UK_Counties', value: 'East Sussex', description: 'UK County: East Sussex', code: '', sortOrder: 12, isActive: true },
  { lookupId: 14, category: 'UK_Counties', value: 'Essex', description: 'UK County: Essex', code: '', sortOrder: 13, isActive: true },
  { lookupId: 15, category: 'UK_Counties', value: 'Gloucestershire', description: 'UK County: Gloucestershire', code: '', sortOrder: 14, isActive: true },
  { lookupId: 16, category: 'UK_Counties', value: 'Greater London', description: 'UK County: Greater London', code: '', sortOrder: 15, isActive: true },
  { lookupId: 17, category: 'UK_Counties', value: 'Greater Manchester', description: 'UK County: Greater Manchester', code: '', sortOrder: 16, isActive: true },
  { lookupId: 18, category: 'UK_Counties', value: 'Hampshire', description: 'UK County: Hampshire', code: '', sortOrder: 17, isActive: true },
  { lookupId: 19, category: 'UK_Counties', value: 'Herefordshire', description: 'UK County: Herefordshire', code: '', sortOrder: 18, isActive: true },
  { lookupId: 20, category: 'UK_Counties', value: 'Hertfordshire', description: 'UK County: Hertfordshire', code: '', sortOrder: 19, isActive: true },
  { lookupId: 21, category: 'UK_Counties', value: 'Isle of Wight', description: 'UK County: Isle of Wight', code: '', sortOrder: 20, isActive: true },
  { lookupId: 22, category: 'UK_Counties', value: 'Kent', description: 'UK County: Kent', code: '', sortOrder: 21, isActive: true },
  { lookupId: 23, category: 'UK_Counties', value: 'Lancashire', description: 'UK County: Lancashire', code: '', sortOrder: 22, isActive: true },
  { lookupId: 24, category: 'UK_Counties', value: 'Leicestershire', description: 'UK County: Leicestershire', code: '', sortOrder: 23, isActive: true },
  { lookupId: 25, category: 'UK_Counties', value: 'Lincolnshire', description: 'UK County: Lincolnshire', code: '', sortOrder: 24, isActive: true },
  { lookupId: 26, category: 'UK_Counties', value: 'Merseyside', description: 'UK County: Merseyside', code: '', sortOrder: 25, isActive: true },
  { lookupId: 27, category: 'UK_Counties', value: 'Norfolk', description: 'UK County: Norfolk', code: '', sortOrder: 26, isActive: true },
  { lookupId: 28, category: 'UK_Counties', value: 'Northamptonshire', description: 'UK County: Northamptonshire', code: '', sortOrder: 27, isActive: true },
  { lookupId: 29, category: 'UK_Counties', value: 'Northumberland', description: 'UK County: Northumberland', code: '', sortOrder: 28, isActive: true },
  { lookupId: 30, category: 'UK_Counties', value: 'Nottinghamshire', description: 'UK County: Nottinghamshire', code: '', sortOrder: 29, isActive: true },
  { lookupId: 31, category: 'UK_Counties', value: 'Oxfordshire', description: 'UK County: Oxfordshire', code: '', sortOrder: 30, isActive: true },
  { lookupId: 32, category: 'UK_Counties', value: 'Rutland', description: 'UK County: Rutland', code: '', sortOrder: 31, isActive: true },
  { lookupId: 33, category: 'UK_Counties', value: 'Shropshire', description: 'UK County: Shropshire', code: '', sortOrder: 32, isActive: true },
  { lookupId: 34, category: 'UK_Counties', value: 'Somerset', description: 'UK County: Somerset', code: '', sortOrder: 33, isActive: true },
  { lookupId: 35, category: 'UK_Counties', value: 'South Yorkshire', description: 'UK County: South Yorkshire', code: '', sortOrder: 34, isActive: true },
  { lookupId: 36, category: 'UK_Counties', value: 'Staffordshire', description: 'UK County: Staffordshire', code: '', sortOrder: 35, isActive: true },
  { lookupId: 37, category: 'UK_Counties', value: 'Suffolk', description: 'UK County: Suffolk', code: '', sortOrder: 36, isActive: true },
  { lookupId: 38, category: 'UK_Counties', value: 'Surrey', description: 'UK County: Surrey', code: '', sortOrder: 37, isActive: true },
  { lookupId: 39, category: 'UK_Counties', value: 'Tyne and Wear', description: 'UK County: Tyne and Wear', code: '', sortOrder: 38, isActive: true },
  { lookupId: 40, category: 'UK_Counties', value: 'Warwickshire', description: 'UK County: Warwickshire', code: '', sortOrder: 39, isActive: true },
  { lookupId: 41, category: 'UK_Counties', value: 'West Midlands', description: 'UK County: West Midlands', code: '', sortOrder: 40, isActive: true },
  { lookupId: 42, category: 'UK_Counties', value: 'West Sussex', description: 'UK County: West Sussex', code: '', sortOrder: 41, isActive: true },
  { lookupId: 43, category: 'UK_Counties', value: 'West Yorkshire', description: 'UK County: West Yorkshire', code: '', sortOrder: 42, isActive: true },
  { lookupId: 44, category: 'UK_Counties', value: 'Wiltshire', description: 'UK County: Wiltshire', code: '', sortOrder: 43, isActive: true },
  { lookupId: 45, category: 'UK_Counties', value: 'Worcestershire', description: 'UK County: Worcestershire', code: '', sortOrder: 44, isActive: true },

  // UK Regions
  { lookupId: 46, category: 'UK_Regions', value: 'East Midlands', description: 'UK Region: East Midlands', code: '', sortOrder: 0, isActive: true },
  { lookupId: 47, category: 'UK_Regions', value: 'East of England', description: 'UK Region: East of England', code: '', sortOrder: 1, isActive: true },
  { lookupId: 48, category: 'UK_Regions', value: 'London', description: 'UK Region: London', code: '', sortOrder: 2, isActive: true },
  { lookupId: 49, category: 'UK_Regions', value: 'North East', description: 'UK Region: North East', code: '', sortOrder: 3, isActive: true },
  { lookupId: 50, category: 'UK_Regions', value: 'North West', description: 'UK Region: North West', code: '', sortOrder: 4, isActive: true },
  { lookupId: 51, category: 'UK_Regions', value: 'South East', description: 'UK Region: South East', code: '', sortOrder: 5, isActive: true },
  { lookupId: 52, category: 'UK_Regions', value: 'South West', description: 'UK Region: South West', code: '', sortOrder: 6, isActive: true },
  { lookupId: 53, category: 'UK_Regions', value: 'West Midlands', description: 'UK Region: West Midlands', code: '', sortOrder: 7, isActive: true },
  { lookupId: 54, category: 'UK_Regions', value: 'Yorkshire and the Humber', description: 'UK Region: Yorkshire and the Humber', code: '', sortOrder: 8, isActive: true },

  // Trainers
  { lookupId: 55, category: 'Trainers', value: 'James Haigh', description: 'Trainer: James Haigh', code: '', sortOrder: 0, isActive: true },
  { lookupId: 56, category: 'Trainers', value: 'Scott Bowhil', description: 'Trainer: Scott Bowhil', code: '', sortOrder: 1, isActive: true },
  { lookupId: 57, category: 'Trainers', value: 'Adam Pilcher', description: 'Trainer: Adam Pilcher', code: '', sortOrder: 2, isActive: true },
  { lookupId: 58, category: 'Trainers', value: 'Said Said', description: 'Trainer: Said Said', code: '', sortOrder: 3, isActive: true },
  { lookupId: 59, category: 'Trainers', value: 'Gil Sheffield', description: 'Trainer: Gil Sheffield', code: '', sortOrder: 4, isActive: true },
  { lookupId: 60, category: 'Trainers', value: 'David Ibanga', description: 'Trainer: David Ibanga', code: '', sortOrder: 5, isActive: true },

  // SIA Licence Types
  { lookupId: 61, category: 'SIA_Licence_Types', value: 'Door Supervisor', description: 'SIA Licence Type: Door Supervisor', code: '', sortOrder: 0, isActive: true },
  { lookupId: 62, category: 'SIA_Licence_Types', value: 'Security Guard', description: 'SIA Licence Type: Security Guard', code: '', sortOrder: 1, isActive: true },
  { lookupId: 63, category: 'SIA_Licence_Types', value: 'Close Protection', description: 'SIA Licence Type: Close Protection', code: '', sortOrder: 2, isActive: true },
  { lookupId: 64, category: 'SIA_Licence_Types', value: 'Public Space Surveillance (CCTV)', description: 'SIA Licence Type: Public Space Surveillance (CCTV)', code: '', sortOrder: 3, isActive: true },
  { lookupId: 65, category: 'SIA_Licence_Types', value: 'Vehicle Immobiliser', description: 'SIA Licence Type: Vehicle Immobiliser', code: '', sortOrder: 4, isActive: true },
  { lookupId: 66, category: 'SIA_Licence_Types', value: 'Key Holding', description: 'SIA Licence Type: Key Holding', code: '', sortOrder: 5, isActive: true },

  // Driving Licence Types
  { lookupId: 67, category: 'Driving_Licence_Types', value: 'Full UK Driving Licence', description: 'Driving Licence Type: Full UK Driving Licence', code: '', sortOrder: 0, isActive: true },
  { lookupId: 68, category: 'Driving_Licence_Types', value: 'Provisional UK Driving Licence', description: 'Driving Licence Type: Provisional UK Driving Licence', code: '', sortOrder: 1, isActive: true },
  { lookupId: 69, category: 'Driving_Licence_Types', value: 'International Driving Permit', description: 'Driving Licence Type: International Driving Permit', code: '', sortOrder: 2, isActive: true },
  { lookupId: 70, category: 'Driving_Licence_Types', value: 'No Driving Licence', description: 'Driving Licence Type: No Driving Licence', code: '', sortOrder: 3, isActive: true },

  // Right to Work Conditions
  { lookupId: 71, category: 'Right_To_Work_Conditions', value: 'British Citizen', description: 'Right to Work Condition: British Citizen', code: '', sortOrder: 0, isActive: true },
  { lookupId: 72, category: 'Right_To_Work_Conditions', value: 'EU Citizen', description: 'Right to Work Condition: EU Citizen', code: '', sortOrder: 1, isActive: true },
  { lookupId: 73, category: 'Right_To_Work_Conditions', value: 'Settled Status', description: 'Right to Work Condition: Settled Status', code: '', sortOrder: 2, isActive: true },
  { lookupId: 74, category: 'Right_To_Work_Conditions', value: 'Pre-settled Status', description: 'Right to Work Condition: Pre-settled Status', code: '', sortOrder: 3, isActive: true },
  { lookupId: 75, category: 'Right_To_Work_Conditions', value: 'Work Visa', description: 'Right to Work Condition: Work Visa', code: '', sortOrder: 4, isActive: true },
  { lookupId: 76, category: 'Right_To_Work_Conditions', value: 'Student Visa', description: 'Right to Work Condition: Student Visa', code: '', sortOrder: 5, isActive: true },
  { lookupId: 77, category: 'Right_To_Work_Conditions', value: 'Other', description: 'Right to Work Condition: Other', code: '', sortOrder: 6, isActive: true },

  // Working Time Directive
  { lookupId: 78, category: 'Working_Time_Directive', value: 'Opted Out', description: 'Working Time Directive: Opted Out', code: '', sortOrder: 0, isActive: true },
  { lookupId: 79, category: 'Working_Time_Directive', value: 'Opted In', description: 'Working Time Directive: Opted In', code: '', sortOrder: 1, isActive: true },
  { lookupId: 80, category: 'Working_Time_Directive', value: 'Not Applicable', description: 'Working Time Directive: Not Applicable', code: '', sortOrder: 2, isActive: true }
]

export const lookupTableHandlers = [
  // Get all lookup tables
  http.get(`${BASE_API_URL}/LookupTable`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Lookup tables retrieved successfully',
      data: mockLookupTables
    })
  }),

  // Get lookup tables by category
  http.get(`${BASE_API_URL}/LookupTable/category/:category`, ({ params }) => {
    const { category } = params
    const filteredData = mockLookupTables.filter(item => 
      item.category === category && item.isActive
    )
    
    return HttpResponse.json({
      success: true,
      message: `Lookup tables for category '${category}' retrieved successfully`,
      data: filteredData
    })
  }),

  // Get categories
  http.get(`${BASE_API_URL}/LookupTable/categories`, () => {
    const categories = [...new Set(mockLookupTables.map(item => item.category))].sort()
    
    return HttpResponse.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories
    })
  }),

  // Get lookup table by ID
  http.get(`${BASE_API_URL}/LookupTable/:lookupId`, ({ params }) => {
    const { lookupId } = params
    const item = mockLookupTables.find(item => item.lookupId === Number(lookupId))
    
    if (!item) {
      return HttpResponse.json({
        success: false,
        message: 'Lookup table not found'
      }, { status: 404 })
    }
    
    return HttpResponse.json({
      success: true,
      message: 'Lookup table retrieved successfully',
      data: item
    })
  }),

  // Create lookup table
  http.post(`${BASE_API_URL}/LookupTable`, async ({ request }) => {
    const body = await request.json()
    const newItem = {
      lookupId: Math.max(...mockLookupTables.map(item => item.lookupId)) + 1,
      ...body,
      isActive: true
    }
    
    mockLookupTables.push(newItem)
    
    return HttpResponse.json({
      success: true,
      message: 'Lookup table created successfully',
      data: newItem
    }, { status: 201 })
  }),

  // Update lookup table
  http.put(`${BASE_API_URL}/LookupTable/:lookupId`, async ({ params, request }) => {
    const { lookupId } = params
    const body = await request.json()
    const index = mockLookupTables.findIndex(item => item.lookupId === Number(lookupId))
    
    if (index === -1) {
      return HttpResponse.json({
        success: false,
        message: 'Lookup table not found'
      }, { status: 404 })
    }
    
    mockLookupTables[index] = { ...mockLookupTables[index], ...body }
    
    return HttpResponse.json({
      success: true,
      message: 'Lookup table updated successfully',
      data: mockLookupTables[index]
    })
  }),

  // Delete lookup table
  http.delete(`${BASE_API_URL}/LookupTable/:lookupId`, ({ params }) => {
    const { lookupId } = params
    const index = mockLookupTables.findIndex(item => item.lookupId === Number(lookupId))
    
    if (index === -1) {
      return HttpResponse.json({
        success: false,
        message: 'Lookup table not found'
      }, { status: 404 })
    }
    
    mockLookupTables[index].isActive = false
    
    return HttpResponse.json({
      success: true,
      message: 'Lookup table deleted successfully',
      data: true
    })
  })
]
