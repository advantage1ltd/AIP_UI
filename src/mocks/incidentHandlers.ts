import { http, HttpResponse, delay } from 'msw'
import { mockIncidents, IncidentRecord } from '@/data/mockIncidents'
import { Incident } from '@/types/incidents'
import { GetIncidentsParams, IncidentResponse, IncidentsResponse, UpsertIncidentRequest } from '@/types/api'
import { v4 as uuidv4 } from 'uuid'

// Base API URL - should match what we'll use with the real backend
const API_URL = '/api'

// Helper to simulate database operations - keep original IncidentRecord format
let incidentRecords: IncidentRecord[] = [...mockIncidents]

// Helper function to transform IncidentRecord to Incident format
const transformIncidentData = (incidentRecord: IncidentRecord): Incident => {
  console.log('Transforming IncidentRecord:', incidentRecord)
  
  const transformedData = {
    id: incidentRecord.id,
    customerId: incidentRecord.customerId,
    customerName: incidentRecord.customerName,
    siteName: incidentRecord.siteName,
    officerName: incidentRecord.officerName,
    officerRole: incidentRecord.officerRole,
    dutyManagerName: incidentRecord.dutyManagerName,
    dateInputted: incidentRecord.createdAt || new Date().toISOString(),
    dateOfIncident: incidentRecord.dateReported, // Map dateReported to dateOfIncident
    timeOfIncident: incidentRecord.timeReported, // Map timeReported to timeOfIncident
    incidentType: (() => {
      // List of valid display values (lowercase, trimmed)
      const validIncidentTypes = [
        'arrest - saved?',
        'deter - saved?',
        'theft - loss?',
        'criminal damage?',
        'credit card fraud?',
        'suspicious behaviour?',
        'underage purchase?',
        'anti-social behaviour?',
        'other?'
      ];
      const typeValue = (incidentRecord.incidentType || '').trim().toLowerCase();
      console.log('Mapping incidentType:', JSON.stringify(incidentRecord.incidentType), '| Normalized:', typeValue, '| Valid:', validIncidentTypes);
      if (validIncidentTypes.includes(typeValue)) {
        // Return the original value (preserve case)
        return incidentRecord.incidentType;
      }
      // Map mock data incident types to form enum values
      const typeMapping: Record<string, string> = {
        'Theft': 'Theft - Loss?',
        'Suspicious Behaviour': 'Suspicious Behaviour?',
        'Anti-Social Behaviour': 'Anti-Social Behaviour?',
        'Deter': 'Deter - Saved?',
        'Arrest': 'Arrest - Saved?',
        'Self Scan Tills': 'Other?',
        'Underage Purchase': 'Underage Purchase?',
        'Criminal Damage': 'Criminal Damage?',
        'Credit Card Fraud': 'Credit Card Fraud?',
        'Violent Behaviour': 'Anti-Social Behaviour?', // Map to closest match
        'Abusive Behaviour': 'Anti-Social Behaviour?',
        'Threats and Intimidation': 'Anti-Social Behaviour?',
        'Ban from Store': 'Other?',
        'Police Involvement': 'Other?',
        'Spitting': 'Anti-Social Behaviour?',
        'Police Failed to Attend': 'Other?',
        'Others': 'Other?'
      };
      return typeMapping[incidentRecord.incidentType] || 'Other?';
    })(),
    description: incidentRecord.description,
    incidentDetails: incidentRecord.description, // Use description as incident details
    storeComments: incidentRecord.actionTaken || '',
    totalValueRecovered: incidentRecord.valueRecovered || 0,
    policeInvolvement: incidentRecord.policeInformed || false,
    urnNumber: incidentRecord.policeReferenceNumber || '',
    crimeRefNumber: incidentRecord.policeReferenceNumber || '',
    
    // Form-specific fields with reasonable defaults based on mock data
    status: (incidentRecord.status === 'Open' ? 'pending' : 
            incidentRecord.status === 'In Progress' ? 'in-progress' : 'resolved') as 'pending' | 'in-progress' | 'resolved',
    priority: (incidentRecord.severity === 'Low' ? 'low' : 
              incidentRecord.severity === 'High' || incidentRecord.severity === 'Critical' ? 'high' : 'medium') as 'low' | 'medium' | 'high',
    actionTaken: incidentRecord.actionTaken || '',
    evidenceAttached: incidentRecord.policeInformed || false, // Assume evidence if police involved
    witnessStatements: incidentRecord.witnessDetails ? [incidentRecord.witnessDetails] : [],
    involvedParties: [],
    reportNumber: incidentRecord.id, // Use incident ID as report number
    
    // Generate realistic offender details for some incidents
    offenderName: (() => {
      if (incidentRecord.incidentType.toLowerCase().includes('theft') || 
          incidentRecord.incidentType.toLowerCase().includes('arrest') ||
          incidentRecord.incidentType.toLowerCase().includes('violent')) {
        const firstNames = ['John', 'Michael', 'David', 'James', 'Robert', 'William', 'Richard', 'Thomas', 'Christopher', 'Daniel',
                           'Sarah', 'Emma', 'Jennifer', 'Lisa', 'Karen', 'Susan', 'Jessica', 'Amanda', 'Michelle', 'Ashley'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                          'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Moore'];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        return `${firstName} ${lastName}`;
      }
      return '';
    })(),
    
    offenderSex: (() => {
      if (incidentRecord.incidentType.toLowerCase().includes('theft') || 
          incidentRecord.incidentType.toLowerCase().includes('arrest') ||
          incidentRecord.incidentType.toLowerCase().includes('violent')) {
        return Math.random() > 0.5 ? 'Male' : 'Female';
      }
      return 'N/A or N/K';
    })(),
    
    gender: (() => {
      if (incidentRecord.incidentType.toLowerCase().includes('theft') || 
          incidentRecord.incidentType.toLowerCase().includes('arrest') ||
          incidentRecord.incidentType.toLowerCase().includes('violent')) {
        return Math.random() > 0.5 ? 'Male' : 'Female';
      }
      return 'N/A or N/K';
    })() as 'Male' | 'Female' | 'N/A or N/K',
    
    offenderDOB: (() => {
      if (incidentRecord.incidentType.toLowerCase().includes('theft') || 
          incidentRecord.incidentType.toLowerCase().includes('arrest') ||
          incidentRecord.incidentType.toLowerCase().includes('violent')) {
        const year = 1970 + Math.floor(Math.random() * 35); // Ages 18-53
        const month = Math.floor(Math.random() * 12) + 1;
        const day = Math.floor(Math.random() * 28) + 1;
        return new Date(year, month - 1, day).toISOString().split('T')[0];
      }
      return '';
    })(),
    
    offenderPlaceOfBirth: (() => {
      if (incidentRecord.incidentType.toLowerCase().includes('theft') || 
          incidentRecord.incidentType.toLowerCase().includes('arrest') ||
          incidentRecord.incidentType.toLowerCase().includes('violent')) {
        const places = ['Birmingham', 'Manchester', 'Liverpool', 'Leeds', 'Sheffield', 'Bristol', 'Leicester', 'Coventry', 'Nottingham', 'Newcastle'];
        return places[Math.floor(Math.random() * places.length)];
      }
      return '';
    })(),
    
    offenderAddress: (() => {
      if (incidentRecord.incidentType.toLowerCase().includes('theft') || 
          incidentRecord.incidentType.toLowerCase().includes('arrest') ||
          incidentRecord.incidentType.toLowerCase().includes('violent')) {
        const houseNumbers = Math.floor(Math.random() * 200) + 1;
        const streets = ['High Street', 'Victoria Road', 'Church Lane', 'Mill Street', 'Park Avenue', 'Queens Road', 'King Street', 'Station Road'];
        const towns = ['Birmingham', 'Coventry', 'Leicester', 'Nottingham', 'Derby', 'Warwick', 'Rugby', 'Nuneaton'];
        const counties = ['West Midlands', 'Warwickshire', 'Leicestershire', 'Nottinghamshire', 'Derbyshire'];
        
        return {
          houseName: '',
          numberAndStreet: `${houseNumbers} ${streets[Math.floor(Math.random() * streets.length)]}`,
          villageOrSuburb: '',
          town: towns[Math.floor(Math.random() * towns.length)],
          county: counties[Math.floor(Math.random() * counties.length)],
          postCode: `B${Math.floor(Math.random() * 50) + 1} ${Math.floor(Math.random() * 9) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`
        };
      }
      return {
        houseName: '',
        numberAndStreet: '',
        villageOrSuburb: '',
        town: '',
        county: '',
        postCode: ''
      };
    })(),
    
    // Police details
    policeID: incidentRecord.policeInformed ? `PC${Math.floor(Math.random() * 9000) + 1000}` : '',
    arrestSaveComment: incidentRecord.incidentType.toLowerCase().includes('arrest') ? 
      'Suspect detained and processed according to standard procedures.' : '',
    
    // Generate realistic stolen items based on value recovered
    stolenItems: (() => {
      if (incidentRecord.valueRecovered && incidentRecord.valueRecovered > 0) {
        const categories = ['alcohol', 'tobacco', 'meat', 'health-beauty', 'grocery', 'confectionery'];
        const products = {
          alcohol: ['Whiskey', 'Wine', 'Beer', 'Vodka', 'Gin'],
          tobacco: ['Cigarettes', 'Rolling Tobacco', 'Cigars'],
          meat: ['Steak', 'Chicken', 'Bacon', 'Ham', 'Sausages'],
          'health-beauty': ['Perfume', 'Makeup', 'Skincare', 'Razor Blades'],
          grocery: ['Coffee', 'Cooking Oil', 'Cereal', 'Pasta', 'Rice'],
          confectionery: ['Chocolate', 'Sweets', 'Gum', 'Cake', 'Biscuits']
        };
        
        const numItems = incidentRecord.quantityRecovered || Math.floor(Math.random() * 3) + 1;
        const items: any[] = [];
        
        for (let i = 0; i < numItems; i++) {
          const category = categories[Math.floor(Math.random() * categories.length)];
          const productList = products[category as keyof typeof products];
          const product = productList[Math.floor(Math.random() * productList.length)];
          const quantity = Math.floor(Math.random() * 3) + 1;
          const cost = Math.round((Math.random() * 50 + 5) * 100) / 100;
          
          items.push({
            id: `item-${incidentRecord.id}-${i + 1}`,
            category: category,
            description: `${product} recovered from incident`,
            productName: product,
            cost: cost,
            quantity: quantity,
            totalAmount: cost * quantity
          });
        }
        
        return items;
      }
      return [];
    })(),
    
    // Incident involved categories - map based on incident type
    incidentInvolved: (() => {
      const involved: string[] = [];
      const type = incidentRecord.incidentType.toLowerCase();
      
      if (type.includes('theft') || type.includes('scan')) {
        involved.push('Self Scan Tills?');
      }
      if (type.includes('scan and go')) {
        involved.push('Scan And Go?');
      }
      if (type.includes('violent') || type.includes('abusive')) {
        involved.push('Violent Behavior (Physical)?', 'Abusive behaviour?');
      }
      if (type.includes('threats') || type.includes('intimidation')) {
        involved.push('Threats And Intimidation?');
      }
      if (type.includes('spitting')) {
        involved.push('Spitting?');
      }
      if (type.includes('ban')) {
        involved.push('Ban From Store?');
      }
      if (incidentRecord.policeInformed && !incidentRecord.policeReferenceNumber) {
        involved.push('Police Failed to Attend?');
      }
      
      // Ensure at least one category is selected
      if (involved.length === 0) {
        involved.push('Self Scan Tills?'); // Default fallback
      }
      
      return involved;
    })(),
    
    viewConfig: {
      enabledPages: []
    }
  }
  
  console.log('Transformed data:', transformedData)
  return transformedData
}

