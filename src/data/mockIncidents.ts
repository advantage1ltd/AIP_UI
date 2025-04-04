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

// Create store names array
const storeNames = [
  "London Central",
  "Manchester Plaza",
  "Birmingham Mall",
  "Liverpool Outlet",
  "Edinburgh Gallery",
  "Leeds Market",
  "Glasgow Square",
  "Bristol Harbour",
  "Sheffield Centre",
  "Cardiff Bay"
];

// Create customer names array
const customerNames = [
  "Retail Holdings Ltd",
  "Fashion Outlets Inc",
  "EasyShop Group",
  "Luxury Retail Co",
  "Department Stores UK",
  "Value Mart Chain",
  "Premium Brands Ltd"
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

// Generate 200 mock incidents with reasonable distribution
export const mockIncidents: Incident[] = Array.from({ length: 200 }, (_, index) => {
  // Skew toward theft incidents (40%) but include others based on security form categories
  let incidentType: string;
  const randomVal = Math.random();
  
  if (randomVal < 0.4) {
    incidentType = IncidentType.THEFT; // 40% theft
  } else if (randomVal < 0.55) {
    incidentType = IncidentType.SUSPICIOUS_BEHAVIOUR; // 15% suspicious behavior
  } else if (randomVal < 0.65) {
    incidentType = IncidentType.ANTI_SOCIAL; // 10% anti-social
  } else if (randomVal < 0.75) {
    incidentType = IncidentType.ARREST; // 10% arrests
  } else if (randomVal < 0.85) {
    incidentType = IncidentType.DETER; // 10% deterrence
  } else if (randomVal < 0.9) {
    incidentType = IncidentType.CRIMINAL_DAMAGE; // 5% criminal damage
  } else if (randomVal < 0.95) {
    incidentType = IncidentType.CREDIT_CARD_FRAUD; // 5% credit card fraud
  } else if (randomVal < 0.98) {
    incidentType = IncidentType.UNDERAGE_PURCHASE; // 3% underage purchase
  } else {
    incidentType = IncidentType.OTHER; // 2% other
  }

  // Get a biased store (some stores have higher incident rates)
  const storeIndex = getBiasedStore();
  const storeName = storeNames[storeIndex];
  
  // Random customer
  const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
  
  // Generate incident date with higher frequency in recent months
  const date = randomRecentDate();
  
  // For theft incidents, add product details
  let stolenItems: any[] = [];
  let totalValue = 0;
  let totalValueRecovered = 0;
  
  if (incidentType === IncidentType.THEFT) {
    // Random number of stolen items (1-5)
    const itemCount = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < itemCount; i++) {
      const product = getBiasedProduct();
      const quantity = Math.floor(Math.random() * 3) + 1;
      totalValue += product.value * quantity;
      
      stolenItems.push({
        name: product.name,
        category: product.category,
        value: product.value,
        quantity
      });
    }
    
    // Some items may be recovered
    const recoveryRate = Math.random();
    totalValueRecovered = Math.round(totalValue * recoveryRate);
  }
  
  // Generate a unique ID
  const id = `INC-${String(index + 1).padStart(5, '0')}`;
  
  // Get appropriate involved type based on incident type
  const involvedType = getRelevantInvolvedType(incidentType);
  
  // Simulate police involvement for relevant incidents
  const policeInvolved = 
    incidentType === IncidentType.ARREST || 
    incidentType === IncidentType.CRIMINAL_DAMAGE || 
    (incidentType === IncidentType.THEFT && Math.random() < 0.3) || 
    (involvedType === IncidentInvolved.VIOLENT_BEHAVIOR);
  
  return {
    id,
    dateInputted: formatDate(date),
    incidentDate: formatDate(date),
    incidentTime: `${getBiasedHour()}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
    siteName: storeName,
    customerName,
    incidentType,
    involvedType,
    description: `${incidentType.replace(/\?$/, '')} incident reported at ${storeName}`,
    status: Math.random() > 0.2 ? "Closed" : "Open",
    stolenItems,
    totalValue: incidentType === IncidentType.THEFT ? totalValue : 0,
    totalValueRecovered: incidentType === IncidentType.THEFT ? totalValueRecovered : 0,
    reportedBy: `Staff ${Math.floor(Math.random() * 100) + 1}`,
    witnesses: Math.random() > 0.7 ? `${Math.floor(Math.random() * 3) + 1} witnesses` : "",
    locationInStore: incidentType === IncidentType.THEFT ? ["Electronics Section", "Checkout Area", "Entrance", "Clothing Section", "Cosmetics Section"][Math.floor(Math.random() * 5)] : "",
    timeOfDay: date.getHours() < 12 ? "Morning" : date.getHours() < 18 ? "Afternoon" : "Evening",
    dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][getBiasedDay()],
    securityResponseTime: Math.floor(Math.random() * 15) + 1, // 1-15 minutes
    cameraFootage: Math.random() > 0.25, // 75% chance of having footage
    securityStaffPresent: Math.random() > 0.4, // 60% chance of security being present
    policeInvolved
  };
});

// Create a helper type for incidents
export type MockIncident = typeof mockIncidents[0];
