export interface Site {
  id: string
  locationName: string
  regionId: string
  customerId: string
  buildingName: string
  street: string
  town: string
  county: string
  postcode: string
  isCoreSite: boolean
  sinNumber: string
  telephone: string
}

export const DUMMY_SITES: Site[] = [
  // Midcounties Co-Operative Sites (36)
  {
    id: "1",
    locationName: "Birmingham Central",
    regionId: "1",
    customerId: "36",
    buildingName: "Co-Op House",
    street: "New Street",
    town: "Birmingham",
    county: "West Midlands",
    postcode: "B2 4BA",
    isCoreSite: true,
    sinNumber: "SIN001",
    telephone: "0121 000 0000"
  },
  {
    id: "2",
    locationName: "Oxford Main Branch",
    regionId: "2",
    customerId: "36",
    buildingName: "The Cooperative",
    street: "Cornmarket Street",
    town: "Oxford",
    county: "Oxfordshire",
    postcode: "OX1 3HA",
    isCoreSite: true,
    sinNumber: "SIN002",
    telephone: "01865 000 0000"
  },
  
  // Central England Co-Operative Sites (39)
  {
    id: "3",
    locationName: "Leicester Hub",
    regionId: "5",
    customerId: "39",
    buildingName: "Retail Center",
    street: "Granby Street",
    town: "Leicester",
    county: "Leicestershire",
    postcode: "LE1 6FB",
    isCoreSite: true,
    sinNumber: "SIN003",
    telephone: "0116 000 0000"
  },
  {
    id: "4",
    locationName: "Sheffield Store",
    regionId: "6",
    customerId: "39",
    buildingName: "The Mall",
    street: "Meadowhall Way",
    town: "Sheffield",
    county: "South Yorkshire",
    postcode: "S9 1EP",
    isCoreSite: false,
    sinNumber: "SIN004",
    telephone: "0114 000 0000"
  },
  
  // Gloucester Charities Trust Sites (41)
  {
    id: "5",
    locationName: "Gloucester Main Office",
    regionId: "9",
    customerId: "41",
    buildingName: "Trust House",
    street: "Southgate Street",
    town: "Gloucester",
    county: "Gloucestershire",
    postcode: "GL1 1UB",
    isCoreSite: true,
    sinNumber: "SIN005",
    telephone: "01452 000 0000"
  },
  
  // YMCA Sites (42)
  {
    id: "6",
    locationName: "Cheltenham Center",
    regionId: "13",
    customerId: "42",
    buildingName: "YMCA Building",
    street: "Priors Road",
    town: "Cheltenham",
    county: "Gloucestershire",
    postcode: "GL52 5AH",
    isCoreSite: true,
    sinNumber: "SIN006",
    telephone: "01242 000 0000"
  },
  
  // FM Security Sites (43)
  {
    id: "7",
    locationName: "Security HQ",
    regionId: "17",
    customerId: "43",
    buildingName: "Security House",
    street: "Tewkesbury Road",
    town: "Cheltenham",
    county: "Gloucestershire",
    postcode: "GL51 9SL",
    isCoreSite: true,
    sinNumber: "SIN007",
    telephone: "01242 000 0000"
  }
]
