import { Incident } from "@/types/incidents"
import { IncidentType, IncidentInvolved } from "@/types/incidents"

// Generate a random date within the last 6 months
const randomRecentDate = () => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  return new Date(sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime()));
};

// Helper to get a biased hour (higher probability for afternoon/evening)
const getBiasedHour = () => {
  // Distribution that favors afternoon and evening hours (1-8 PM)
  // Lower probability in early morning, higher in afternoon/evening
  const hourDistribution = [
    0.01, 0.01, 0.01, 0.01, 0.02, 0.03, // 12am-6am (low)
    0.04, 0.05, 0.06, 0.06, 0.07, 0.08, // 6am-12pm (moderate)
    0.09, 0.10, 0.10, 0.11, 0.12, 0.13, // 12pm-6pm (high)
    0.14, 0.15, 0.13, 0.10, 0.05, 0.02  // 6pm-12am (peaks at 7-8pm, then drops)
  ];
  
  const random = Math.random();
  let cumulativeProbability = 0;
  
  for (let hour = 0; hour < 24; hour++) {
    cumulativeProbability += hourDistribution[hour];
    if (random < cumulativeProbability) return hour;
  }
  
  return 12; // Fallback
};

// Helper to get a biased day (higher probability for weekends)
const getBiasedDay = () => {
  // Distribution that favors weekends (especially Saturday)
  // Monday=0, Sunday=6
  const dayDistribution = [
    0.12, 0.11, 0.10, 0.12, 0.15, 0.22, 0.18
  ];
  
  const random = Math.random();
  let cumulativeProbability = 0;
  
  for (let day = 0; day < 7; day++) {
    cumulativeProbability += dayDistribution[day];
    if (random < cumulativeProbability) return day;
  }
  
  return 5; // Fallback to Saturday
};

// Helper to format date to ISO string
const formatDate = (date: Date) => {
  return date.toISOString();
};

// Create store names array - realistic co-operative store names
const storeNames = [
  "Leicester Central Store",
  "Anson Road Store",
  "Cropston Drive Store",
  "Warwick Main Store",
  "Leamington Spa Store",
  "Coventry City Store",
  "Nuneaton High Street",
  "Bedworth Store",
  "Rugby Central Store",
  "Kenilworth Store"
];

// Create officer names array
const officerNames = [
  "John Smith",
  "Sarah Johnson",
  "Mike Davies",
  "Lisa Brown",
  "Tom Wilson",
  "Emma Thompson",
  "Rachel Green",
  "Alex Johnson",
  "Chris Evans",
  "Danny Murphy",
  "Kelly Wright",
  "James Carter",
  "Sophie Davis",
  "Mark Roberts",
  "Helen Taylor",
  "Robert Jones",
  "Laura Mitchell",
  "David Chen",
  "Amy Rodriguez",
  "Paul Anderson"
];

// Create customer names array - matching the actual customers in the system
const customerNames = [
  "Central England COOP",
  "Midcounties COOP",
  "Heart of England COOP"
];

// Get incident types from enum
const incidentTypes = Object.values(IncidentType);

// Get incident involved categories from enum
const incidentInvolved = Object.values(IncidentInvolved);

// Create product categories
const productCategories = [
  "Electronics",
  "Clothing",
  "Cosmetics",
  "Alcohol",
  "Food Items",
  "Health & Beauty",
  "Accessories",
  "Footwear"
];

