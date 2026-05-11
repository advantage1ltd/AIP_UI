from pathlib import Path
import re

root = Path(__file__).resolve().parents[1] / 'src' / 'pages'
src_path = root / 'ReportsDashboard.tsx'
lines = src_path.read_text(encoding='utf-8').splitlines()
out = root / 'reportsDashboard'
out.mkdir(exist_ok=True)

constants = '\n'.join(lines[79:116])
utils = '\n'.join(lines[117:134])
stats = '\n'.join(lines[135:179]).replace('const StatsCard', 'export const StatsCard')

(out / 'constants.ts').write_text(
	'/** Chart palettes for ReportsDashboard tabs. */\n'
	'import { IncidentType, IncidentInvolved } from \'@/types/incidents\'\n\n'
	+ constants
	+ '\n',
	encoding='utf-8',
)
(out / 'utils.ts').write_text(
	'/** Time parsing helpers for incident hour charts. */\n' + utils + '\n',
	encoding='utf-8',
)
(out / 'StatsCard.tsx').write_text(
	'/** Summary metric card used on the reports overview tab. */\n'
	'import React from \'react\'\n'
	'import { Card, CardContent } from \'@/components/ui/card\'\n'
	'import { cn } from \'@/lib/utils\'\n\n'
	+ stats
	+ '\n',
	encoding='utf-8',
)
(out / 'types.ts').write_text(
	'/** Local filter types for ReportsDashboard. */\n'
	'export type ReportsDateRange = {\n'
	'\tfrom?: Date\n'
	'\tto?: Date\n'
	'}\n',
	encoding='utf-8',
)
(out / 'useReportsData.ts').write_text(
	'''/**
 * Loads incidents for ReportsDashboard and owns filter/date-range state.
 */
import { useEffect, useState } from 'react'
import { incidentService } from '@/services/incidentService'
import type { Incident } from '@/types/incidents'
import { logger } from '@/utils/logger'
import type { ReportsDateRange } from './types'

export const useReportsIncidentData = () => {
	const [incidents, setIncidents] = useState<Incident[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const loadIncidents = async () => {
			try {
				const data = await incidentService.getIncidents()
				setIncidents(data)
			} catch (error) {
				logger.error('Error loading incidents:', error)
			} finally {
				setLoading(false)
			}
		}

		void loadIncidents()
	}, [])

	return { incidents, loading }
}

export const useReportsFilters = () => {
	const [activeTab, setActiveTab] = useState('overview')
	const [dateRange, setDateRange] = useState<ReportsDateRange | undefined>({
		from: new Date(new Date().setDate(new Date().getDate() - 30)),
		to: new Date(),
	})
	const [customerFilter, setCustomerFilter] = useState<string>('all')
	const [storeFilter, setStoreFilter] = useState<string>('all')
	const [incidentTypeFilter, setIncidentTypeFilter] = useState<string>('all')
	const [incidentInvolvedFilter, setIncidentInvolvedFilter] = useState<string>('all')

	return {
		activeTab,
		setActiveTab,
		dateRange,
		setDateRange,
		customerFilter,
		setCustomerFilter,
		storeFilter,
		setStoreFilter,
		incidentTypeFilter,
		setIncidentTypeFilter,
		incidentInvolvedFilter,
		setIncidentInvolvedFilter,
	}
}
''',
	encoding='utf-8',
)

head = '\n'.join(lines[:79])
new_imports = (
	"\nimport { COLORS, incidentTypeColors } from './reportsDashboard/constants'\n"
	"import { parseIncidentHour } from './reportsDashboard/utils'\n"
	"import { StatsCard } from './reportsDashboard/StatsCard'\n"
	"import { useReportsFilters, useReportsIncidentData } from './reportsDashboard/useReportsData'\n"
)
main_rest = '\n'.join(lines[180:])
insert = '''
  const { incidents, loading } = useReportsIncidentData()
  const {
    activeTab,
    setActiveTab,
    dateRange,
    setDateRange,
    customerFilter,
    setCustomerFilter,
    storeFilter,
    setStoreFilter,
    incidentTypeFilter,
    setIncidentTypeFilter,
    incidentInvolvedFilter,
    setIncidentInvolvedFilter,
  } = useReportsFilters()
'''
main_rest = re.sub(
	r'  // State for filters and date ranges.*?  }, \[\]\)\n\n  // Show loading state',
	insert + '\n\n  // Show loading state',
	main_rest,
	count=1,
	flags=re.S,
)
body_start = (
	'/**\n'
	' * Customer reporting dashboard: incident analytics tabs fed by incidentService.\n'
	' */\n'
)
new_src = body_start + head + new_imports + '\n' + main_rest
src_path.write_text(new_src, encoding='utf-8')
print('ReportsDashboard split complete', len(new_src.splitlines()), 'lines')