// Helper function to transform Incident back to IncidentRecord format
const transformToIncidentRecord = (incident: Incident): IncidentRecord => {
  return {
    id: incident.id,
    customerId: incident.customerId || '',
    customerName: incident.customerName || '',
    regionId: 'R001', // Default region
    regionName: 'Default Region',
    siteId: 'S001', // Default site
    siteName: incident.siteName || '',
    incidentType: incident.incidentType || '',
    incidentCode: 'GEN01', // Default code
    description: incident.description || '',
    officerName: incident.officerName || '',
    officerRole: incident.officerRole || '',
    dateReported: typeof incident.dateOfIncident === 'string' ? incident.dateOfIncident : new Date(incident.dateOfIncident).toISOString().split('T')[0],
    timeReported: incident.timeOfIncident || '12:00',
    severity: 'Medium' as const,
    status: 'Open' as const,
    valueRecovered: incident.totalValueRecovered || 0,
    quantityRecovered: 1,
    actionTaken: incident.storeComments || 'Action taken',
    dutyManagerName: incident.dutyManagerName || '',
    witnessDetails: '',
    policeInformed: incident.policeInvolvement || false,
    policeReferenceNumber: incident.urnNumber || incident.crimeRefNumber || '',
    createdAt: typeof incident.dateInputted === 'string' ? incident.dateInputted : new Date(incident.dateInputted).toISOString(),
    updatedAt: new Date().toISOString()
  }
}