// Create products array
const products = [
  { name: "Smartphones", category: "Electronics", value: 599 },
  { name: "Tablets", category: "Electronics", value: 399 },
  { name: "Laptops", category: "Electronics", value: 899 },
  { name: "Headphones", category: "Electronics", value: 199 },
  { name: "Designer Clothing", category: "Clothing", value: 129 },
  { name: "Premium Jeans", category: "Clothing", value: 89 },
  { name: "Luxury Handbags", category: "Accessories", value: 299 },
  { name: "Watches", category: "Accessories", value: 249 },
  { name: "Fragrances", category: "Cosmetics", value: 79 },
  { name: "Makeup Sets", category: "Cosmetics", value: 59 },
  { name: "Face Creams", category: "Health & Beauty", value: 49 },
  { name: "Hair Products", category: "Health & Beauty", value: 29 },
  { name: "Premium Spirits", category: "Alcohol", value: 39 },
  { name: "Wine", category: "Alcohol", value: 19 },
  { name: "Snacks", category: "Food Items", value: 4 },
  { name: "Baby Formula", category: "Food Items", value: 15 },
  { name: "Designer Shoes", category: "Footwear", value: 159 },
  { name: "Sport Shoes", category: "Footwear", value: 89 }
];

// Helper to get a biased store (some stores have higher incident rates)
const getBiasedStore = () => {
  // This creates a heavily skewed distribution where first few stores have much higher rates
  // London Central, Manchester Plaza, and Birmingham Mall will have significantly more incidents
  return Math.floor(Math.pow(Math.random(), 2) * storeNames.length);
};

// Helper to get relevant incident involved categories based on incident type
const getRelevantInvolvedType = (incidentType: string): string | undefined => {
  // Define probabilities of involved types being present for each incident type
  const hasProbability = Math.random() < 0.8; // 80% chance of having an involved type
  
  if (!hasProbability) return undefined;
  
  switch (incidentType) {
    case IncidentType.THEFT:
      // For theft, higher probability of self-checkout related incidents
      if (Math.random() < 0.4) return IncidentInvolved.SELF_SCAN_TILLS;
      if (Math.random() < 0.3) return IncidentInvolved.SCAN_AND_GO;
      return undefined;
      
    case IncidentType.ARREST:
      // For arrests, could involve bans or threats
      if (Math.random() < 0.5) return IncidentInvolved.BAN_FROM_STORE;
      return undefined;
      
    case IncidentType.SUSPICIOUS_BEHAVIOUR:
    case IncidentType.ANTI_SOCIAL:
      // For anti-social or suspicious behavior, might involve violence or threats
      if (Math.random() < 0.3) return IncidentInvolved.ABUSIVE_BEHAVIOUR;
      if (Math.random() < 0.2) return IncidentInvolved.THREATS_AND_INTIMIDATION;
      if (Math.random() < 0.1) return IncidentInvolved.SPITTING;
      if (Math.random() < 0.1) return IncidentInvolved.VIOLENT_BEHAVIOR;
      return undefined;
      
    case IncidentType.DETER:
      // Deterrence might involve reporting to police who fail to attend
      if (Math.random() < 0.3) return IncidentInvolved.POLICE_FAILED_TO_ATTEND;
      return undefined;
      
    default:
      // For other types, random selection with low probability
      if (Math.random() < 0.2) {
        const randomIndex = Math.floor(Math.random() * incidentInvolved.length);
        return incidentInvolved[randomIndex];
      }
      return undefined;
  }
};

// Helper to get a biased product (some products are stolen more frequently)
const getBiasedProduct = () => {
  // Higher probability for electronics and luxury items
  const categoryWeights = {
    "Electronics": 0.40,  // 40% chance
    "Cosmetics": 0.20,    // 20% chance
    "Clothing": 0.15,     // 15% chance
    "Accessories": 0.10,  // 10% chance
    "Alcohol": 0.05,      // 5% chance
    "Footwear": 0.05,     // 5% chance
    "Health & Beauty": 0.03, // 3% chance
    "Food Items": 0.02    // 2% chance
  };
  
  // First select a category based on weights
  const random = Math.random();
  let cumulativeProbability = 0;
  let selectedCategory = "Electronics"; // Default
  
  for (const [category, weight] of Object.entries(categoryWeights)) {
    cumulativeProbability += weight;
    if (random < cumulativeProbability) {
      selectedCategory = category;
      break;
    }
  }
  
  // Then select a product from that category
  const productsInCategory = products.filter(p => p.category === selectedCategory);
  return productsInCategory[Math.floor(Math.random() * productsInCategory.length)];
};

