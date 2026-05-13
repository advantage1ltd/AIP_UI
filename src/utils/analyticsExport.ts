/**
 * CSV export for the analytics hub summary (no server export endpoint).
 * Built from the in-memory `AnalyticsHubData` payload already loaded in the UI.
 * Flow: hub snapshot → escaped CSV rows → browser download from DataAnalyticsHub export actions.
 */
import type { AnalyticsHubData } from '@/types/analytics'

const escapeCsvValue = (value: unknown) => {
	const stringValue = value == null ? '' : String(value)
	if (/[",\n]/.test(stringValue)) {
		return `"${stringValue.replace(/"/g, '""')}"`
	}
	return stringValue
}

const formatDateTime = (value: string) => {
	if (!value) return ''
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return value
	return date.toLocaleString('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

const formatDate = (value: string) => {
	if (!value) return ''
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return value
	return date.toLocaleDateString('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	})
}

const formatCurrency = (value: number) =>
	new Intl.NumberFormat('en-GB', {
		style: 'currency',
		currency: 'GBP',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value)

const formatPercent = (value: number) => `${value.toFixed(1)}%`
const toTitleCase = (value: string) =>
	value
		.split(/[\s-]+/)
		.filter(Boolean)
		.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
		.join(' ')

const toCsvSection = (title: string, headers: string[], rows: Array<Array<unknown>>) => {
	const lines = [
		title,
		headers.map(escapeCsvValue).join(','),
		...rows.map((row) => row.map(escapeCsvValue).join(',')),
		'',
	]
	return lines.join('\n')
}

export const buildAnalyticsHubCsv = (data: AnalyticsHubData) => {
	const topStore = [...data.deploymentRecommendations.storeRankings].sort(
		(a, b) => b.riskScore - a.riskScore
	)[0]
	const topOffender = [...data.repeatOffenders.mostActive].sort(
		(a, b) => b.incidentCount - a.incidentCount
	)[0]
	const totalImpactValue = data.hotProducts.totalValueLost + data.hotProducts.totalValueRecovered
	const recoveryRate = totalImpactValue > 0
		? (data.hotProducts.totalValueRecovered / totalImpactValue) * 100
		: 0
	const linkedIncidentRate = data.crimeTrends.totalIncidents > 0
		? (data.crimeLinking.totalLinkedIncidents / data.crimeTrends.totalIncidents) * 100
		: 0

	const reportHeaderRows = [
		['AIP Analytics Intelligence Report'],
		[''],
		['Generated At', formatDateTime(data.metadata.generatedAt)],
		['Date Range', `${formatDate(data.metadata.dateRange.start)} to ${formatDate(data.metadata.dateRange.end)}`],
		['Customer Scope', data.metadata.customerId != null ? `Customer ${data.metadata.customerId}` : 'All Customers'],
		[''],
	].map((row) => row.map(escapeCsvValue).join(',')).join('\n')

	const sections = [
		toCsvSection('Executive Summary', ['Metric', 'Value'], [
			['Generated At', formatDateTime(data.metadata.generatedAt)],
			['Date Range Start', formatDate(data.metadata.dateRange.start)],
			['Date Range End', formatDate(data.metadata.dateRange.end)],
			['Customer Id', data.metadata.customerId ?? 'All'],
			['Total Incidents', data.crimeTrends.totalIncidents],
			['Total Impact Value', formatCurrency(totalImpactValue)],
			['Total Value Lost', formatCurrency(data.hotProducts.totalValueLost)],
			['Total Value Recovered', formatCurrency(data.hotProducts.totalValueRecovered)],
			['Recovery Rate', formatPercent(recoveryRate)],
			['Total Offenders', data.repeatOffenders.totalOffenders],
			['Linked Incidents', data.crimeLinking.totalLinkedIncidents],
			['Linked Incident Rate', formatPercent(linkedIncidentRate)],
			['Top Risk Store', topStore?.storeName ?? 'N/A'],
			['Top Offender', topOffender?.name ?? 'N/A'],
		]),
		toCsvSection('Board-Ready Insights', ['Insight', 'Value'], [
			['Highest risk location', topStore ? `${topStore.storeName} (${toTitleCase(topStore.riskLevel)})` : 'N/A'],
			['Most active offender', topOffender ? `${topOffender.name} (${topOffender.incidentCount} incidents)` : 'N/A'],
			['Cluster count identified', data.crimeLinking.clusters.length],
			['Top deployment window', data.deploymentRecommendations.bestTimes[0]?.hourLabel ?? 'N/A'],
		]),
		toCsvSection(
			'Crime Trends - Day of Week',
			['Rank', 'Day', 'Incidents', 'Stores Affected', 'Share'],
			[...data.crimeTrends.dayOfWeek]
				.sort((a, b) => b.incidents - a.incidents)
				.map((item, index) => [
					index + 1,
					item.day,
					item.incidents,
					item.stores,
					formatPercent(item.percentage),
				])
		),
		toCsvSection(
			'Crime Trends - Time of Day',
			['Rank', 'Hour', 'Time Label', 'Incidents', 'Share'],
			[...data.crimeTrends.timeOfDay]
				.sort((a, b) => b.incidents - a.incidents)
				.map((item, index) => [
					index + 1,
					item.hour,
					item.label,
					item.incidents,
					formatPercent(item.percentage),
				])
		),
		toCsvSection(
			'Crime Trends - Incident Types',
			['Rank', 'Incident Type', 'Count', 'Share', 'Total Value'],
			[...data.crimeTrends.incidentTypes]
				.sort((a, b) => b.count - a.count)
				.map((item, index) => [
					index + 1,
					item.type,
					item.count,
					formatPercent(item.percentage),
					formatCurrency(item.totalValue),
				])
		),
		toCsvSection(
			'Store Peak Activity',
			['Rank', 'Store', 'Incidents', 'Peak Day', 'Peak Hour'],
			Object.values(data.crimeTrends.storeDrilldown)
				.sort((a, b) => b.incidents - a.incidents)
				.map((store, index) => [
					index + 1,
					store.storeName,
					store.incidents,
					store.peakDay,
					`${store.peakHour}:00`,
				])
		),
		toCsvSection(
			'Store Risk Ranking',
			['Rank', 'Store', 'Risk Score', 'Risk Level', 'Incidents', 'Trend', 'Officer Type', 'Recommended Hours'],
			[...data.deploymentRecommendations.storeRankings]
				.sort((a, b) => b.riskScore - a.riskScore)
				.map((store, index) => [
					index + 1,
					store.storeName,
					store.riskScore.toFixed(0),
					toTitleCase(store.riskLevel),
					store.incidentCount,
					toTitleCase(store.trend),
					store.recommendedOfficerType,
					store.recommendedHours.join(' | '),
				])
		),
		toCsvSection(
			'Deployment Recommendations',
			['Rank', 'Day', 'Time', 'Priority', 'Officer Type', 'Recommended Officers', 'Expected Incidents', 'Reason'],
			[...data.deploymentRecommendations.bestTimes]
				.sort((a, b) => b.expectedIncidents - a.expectedIncidents)
				.map((recommendation, index) => [
					index + 1,
					recommendation.day,
					recommendation.hourLabel,
					toTitleCase(recommendation.priority),
					recommendation.officerType,
					recommendation.recommendedOfficers,
					recommendation.expectedIncidents,
					recommendation.reason,
				])
		),
		toCsvSection(
			'Most Active Offenders',
			['Rank', 'Offender Name', 'Incidents', 'Stores Targeted', 'Total Value', 'Risk Level', 'Last Incident'],
			[...data.repeatOffenders.mostActive]
				.sort((a, b) => b.incidentCount - a.incidentCount)
				.map((offender, index) => [
					index + 1,
					offender.name,
					offender.incidentCount,
					offender.storesTargeted.join(' | '),
					formatCurrency(offender.totalValue),
					toTitleCase(offender.riskLevel),
					formatDate(offender.lastIncident),
				])
		),
		toCsvSection(
			'Incident Clusters',
			['Rank', 'Cluster Id', 'Incident Count', 'Total Value', 'Suspected Offender', 'Date Range Start', 'Date Range End'],
			[...data.crimeLinking.clusters]
				.sort((a, b) => b.incidents.length - a.incidents.length)
				.map((cluster, index) => [
					index + 1,
					cluster.clusterId,
					cluster.incidents.length,
					formatCurrency(cluster.totalValue),
					cluster.suspectedOffender?.name ?? 'N/A',
					formatDate(cluster.dateRange.start),
					formatDate(cluster.dateRange.end),
				])
		),
	]

	return [reportHeaderRows, ...sections].join('\n')
}

export const downloadAnalyticsHubCsv = (data: AnalyticsHubData) => {
	const csv = buildAnalyticsHubCsv(data)
	const csvWithBom = `\uFEFF${csv}`
	const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
	link.href = url
	link.download = `analytics-intelligence-report-${timestamp}.csv`
	link.click()
	URL.revokeObjectURL(url)
}
