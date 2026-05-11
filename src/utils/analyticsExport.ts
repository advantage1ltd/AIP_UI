/**
 * CSV export for the analytics hub summary (no server export endpoint).
 * Built from the in-memory `AnalyticsHubData` payload already loaded in the UI.
 * Flow: hub snapshot → escaped CSV rows → browser download from DataAnalyticsHub export actions.
 */
import type { AnalyticsHubData } from '@/types/analytics'

const escapeCsvValue = (value: string | number) => {
	const stringValue = String(value)
	if (/[",\n]/.test(stringValue)) {
		return `"${stringValue.replace(/"/g, '""')}"`
	}
	return stringValue
}

const toCsvSection = (title: string, headers: string[], rows: Array<Array<string | number>>) => {
	const lines = [
		title,
		headers.map(escapeCsvValue).join(','),
		...rows.map((row) => row.map(escapeCsvValue).join(',')),
		'',
	]
	return lines.join('\n')
}

export const buildAnalyticsHubCsv = (data: AnalyticsHubData) => {
	const sections = [
		toCsvSection('Summary', ['Metric', 'Value'], [
			['Generated At', data.metadata.generatedAt],
			['Date Range Start', data.metadata.dateRange.start],
			['Date Range End', data.metadata.dateRange.end],
			['Customer Id', data.metadata.customerId ?? 'All'],
			['Total Incidents', data.crimeTrends.totalIncidents],
			['Total Value Lost', data.hotProducts.totalValueLost],
			['Total Value Recovered', data.hotProducts.totalValueRecovered],
			['Total Offenders', data.repeatOffenders.totalOffenders],
			['Linked Incidents', data.crimeLinking.totalLinkedIncidents],
		]),
		toCsvSection(
			'Store Risk Ranking',
			['Store', 'Risk Score', 'Risk Level', 'Incidents', 'Trend', 'Officer Type', 'Recommended Hours'],
			data.deploymentRecommendations.storeRankings.map((store) => [
				store.storeName,
				store.riskScore.toFixed(0),
				store.riskLevel,
				store.incidentCount,
				store.trend,
				store.recommendedOfficerType,
				store.recommendedHours.join(' | '),
			])
		),
		toCsvSection(
			'Deployment Recommendations',
			['Day', 'Time', 'Priority', 'Officer Type', 'Recommended Officers', 'Expected Incidents', 'Reason'],
			data.deploymentRecommendations.bestTimes.map((recommendation) => [
				recommendation.day,
				recommendation.hourLabel,
				recommendation.priority,
				recommendation.officerType,
				recommendation.recommendedOfficers,
				recommendation.expectedIncidents,
				recommendation.reason,
			])
		),
		toCsvSection(
			'Most Active Offenders',
			['Offender Name', 'Incidents', 'Stores Targeted', 'Total Value', 'Risk Level', 'Last Incident'],
			data.repeatOffenders.mostActive.map((offender) => [
				offender.name,
				offender.incidentCount,
				offender.storesTargeted.join(' | '),
				offender.totalValue.toFixed(2),
				offender.riskLevel,
				offender.lastIncident,
			])
		),
		toCsvSection(
			'Incident Clusters',
			['Cluster Id', 'Incident Count', 'Total Value', 'Suspected Offender', 'Date Range Start', 'Date Range End'],
			data.crimeLinking.clusters.map((cluster) => [
				cluster.clusterId,
				cluster.incidents.length,
				cluster.totalValue.toFixed(2),
				cluster.suspectedOffender?.name ?? 'N/A',
				cluster.dateRange.start,
				cluster.dateRange.end,
			])
		),
	]

	return sections.join('\n')
}

export const downloadAnalyticsHubCsv = (data: AnalyticsHubData) => {
	const csv = buildAnalyticsHubCsv(data)
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	const timestamp = new Date().toISOString().slice(0, 10)
	link.href = url
	link.download = `analytics-hub-${timestamp}.csv`
	link.click()
	URL.revokeObjectURL(url)
}
