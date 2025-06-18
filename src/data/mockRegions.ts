import type { Region } from "@/types/customer"

const now = new Date().toISOString()

const baseRegion = {
  status: 'active' as const,
  createdAt: now,
  updatedAt: now
}

export const DUMMY_REGIONS: Region[] = [
  // Central England COOP Regions
  {
    ...baseRegion,
    id: "r1",
    name: "East Midlands",
    customerId: "1",
    manager: "David Thompson"
  },
  {
    ...baseRegion,
    id: "r2",
    name: "West Midlands",
    customerId: "1",
    manager: "Sarah Parker"
  },

  // Midcounties COOP Regions
  {
    ...baseRegion,
    id: "r3",
    name: "Oxfordshire & Gloucestershire",
    customerId: "2",
    manager: "Michael Roberts"
  },
  {
    ...baseRegion,
    id: "r4",
    name: "Wiltshire & Somerset",
    customerId: "2",
    manager: "Emma Hughes"
  },

  // Heart of England COOP Regions
  {
    ...baseRegion,
    id: "r5",
    name: "Coventry & Warwickshire",
    customerId: "3",
    manager: "John Davies"
  },
  {
    ...baseRegion,
    id: "r6",
    name: "Leicestershire & Northamptonshire",
    customerId: "3",
    manager: "Rachel Wilson"
  }
] 