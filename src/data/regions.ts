export interface Region {
  id: string
  name: string
  customerId: string
  manager: string
  status: 'active' | 'inactive'
}

export const DUMMY_REGIONS: Region[] = [
  // Midcounties Co-Operative Regions (36)
  { id: "1", name: "West Midlands", customerId: "36", manager: "Peter Thompson", status: "active" },
  { id: "2", name: "Oxfordshire", customerId: "36", manager: "Mary Johnson", status: "active" },
  { id: "3", name: "Gloucestershire", customerId: "36", manager: "Robert Davis", status: "active" },
  { id: "4", name: "Wiltshire", customerId: "36", manager: "Susan White", status: "active" },
  
  // Central England Co-Operative Regions (39)
  { id: "5", name: "East Midlands", customerId: "39", manager: "James Wilson", status: "active" },
  { id: "6", name: "Yorkshire", customerId: "39", manager: "Emma Brown", status: "active" },
  { id: "7", name: "Eastern", customerId: "39", manager: "David Clark", status: "active" },
  { id: "8", name: "Northern", customerId: "39", manager: "Sarah Lewis", status: "active" },
  
  // Gloucester Charities Trust Regions (41)
  { id: "9", name: "Gloucester City", customerId: "41", manager: "Andrew Moore", status: "active" },
  { id: "10", name: "Cheltenham", customerId: "41", manager: "Patricia Turner", status: "active" },
  { id: "11", name: "Stroud", customerId: "41", manager: "Michael Harris", status: "active" },
  { id: "12", name: "Forest of Dean", customerId: "41", manager: "Jennifer Adams", status: "active" },

  // YMCA Regions (42)
  { id: "13", name: "Cheltenham District", customerId: "42", manager: "Richard Brown", status: "active" },
  { id: "14", name: "Gloucester District", customerId: "42", manager: "Helen White", status: "active" },
  { id: "15", name: "Tewkesbury Area", customerId: "42", manager: "Paul Green", status: "active" },
  { id: "16", name: "Stroud Valley", customerId: "42", manager: "Lisa Taylor", status: "active" },

  // FM Security Regions (43)
  { id: "17", name: "South West", customerId: "43", manager: "Mark Johnson", status: "active" },
  { id: "18", name: "West Central", customerId: "43", manager: "Sophie Clark", status: "active" },
  { id: "19", name: "North Zone", customerId: "43", manager: "Chris Martin", status: "active" },
  { id: "20", name: "East Zone", customerId: "43", manager: "Rachel Green", status: "active" }
]