// Create a helper type for the new unified incidents
export type MockIncident = IncidentRecord; // Alias for backward compatibility

export interface IncidentRecord {
  id: string;
  customerId: string;
  customerName: string;
  regionId: string;
  regionName: string;
  siteId: string;
  siteName: string;
  incidentType: string;
  incidentCode: string;
  description: string;
  officerName: string;
  officerRole: string;
  dateReported: string;
  timeReported: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  valueRecovered?: number;
  quantityRecovered?: number;
  actionTaken: string;
  dutyManagerName: string;
  witnessDetails?: string;
  policeInformed: boolean;
  policeReferenceNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// Customer and region mapping for structured data generation - expanded for better testing
const CUSTOMER_REGION_MAPPING = {
  "1": {
    name: "Central England COOP",
    regions: [
      { id: "R001", name: "Leicester Central", sites: ["Anson Road Store", "Cropston Drive Store", "Fosse Park Store", "Beaumont Leys Store", "Thurmaston Store", "Syston Store", "Glenfield Store", "Birstall Store"] },
      { id: "R002", name: "Nottingham District", sites: ["Ilkeston Store", "Derby Road Store", "Beeston Store", "West Bridgford Store", "Stapleford Store", "Long Eaton Store", "Hucknall Store", "Arnold Store"] }
    ]
  },
  "2": {
    name: "Midcounties COOP", 
    regions: [
      { id: "R003", name: "Warwick Central", sites: ["Warwick Main Store", "Leamington Spa Store", "Kenilworth Store", "Stratford Store", "Southam Store", "Alcester Store", "Henley-in-Arden Store", "Studley Store"] },
      { id: "R004", name: "Coventry District", sites: ["Coventry City Store", "Tile Hill Store", "Canley Store", "Earlsdon Store", "Binley Store", "Foleshill Store", "Radford Store", "Cheylesmore Store"] }
    ]
  },
  "3": {
    name: "Heart of England COOP",
    regions: [
      { id: "R005", name: "Nuneaton Central", sites: ["Nuneaton High Street", "Bedworth Store", "Atherstone Store", "Coleshill Store", "Hartshill Store", "Bulkington Store", "Mancetter Store", "Polesworth Store"] },
      { id: "R006", name: "Rugby District", sites: ["Rugby Central Store", "Dunchurch Store", "Hillmorton Store", "Bilton Store", "Newbold Store", "Brownsover Store", "Cawston Store", "Binley Woods Store"] }
    ]
  }
};

// Officer name pools for each customer - expanded for larger dataset
const OFFICER_POOLS = {
  "1": ["John Smith", "Emma Wilson", "Mark Stevens", "Rachel Johnson", "James Parker", "Sophie Taylor", "David Mitchell", "Karen Edwards", "Simon Blake", "Nicole Foster", "Anthony Wright", "Gemma Phillips"],
  "2": ["Tom Wilson", "Rachel Green", "Alex Johnson", "Sarah Williams", "Michael Brown", "Lisa Taylor", "Chris Davis", "Jennifer Moore", "Daniel Harris", "Catherine Lee", "Ryan Thompson", "Stephanie Ward"],
  "3": ["Chris Evans", "Danny Murphy", "Kelly Wright", "Amanda Clark", "Robert Turner", "Helen Martin", "Paul Anderson", "Melissa Cooper", "Jake Williams", "Natalie Price", "Marcus Johnson", "Victoria King"]
};

// Manager name pools for each customer - expanded for larger dataset
const MANAGER_POOLS = {
  "1": ["Sarah Johnson", "James Wilson", "David Chen", "Paul Matthews", "Laura Brown", "Michael Roberts", "Elizabeth Parker", "Andrew Taylor", "Rebecca Lewis"],
  "2": ["Emma Thompson", "Mark Roberts", "Sophie Davis", "Richard Taylor", "Amanda Lewis", "Steven Clark", "Caroline Wilson", "Jonathan Moore", "Samantha White"],
  "3": ["Lisa Anderson", "Helen Taylor", "Robert Jones", "Patricia White", "Gary Thompson", "Michelle Davis", "Christopher Hall", "Angela Brown", "Kevin Miller"]
};

// Generate large realistic incident dataset
const generateLargeIncidentDataset = (): IncidentRecord[] => {
  const incidents: IncidentRecord[] = [];
  let incidentCounter = 1;

  // Generate incidents for each customer
  Object.entries(CUSTOMER_REGION_MAPPING).forEach(([customerId, customerData]) => {
    // Generate 60-80 incidents per customer for realistic distribution
    const incidentCount = 65 + Math.floor(Math.random() * 15); // 65-80 incidents per customer
    
    for (let i = 0; i < incidentCount; i++) {
      // Select random region and site
      const region = customerData.regions[Math.floor(Math.random() * customerData.regions.length)];
      const siteName = region.sites[Math.floor(Math.random() * region.sites.length)];
      
      // Generate incident type with realistic distribution - comprehensive list
      const incidentTypes = [
        { type: "Theft", code: "TH01", weight: 0.25 },
        { type: "Suspicious Behaviour", code: "SB02", weight: 0.12 },
        { type: "Anti-Social Behaviour", code: "ASB03", weight: 0.10 },
        { type: "Deter", code: "DT04", weight: 0.08 },
        { type: "Arrest", code: "AR05", weight: 0.07 },
        { type: "Self Scan Tills", code: "SST06", weight: 0.06 },
        { type: "Underage Purchase", code: "UP07", weight: 0.05 },
        { type: "Criminal Damage", code: "CD08", weight: 0.05 },
        { type: "Credit Card Fraud", code: "CCF09", weight: 0.04 },
        { type: "Violent Behaviour", code: "VB10", weight: 0.04 },
        { type: "Abusive Behaviour", code: "AB11", weight: 0.03 },
        { type: "Scan and Go", code: "SG12", weight: 0.03 },
        { type: "Threats and Intimidation", code: "TI13", weight: 0.02 },
        { type: "Ban from Store", code: "BFS14", weight: 0.02 },
        { type: "Police Involvement", code: "PI15", weight: 0.01 },
        { type: "Spitting", code: "SP16", weight: 0.01 },
        { type: "Police Failed to Attend", code: "PFA17", weight: 0.01 },
        { type: "Others", code: "OT18", weight: 0.01 }
      ];
      
      let random = Math.random();
      let selectedIncident = incidentTypes[incidentTypes.length - 1]; // Default to "Other"
      
      for (const incident of incidentTypes) {
        random -= incident.weight;
        if (random <= 0) {
          selectedIncident = incident;
          break;
        }
      }
      
      // Generate date (last 6 months, weighted towards recent)
      const daysAgo = Math.floor(Math.pow(Math.random(), 2) * 180); // Weighted towards recent dates
      const incidentDate = new Date();
      incidentDate.setDate(incidentDate.getDate() - daysAgo);
      
      // Generate time (weighted towards peak hours)
      const hours = [
        { hour: 10, weight: 0.08 }, { hour: 11, weight: 0.12 }, { hour: 12, weight: 0.15 },
        { hour: 13, weight: 0.12 }, { hour: 14, weight: 0.10 }, { hour: 15, weight: 0.08 },
        { hour: 16, weight: 0.07 }, { hour: 17, weight: 0.09 }, { hour: 18, weight: 0.07 },
        { hour: 19, weight: 0.06 }, { hour: 20, weight: 0.04 }, { hour: 9, weight: 0.02 }
      ];
      
      let timeRandom = Math.random();
      let selectedHour = 12; // Default
      for (const hourData of hours) {
        timeRandom -= hourData.weight;
        if (timeRandom <= 0) {
          selectedHour = hourData.hour;
          break;
        }
      }
      
      const minutes = Math.floor(Math.random() * 60);
      const timeReported = `${selectedHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      // Generate values based on incident type
      let valueRecovered = 0;
      let quantityRecovered = 0;
      
      if (selectedIncident.type === "Theft") {
        valueRecovered = Math.round((Math.random() * 150 + 10) * 100) / 100; // £10-£160
        quantityRecovered = Math.floor(Math.random() * 8) + 1; // 1-8 items
      } else if (selectedIncident.type === "Fraud") {
        valueRecovered = Math.round((Math.random() * 80 + 20) * 100) / 100; // £20-£100
        quantityRecovered = 1; // Usually 1 transaction
      }
      
      // Select officer and role
      const officerPool = OFFICER_POOLS[customerId as keyof typeof OFFICER_POOLS];
      const officerName = officerPool[Math.floor(Math.random() * officerPool.length)];
      
      const roles = ["Security Officer", "Senior Security Officer", "Store Detective", "Senior Store Detective"];
      const roleWeights = [0.4, 0.25, 0.25, 0.1]; // 40% Security Officer, 25% Senior Security, 25% Store Detective, 10% Senior Store Detective
      
      let roleRandom = Math.random();
      let selectedRole = roles[0]; // Default
      for (let j = 0; j < roles.length; j++) {
        roleRandom -= roleWeights[j];
        if (roleRandom <= 0) {
          selectedRole = roles[j];
          break;
        }
      }
      
      // Select manager
      const managerPool = MANAGER_POOLS[customerId as keyof typeof MANAGER_POOLS];
      const dutyManagerName = managerPool[Math.floor(Math.random() * managerPool.length)];
      
      // Generate severity and status
      const severities: Array<'Low' | 'Medium' | 'High' | 'Critical'> = ['Low', 'Medium', 'High', 'Critical'];
      const severityWeights = [0.4, 0.35, 0.2, 0.05]; // Most incidents are Low/Medium
      
      let sevRandom = Math.random();
      let selectedSeverity: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
      for (let j = 0; j < severities.length; j++) {
        sevRandom -= severityWeights[j];
        if (sevRandom <= 0) {
          selectedSeverity = severities[j];
          break;
        }
      }
      
      const statuses: Array<'Open' | 'In Progress' | 'Resolved' | 'Closed'> = ['Open', 'In Progress', 'Resolved', 'Closed'];
      const statusWeights = [0.05, 0.1, 0.35, 0.5]; // Most incidents are resolved/closed
      
      let statusRandom = Math.random();
      let selectedStatus: 'Open' | 'In Progress' | 'Resolved' | 'Closed' = 'Closed';
      for (let j = 0; j < statuses.length; j++) {
        statusRandom -= statusWeights[j];
        if (statusRandom <= 0) {
          selectedStatus = statuses[j];
          break;
        }
      }
      
      // Generate police involvement
      const policeInformed = selectedSeverity === 'Critical' || 
                           (selectedSeverity === 'High' && Math.random() < 0.6) ||
                           (selectedIncident.type === "Theft" && valueRecovered > 50 && Math.random() < 0.4) ||
                           selectedIncident.type === "Violence/Aggression";
      
      const policeReferenceNumber = policeInformed ? `PC2024/${String(Math.floor(Math.random() * 900000) + 100000)}` : undefined;
      
      // Create incident record
      const incident: IncidentRecord = {
        id: `INC-${String(incidentCounter).padStart(3, '0')}`,
        customerId: customerId,
        customerName: customerData.name,
        regionId: region.id,
        regionName: region.name,
        siteId: `S${String(incidentCounter).padStart(3, '0')}`,
        siteName: siteName,
        incidentType: selectedIncident.type,
        incidentCode: selectedIncident.code,
        description: `${selectedIncident.type} incident reported at ${siteName}`,
        officerName: officerName,
        officerRole: selectedRole,
        dateReported: incidentDate.toISOString().split('T')[0],
        timeReported: timeReported,
        severity: selectedSeverity,
        status: selectedStatus,
        valueRecovered: valueRecovered,
        quantityRecovered: quantityRecovered,
        actionTaken: generateActionTaken(selectedIncident.type, selectedStatus),
        dutyManagerName: dutyManagerName,
        witnessDetails: Math.random() < 0.3 ? generateWitnessDetails() : undefined,
        policeInformed: policeInformed,
        policeReferenceNumber: policeReferenceNumber,
        createdAt: incidentDate.toISOString(),
        updatedAt: incidentDate.toISOString()
      };
      
      incidents.push(incident);
      incidentCounter++;
    }
  });
  
  return incidents.sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime());
};

// Helper functions
const generateActionTaken = (incidentType: string, status: string): string => {
  const actions = {
    "Theft": [
      "Items recovered, suspect detained",
      "Suspect apprehended, items recovered, police called",
      "Customer detained until police arrival",
      "Items recovered, customer received warning",
      "Suspect escaped, incident reported to police"
    ],
    "Suspicious Behaviour": [
      "Individual questioned and details recorded",
      "Person asked to leave premises",
      "Area monitored for suspicious activity",
      "Management informed, increased surveillance"
    ],
    "Anti-Social Behaviour": [
      "Group dispersed, area monitored",
      "Individuals asked to leave",
      "Security intervention, situation de-escalated",
      "Group moved on, area monitored for 30 minutes"
    ],
    "Arrest": [
      "Suspect detained and arrested",
      "Police called, suspect in custody",
      "Citizen's arrest performed, police contacted",
      "Suspect apprehended, awaiting police"
    ],
    "Deter": [
      "Potential incident prevented through presence",
      "Suspicious activity deterred by security",
      "Preventative action taken, area secured",
      "Visual deterrent effective, no further action"
    ],
    "Self Scan Tills": [
      "Customer assisted with self-scan procedure",
      "Suspicious scanning activity investigated",
      "Self-scan area monitored, intervention made",
      "Customer education provided on proper scanning"
    ],
    "Underage Purchase": [
      "ID checked, sale refused",
      "Age verification failed, transaction stopped",
      "Underage customer turned away",
      "Manager notified, sale declined"
    ],
    "Criminal Damage": [
      "Property damage documented, police informed",
      "CCTV preserved, incident reported",
      "Damaged area secured, evidence collected",
      "Cost assessment undertaken, claim filed"
    ],
    "Credit Card Fraud": [
      "Card retained, police informed",
      "Suspicious transaction blocked",
      "Customer questioned, transaction cancelled",
      "Fraud prevention protocols activated"
    ],
    "Violent Behaviour": [
      "Customer removed from premises, incident report filed",
      "Police called, customer detained until arrival",
      "Emergency services contacted, area secured",
      "Violent customer restrained, authorities notified"
    ],
    "Abusive Behaviour": [
      "Customer given verbal warning",
      "Abusive customer asked to leave",
      "Management intervention, situation de-escalated",
      "Customer banned for inappropriate conduct"
    ],
    "Scan and Go": [
      "Random bag check performed",
      "Scan and Go audit completed",
      "Customer receipts verified",
      "Technology-assisted verification conducted"
    ],
    "Threats and Intimidation": [
      "Threats reported to police",
      "Customer details recorded, ban issued",
      "Security increased, area monitored",
      "Intimidating behavior addressed, customer removed"
    ],
    "Ban from Store": [
      "Customer ban implemented and recorded",
      "Photo taken for future reference",
      "Ban notice served, details logged",
      "Exclusion order issued, staff notified"
    ],
    "Police Involvement": [
      "Police contacted and attended scene",
      "Officer statement taken",
      "Police investigation initiated",
      "Formal police report filed"
    ],
    "Spitting": [
      "Area sanitized, incident reported",
      "Health and safety protocols followed",
      "Customer removed, cleaning undertaken",
      "Biohazard procedures implemented"
    ],
    "Police Failed to Attend": [
      "Police non-attendance logged",
      "Alternative reporting method used",
      "Incident documented for future reference",
      "Follow-up with police station arranged"
    ],
    "Others": [
      "Incident logged and reported to management",
      "Appropriate action taken, situation resolved",
      "Area secured, incident documented",
      "Standard procedures followed"
    ],
    "Default": [
      "Incident logged and reported to management",
      "Appropriate action taken, situation resolved",
      "Area secured, incident documented",
      "Standard procedures followed"
    ]
  };
  
  const actionList = actions[incidentType as keyof typeof actions] || actions.Default;
  return actionList[Math.floor(Math.random() * actionList.length)];
};

const generateWitnessDetails = (): string => {
  const witnesses = [
    "Store clerk witnessed incident",
    "Customer services staff observed event", 
    "Multiple customers witnessed incident",
    "Security camera footage available",
    "Store detective observed from CCTV",
    "Till operator witnessed transaction",
    "Floor supervisor present during incident"
  ];
  
  return witnesses[Math.floor(Math.random() * witnesses.length)];
};

// Generate the large dataset
export const MOCK_INCIDENTS: IncidentRecord[] = generateLargeIncidentDataset();

// Backward compatibility export - use MOCK_INCIDENTS as the main data source
export const mockIncidents = MOCK_INCIDENTS;

// Helper functions for data retrieval
export const getIncidentsByCustomer = (customerId: string): IncidentRecord[] => {
  return MOCK_INCIDENTS.filter(incident => incident.customerId === customerId);
};

export const getIncidentsByRegion = (regionId: string): IncidentRecord[] => {
  return MOCK_INCIDENTS.filter(incident => incident.regionId === regionId);
};

export const getIncidentsBySite = (siteId: string): IncidentRecord[] => {
  return MOCK_INCIDENTS.filter(incident => incident.siteId === siteId);
};

export const getIncidentsByCustomerAndRegion = (customerId: string, regionId: string): IncidentRecord[] => {
  return MOCK_INCIDENTS.filter(incident => 
    incident.customerId === customerId && incident.regionId === regionId
  );
};

export const getIncidentsByCustomerAndSite = (customerId: string, siteId: string): IncidentRecord[] => {
  return MOCK_INCIDENTS.filter(incident => 
    incident.customerId === customerId && incident.siteId === siteId
  );
};

// Analytics helper functions
export const getIncidentStatsByCustomer = (customerId: string) => {
  const incidents = getIncidentsByCustomer(customerId);
  
  return {
    totalIncidents: incidents.length,
    totalValueRecovered: incidents.reduce((sum, inc) => sum + (inc.valueRecovered || 0), 0),
    totalQuantityRecovered: incidents.reduce((sum, inc) => sum + (inc.quantityRecovered || 0), 0),
    openIncidents: incidents.filter(inc => inc.status === 'Open' || inc.status === 'In Progress').length,
    resolvedIncidents: incidents.filter(inc => inc.status === 'Resolved' || inc.status === 'Closed').length,
    highSeverityIncidents: incidents.filter(inc => inc.severity === 'High' || inc.severity === 'Critical').length,
    uniqueStores: [...new Set(incidents.map(inc => inc.siteId))].length,
    incidentTypes: incidents.reduce((acc, inc) => {
      acc[inc.incidentType] = (acc[inc.incidentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
};

export const getIncidentTrendData = (customerId: string) => {
  const incidents = getIncidentsByCustomer(customerId);
  
  // Group by month for trend analysis
  const monthlyData = incidents.reduce((acc, incident) => {
    const month = incident.dateReported.substring(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = {
        month,
        incidents: 0,
        valueRecovered: 0,
        quantityRecovered: 0
      };
    }
    acc[month].incidents++;
    acc[month].valueRecovered += incident.valueRecovered || 0;
    acc[month].quantityRecovered += incident.quantityRecovered || 0;
    return acc;
  }, {} as Record<string, any>);
  
  return Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month));
};