export const incidentHandlers = [
  // GET /api/incidents - Get paginated incidents
  http.get(`${API_URL}/incidents`, async ({ request }) => {
    await delay(500) // Simulate network delay
    
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
    const search = url.searchParams.get('search') || ''
    const customerId = url.searchParams.get('customerId')
    
    // Filter incidents based on search term and customer
    let filteredIncidents = incidentRecords
    
    // Filter by customer if specified
    if (customerId) {
      filteredIncidents = filteredIncidents.filter(incident => {
        // Map customer names to customer IDs
        const customerIdMap: Record<string, string> = {
          "Central England COOP": "1",
          "Midcounties COOP": "2", 
          "Heart of England COOP": "3"
        }
        return customerIdMap[incident.customerName] === customerId
      })
    }
    
    // Filter by search term
    if (search) {
      filteredIncidents = filteredIncidents.filter(incident => 
        incident.siteName.toLowerCase().includes(search.toLowerCase()) ||
        incident.description.toLowerCase().includes(search.toLowerCase()) ||
        incident.incidentType.toLowerCase().includes(search.toLowerCase()) ||
        incident.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (incident.officerName && incident.officerName.toLowerCase().includes(search.toLowerCase()))
      )
    }
    
    // Calculate pagination
    const totalCount = filteredIncidents.length
    const totalPages = Math.ceil(totalCount / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedIncidents = filteredIncidents.slice(startIndex, endIndex)
    
    // Transform the data to match UI expectations
    const transformedIncidents = paginatedIncidents.map(transformIncidentData)
    
    const response: IncidentsResponse = {
      success: true,
      data: transformedIncidents,
      pagination: {
        currentPage: page,
        totalPages,
        pageSize,
        totalCount,
        hasPrevious: page > 1,
        hasNext: page < totalPages
      }
    }
    
    return HttpResponse.json(response)
  }),

  // GET /api/incidents/:id - Get single incident
  http.get(`${API_URL}/incidents/:id`, async ({ params }) => {
    await delay(300)
    
    const incident = incidentRecords.find(inc => inc.id === params.id)
    if (!incident) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Not Found'
      })
    }
    
    // Transform the data to match UI expectations
    const transformedIncident = transformIncidentData(incident)
    
    const response: IncidentResponse = {
      success: true,
      data: transformedIncident
    }
    
    return HttpResponse.json(response)
  }),

  // POST /api/incidents - Create new incident
  http.post(`${API_URL}/incidents`, async ({ request }) => {
    await delay(500)
    
    const body = await request.json() as UpsertIncidentRequest
    const { incident: newIncident } = body
    
    const incidentWithId: Incident = {
      ...newIncident,
      id: uuidv4(),
      dateInputted: new Date().toISOString()
    }
    
    // Convert to IncidentRecord format for storage
    const incidentRecord = transformToIncidentRecord(incidentWithId)
    incidentRecords.unshift(incidentRecord)
    
    const response: IncidentResponse = {
      success: true,
      data: incidentWithId,
      message: 'Incident created successfully'
    }
    
    return HttpResponse.json(response, { status: 201 })
  }),

  // PUT /api/incidents/:id - Update incident
  http.put(`${API_URL}/incidents/:id`, async ({ params, request }) => {
    await delay(500)
    
    const body = await request.json() as UpsertIncidentRequest
    const { incident: updatedIncident } = body
    console.log('Received updatedIncident:', updatedIncident)
    
    const index = incidentRecords.findIndex(inc => inc.id === params.id)
    if (index === -1) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Not Found'
      })
    }
    
    const updatedIncidentWithId: Incident = {
      ...updatedIncident,
      id: params.id as string,
      dateInputted: incidentRecords[index].createdAt
    }
    // Convert to IncidentRecord format for storage
    const incidentRecord = transformToIncidentRecord(updatedIncidentWithId)
    console.log('Transformed incidentRecord:', incidentRecord)
    incidentRecords[index] = incidentRecord
    console.log('Updated incidentRecords[index]:', incidentRecords[index])
    
    const response: IncidentResponse = {
      success: true,
      data: updatedIncidentWithId,
      message: 'Incident updated successfully'
    }
    
    return HttpResponse.json(response)
  }),

  // DELETE /api/incidents/:id - Delete incident
  http.delete(`${API_URL}/incidents/:id`, async ({ params }) => {
    await delay(500)
    
    const index = incidentRecords.findIndex(inc => inc.id === params.id)
    if (index === -1) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Not Found'
      })
    }
    
    incidentRecords = incidentRecords.filter(inc => inc.id !== params.id)
    
    return HttpResponse.json({
      success: true,
      message: 'Incident deleted successfully'
    })
  })
] 