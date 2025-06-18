import type { Site } from "@/types/customer"

const now = new Date().toISOString()

const baseSite = {
  status: 'active' as const,
  createdAt: now,
  updatedAt: now
}

export const DUMMY_SITES: Site[] = [
  // East Midlands Region (r1) - Central England COOP
  {
    ...baseSite,
    id: "s1",
    locationName: "Leicester City Centre",
    regionId: "r1",
    customerId: "1",
    buildingName: "The Exchange",
    street: "Rutland Street",
    town: "Leicester",
    county: "Leicestershire",
    postcode: "LE1 1RB",
    isCoreSite: true,
    sinNumber: "SIN001",
    telephone: "0116 254 1234"
  },
  {
    ...baseSite,
    id: "s2",
    locationName: "Nottingham Victoria",
    regionId: "r1",
    customerId: "1",
    buildingName: "Victoria Centre",
    street: "Milton Street",
    town: "Nottingham",
    county: "Nottinghamshire",
    postcode: "NG1 3QN",
    isCoreSite: false,
    sinNumber: "SIN002",
    telephone: "0115 947 0090"
  },
  {
    ...baseSite,
    id: "s3",
    locationName: "Derby Marketplace",
    regionId: "r1",
    customerId: "1",
    buildingName: "Exchange House",
    street: "Market Place",
    town: "Derby",
    county: "Derbyshire",
    postcode: "DE1 2DR",
    isCoreSite: false,
    sinNumber: "SIN003",
    telephone: "01332 290 606"
  },

  // West Midlands Region (r2) - Central England COOP
  {
    ...baseSite,
    id: "s4",
    locationName: "Birmingham Bull Ring",
    regionId: "r2",
    customerId: "1",
    buildingName: "Bullring Shopping Centre",
    street: "St Martin's Queensway",
    town: "Birmingham",
    county: "West Midlands",
    postcode: "B5 4BU",
    isCoreSite: true,
    sinNumber: "SIN004",
    telephone: "0121 632 1500"
  },
  {
    ...baseSite,
    id: "s5",
    locationName: "Wolverhampton Central",
    regionId: "r2",
    customerId: "1",
    buildingName: "Mander Centre",
    street: "Victoria Street",
    town: "Wolverhampton",
    county: "West Midlands",
    postcode: "WV1 3NB",
    isCoreSite: false,
    sinNumber: "SIN005",
    telephone: "01902 711 037"
  },
  {
    ...baseSite,
    id: "s6",
    locationName: "Coventry Arena",
    regionId: "r2",
    customerId: "1",
    buildingName: "Arena Shopping Park",
    street: "Classic Drive",
    town: "Coventry",
    county: "West Midlands",
    postcode: "CV6 6AS",
    isCoreSite: false,
    sinNumber: "SIN006",
    telephone: "024 7666 4343"
  },

  // Oxfordshire & Gloucestershire Region (r3) - Midcounties COOP
  {
    ...baseSite,
    id: "s7",
    locationName: "Oxford City",
    regionId: "r3",
    customerId: "2",
    buildingName: "Westgate Centre",
    street: "Queen Street",
    town: "Oxford",
    county: "Oxfordshire",
    postcode: "OX1 1PB",
    isCoreSite: true,
    sinNumber: "SIN007",
    telephone: "01865 241 484"
  },
  {
    ...baseSite,
    id: "s8",
    locationName: "Cheltenham High Street",
    regionId: "r3",
    customerId: "2",
    buildingName: "Regent Arcade",
    street: "High Street",
    town: "Cheltenham",
    county: "Gloucestershire",
    postcode: "GL50 1JZ",
    isCoreSite: false,
    sinNumber: "SIN008",
    telephone: "01242 521 345"
  },
  {
    ...baseSite,
    id: "s9",
    locationName: "Gloucester Quays",
    regionId: "r3",
    customerId: "2",
    buildingName: "Gloucester Quays",
    street: "St Ann Way",
    town: "Gloucester",
    county: "Gloucestershire",
    postcode: "GL1 5SH",
    isCoreSite: false,
    sinNumber: "SIN009",
    telephone: "01452 338 933"
  },

  // Wiltshire & Somerset Region (r4) - Midcounties COOP
  {
    ...baseSite,
    id: "s10",
    locationName: "Swindon Orbital",
    regionId: "r4",
    customerId: "2",
    buildingName: "Orbital Shopping Park",
    street: "Thamesdown Drive",
    town: "Swindon",
    county: "Wiltshire",
    postcode: "SN25 4AN",
    isCoreSite: true,
    sinNumber: "SIN010",
    telephone: "01793 729 128"
  },
  {
    ...baseSite,
    id: "s11",
    locationName: "Bath City Centre",
    regionId: "r4",
    customerId: "2",
    buildingName: "SouthGate",
    street: "St James's Parade",
    town: "Bath",
    county: "Somerset",
    postcode: "BA1 1TG",
    isCoreSite: false,
    sinNumber: "SIN011",
    telephone: "01225 469 230"
  },
  {
    ...baseSite,
    id: "s12",
    locationName: "Trowbridge Gateway",
    regionId: "r4",
    customerId: "2",
    buildingName: "The Gateway",
    street: "Bythesea Road",
    town: "Trowbridge",
    county: "Wiltshire",
    postcode: "BA14 8JQ",
    isCoreSite: false,
    sinNumber: "SIN012",
    telephone: "01225 766 655"
  },

  // Coventry & Warwickshire Region (r5) - Heart of England COOP
  {
    ...baseSite,
    id: "s13",
    locationName: "Coventry Lower Precinct",
    regionId: "r5",
    customerId: "3",
    buildingName: "Lower Precinct Shopping Centre",
    street: "Lower Precinct",
    town: "Coventry",
    county: "West Midlands",
    postcode: "CV1 1DS",
    isCoreSite: true,
    sinNumber: "SIN013",
    telephone: "024 7663 2151"
  },
  {
    ...baseSite,
    id: "s14",
    locationName: "Nuneaton Ropewalk",
    regionId: "r5",
    customerId: "3",
    buildingName: "Ropewalk Shopping Centre",
    street: "Chapel Street",
    town: "Nuneaton",
    county: "Warwickshire",
    postcode: "CV11 5TZ",
    isCoreSite: false,
    sinNumber: "SIN014",
    telephone: "024 7638 5999"
  },
  {
    ...baseSite,
    id: "s15",
    locationName: "Rugby Clock Towers",
    regionId: "r5",
    customerId: "3",
    buildingName: "Clock Towers Shopping Centre",
    street: "Market Mall",
    town: "Rugby",
    county: "Warwickshire",
    postcode: "CV21 2JR",
    isCoreSite: false,
    sinNumber: "SIN015",
    telephone: "01788 572 182"
  },

  // Leicestershire & Northamptonshire Region (r6) - Heart of England COOP
  {
    ...baseSite,
    id: "s16",
    locationName: "Leicester Highcross",
    regionId: "r6",
    customerId: "3",
    buildingName: "Highcross Shopping Centre",
    street: "High Street",
    town: "Leicester",
    county: "Leicestershire",
    postcode: "LE1 4FQ",
    isCoreSite: true,
    sinNumber: "SIN016",
    telephone: "0116 242 8644"
  },
  {
    ...baseSite,
    id: "s17",
    locationName: "Northampton Grosvenor",
    regionId: "r6",
    customerId: "3",
    buildingName: "Grosvenor Centre",
    street: "Union Street",
    town: "Northampton",
    county: "Northamptonshire",
    postcode: "NN1 2EW",
    isCoreSite: false,
    sinNumber: "SIN017",
    telephone: "01604 634 073"
  },
  {
    ...baseSite,
    id: "s18",
    locationName: "Market Harborough Square",
    regionId: "r6",
    customerId: "3",
    buildingName: "The Square",
    street: "The Square",
    town: "Market Harborough",
    county: "Leicestershire",
    postcode: "LE16 7PA",
    isCoreSite: false,
    sinNumber: "SIN018",
    telephone: "01858 469 901"
  }
] 