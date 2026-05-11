/** Static option lists for IncidentForm selects. */
import { format } from 'date-fns'
import { IncidentType, IncidentInvolved } from '@/types/incidents'

/** Officer role options for the incident report (free-text job titles vary by site). */
export const INCIDENT_OFFICER_ROLE_OPTIONS: readonly string[] = [
	'Security Officer',
	'Supervisor',
	'Team Leader',
	'Manager',
	'Store Liaison',
	'Customer',
]

export const incidentTypes: IncidentType[] = [
  IncidentType.ARREST,
  IncidentType.DETER,
  IncidentType.THEFT,
  IncidentType.VIOLENT_BEHAVIOUR,
  IncidentType.ABUSIVE_BEHAVIOUR,
  IncidentType.COLLEAGUE_ASSAULT,
  IncidentType.COLLEAGUE_ABUSE,
  IncidentType.CRIMINAL_DAMAGE,
  IncidentType.CREDIT_CARD_FRAUD,
  IncidentType.SUSPICIOUS_BEHAVIOUR,
  IncidentType.UNDERAGE_PURCHASE,
  IncidentType.ANTI_SOCIAL,
  IncidentType.OTHERS
]

export const verificationMethods = [
  'Drivers licence',
  'Police',
  'ID card',
  'Others'
] as const

export const formatDateSafe = (value: string | Date | undefined, pattern: string, fallback = 'N/A') => {
  if (!value) {
    return fallback
  }
  const dateValue = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(dateValue.getTime())) {
    return fallback
  }
  return format(dateValue, pattern)
}

export const formatDateForNativeInput = (value?: Date) => {
  if (!value) {
    return ''
  }
  const dateValue = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(dateValue.getTime())) {
    return ''
  }
  const year = dateValue.getFullYear()
  const month = String(dateValue.getMonth() + 1).padStart(2, '0')
  const day = String(dateValue.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const incidentInvolved: IncidentInvolved[] = [
  IncidentInvolved.SELF_SCAN_TILLS,
  IncidentInvolved.THREATS_AND_INTIMIDATION,
  IncidentInvolved.BAN_FROM_STORE,
  IncidentInvolved.SCAN_AND_GO,
  IncidentInvolved.ABUSIVE_BEHAVIOUR,
  IncidentInvolved.SPITTING,
  IncidentInvolved.VIOLENT_BEHAVIOR,
  IncidentInvolved.POLICE_FAILED_TO_ATTEND
]

// Update the retail categories
export const retailCategories = {
  'COOP': [
    { id: 'alcohol', label: 'Alcohol' },
    { id: 'ambient', label: 'Ambient' },
    { id: 'tobacco', label: 'Tobacco' },
    { id: 'meat', label: 'Meat' },
    { id: 'fish', label: 'Fish' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'confectionery', label: 'Confectionery' },
    { id: 'fresh', label: 'Fresh' },
    { id: 'health-beauty', label: 'Health & Beauty' },
    { id: 'household', label: 'Household' },
    { id: 'grocery', label: 'Grocery' },
    { id: 'frozen', label: 'Frozen' },
    { id: 'produce', label: 'Produce' },
    { id: 'bakery', label: 'Bakery' },
    { id: 'non-food', label: 'Non Food' },
    { id: 'other', label: 'Other' }
  ],
  'Tesco': [
    { id: 'f&f', label: 'F&F Clothing' },
    { id: 'fresh', label: 'Fresh & Chilled' },
    { id: 'grocery', label: 'Grocery & Packaged' },
    { id: 'BWS', label: 'Beers, Wines & Spirits' },
    { id: 'health', label: 'Health & Beauty' },
    { id: 'electronics', label: 'Electronics & Entertainment' },
    { id: 'home', label: 'Home & Seasonal' },
  ]
} as const
