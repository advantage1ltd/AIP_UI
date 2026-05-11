/**
 * Repeat Offender Analysis: offenders, movements, and store network from analytics hub data.
 * Flow: most-active table → cross-store movement cards → SVG network map with empty states.
 */

import { useMemo, useState } from 'react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { RepeatOffenderData } from '@/types/analytics'
import {
	Users,
	MapPin,
	Network,
	ArrowRight,
	AlertTriangle,
	TrendingUp,
} from 'lucide-react'
import { AnalyticsSectionEmptyState } from './AnalyticsSectionEmptyState'

interface RepeatOffenderAnalysisProps {
	data: RepeatOffenderData
	loading?: boolean
}

const RISK_COLORS = {
	low: '#10b981',
	medium: '#f59e0b',
	high: '#ef4444',
	critical: '#dc2626',
}

const getRiskColor = (riskLevel: string) => {
	return RISK_COLORS[riskLevel as keyof typeof RISK_COLORS] || RISK_COLORS.low
}

export const RepeatOffenderAnalysis = ({
	data,
	loading = false,
}: RepeatOffenderAnalysisProps) => {
	const [selectedOffenderId, setSelectedOffenderId] = useState<string | null>(null)

	const selectedOffender = useMemo(() => {
		if (!selectedOffenderId) return null
		return data.mostActive.find((o) => o.offenderId === selectedOffenderId) || null
	}, [selectedOffenderId, data.mostActive])

	const selectedOffenderMovements = useMemo(() => {
		if (!selectedOffenderId) return null
		return data.crossStoreMovements.find((m) => m.offenderId === selectedOffenderId) || null
	}, [selectedOffenderId, data.crossStoreMovements])

	const networkNodesById = useMemo(
		() => new Map(data.networkMap.nodes.map((node) => [node.id, node])),
		[data.networkMap.nodes]
	)

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Repeat Offender Analysis</CardTitle>
					<CardDescription>Loading offender data...</CardDescription>
				</CardHeader>
			</Card>
		)
	}

	return (
		<Card className="w-full shadow-sm border-2">
			<CardHeader className="pb-4">
				<CardTitle className="flex items-center gap-2">
					<Users className="h-5 w-5" />
					Repeat Offender Analysis
				</CardTitle>
				<CardDescription>
					Track most active offenders, cross-store movements, and network patterns
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-6">
				<Tabs defaultValue="offenders" className="w-full">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="offenders">Most Active</TabsTrigger>
						<TabsTrigger value="movements">Cross-Store Movement</TabsTrigger>
						<TabsTrigger value="network">Network Map</TabsTrigger>
					</TabsList>

					<TabsContent value="offenders" className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
							<Card>
								<CardContent className="p-4">
									<div className="text-sm text-gray-500">Total Offenders</div>
									<div className="text-2xl font-bold">{data.totalOffenders}</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-4">
									<div className="text-sm text-gray-500">High Risk</div>
									<div className="text-2xl font-bold text-red-600">
										{data.mostActive.filter((o) => o.riskLevel === 'high' || o.riskLevel === 'critical').length}
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-4">
									<div className="text-sm text-gray-500">Multi-Store</div>
									<div className="text-2xl font-bold">
										{data.mostActive.filter((o) => o.storesTargeted.length > 2).length}
									</div>
								</CardContent>
							</Card>
						</div>

						{data.mostActive.length === 0 ? (
							<AnalyticsSectionEmptyState
								title="No repeat offenders in this range"
								description="Offenders appear here when incidents include offender names in the selected filters."
							/>
						) : (
						<>
						<div className="border rounded-lg">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Offender Name</TableHead>
										<TableHead>Incidents</TableHead>
										<TableHead>Stores Targeted</TableHead>
										<TableHead>Total Value</TableHead>
										<TableHead>Risk Level</TableHead>
										<TableHead>Last Incident</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{data.mostActive.map((offender) => (
										<TableRow key={offender.offenderId}>
											<TableCell className="font-medium">
												{offender.name}
											</TableCell>
											<TableCell>
												<Badge variant="outline">{offender.incidentCount}</Badge>
											</TableCell>
											<TableCell>
												<div className="flex flex-wrap gap-1">
													{offender.storesTargeted.slice(0, 3).map((store) => (
														<Badge key={store} variant="secondary" className="text-xs">
															{store}
														</Badge>
													))}
													{offender.storesTargeted.length > 3 && (
														<Badge variant="secondary" className="text-xs">
															+{offender.storesTargeted.length - 3}
														</Badge>
													)}
												</div>
											</TableCell>
											<TableCell>
												£{offender.totalValue.toFixed(2)}
											</TableCell>
											<TableCell>
												<Badge
													variant="outline"
													style={{
														borderColor: getRiskColor(offender.riskLevel),
														color: getRiskColor(offender.riskLevel),
													}}
												>
													{offender.riskLevel.toUpperCase()}
												</Badge>
											</TableCell>
											<TableCell className="text-sm text-gray-500">
												{new Date(offender.lastIncident).toLocaleDateString()}
											</TableCell>
											<TableCell className="text-right">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => setSelectedOffenderId(offender.offenderId)}
												>
													View Details
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						{selectedOffender && (
							<Card className="mt-4">
								<CardHeader>
									<CardTitle>{selectedOffender.name}</CardTitle>
									<CardDescription>Detailed offender profile</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										<div>
											<div className="text-sm text-gray-500">Incident Count</div>
											<div className="text-xl font-bold">{selectedOffender.incidentCount}</div>
										</div>
										<div>
											<div className="text-sm text-gray-500">Stores Targeted</div>
											<div className="text-xl font-bold">{selectedOffender.storesTargeted.length}</div>
										</div>
										<div>
											<div className="text-sm text-gray-500">Total Value</div>
											<div className="text-xl font-bold">
												£{selectedOffender.totalValue.toFixed(2)}
											</div>
										</div>
										<div>
											<div className="text-sm text-gray-500">Risk Level</div>
											<Badge
												variant="outline"
												style={{
													borderColor: getRiskColor(selectedOffender.riskLevel),
													color: getRiskColor(selectedOffender.riskLevel),
												}}
											>
												{selectedOffender.riskLevel.toUpperCase()}
											</Badge>
										</div>
									</div>
									<div>
										<div className="text-sm text-gray-500 mb-2">Stores Targeted</div>
										<div className="flex flex-wrap gap-2">
											{selectedOffender.storesTargeted.map((store) => (
												<Badge key={store} variant="secondary">
													{store}
												</Badge>
											))}
										</div>
									</div>
									<div>
										<div className="text-sm text-gray-500 mb-2">Modus Operandi</div>
										<div className="flex flex-wrap gap-2">
											{selectedOffender.modusOperandi.map((mo) => (
												<Badge key={mo} variant="outline">
													{mo}
												</Badge>
											))}
										</div>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<div className="text-sm text-gray-500">First Incident</div>
											<div className="font-medium">
												{new Date(selectedOffender.firstIncident).toLocaleDateString()}
											</div>
										</div>
										<div>
											<div className="text-sm text-gray-500">Last Incident</div>
											<div className="font-medium">
												{new Date(selectedOffender.lastIncident).toLocaleDateString()}
											</div>
										</div>
									</div>
									<Button
										variant="outline"
										onClick={() => setSelectedOffenderId(null)}
									>
										Close Details
									</Button>
								</CardContent>
							</Card>
						)}
						</>
						)}
					</TabsContent>

					<TabsContent value="movements" className="space-y-6 mt-6">
						{data.crossStoreMovements.length === 0 ? (
							<AnalyticsSectionEmptyState
								title="No cross-store movement patterns"
								description="Movement patterns appear when the same offender is linked to incidents at more than one store."
							/>
						) : (
						<>
						{data.crossStoreMovements.map((movement) => (
							<Card key={movement.offenderId}>
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="text-base">{movement.offenderName}</CardTitle>
											<CardDescription>{movement.offenderName}</CardDescription>
										</div>
										<Badge variant="outline">
											{movement.totalStores} stores
										</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{movement.movements.map((move, index) => (
											<div
												key={index}
												className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
											>
												<div className="flex items-center gap-2 flex-1">
													<MapPin className="h-4 w-4 text-gray-400" />
													<span className="font-medium">{move.fromStore}</span>
												</div>
												<ArrowRight className="h-4 w-4 text-gray-400" />
												<div className="flex items-center gap-2 flex-1">
													<MapPin className="h-4 w-4 text-gray-400" />
													<span className="font-medium">{move.toStore}</span>
												</div>
												<div className="text-sm text-gray-500">
													{new Date(move.date).toLocaleDateString()}
												</div>
												<Badge variant="secondary" className="text-xs">
													{move.incidentType}
												</Badge>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						))}
						</>
						)}
					</TabsContent>

					<TabsContent value="network" className="space-y-6 mt-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Network className="h-5 w-5" />
									Offender Network Visualization
								</CardTitle>
								<CardDescription>
									Connections between offenders and stores based on linked incidents
								</CardDescription>
							</CardHeader>
							<CardContent>
								{data.networkMap.nodes.length === 0 ? (
									<AnalyticsSectionEmptyState
										title="No network connections to display"
										description="Offender and store links appear when incidents include offender names and store activity in the selected range."
									/>
								) : (
									<div className="relative overflow-hidden rounded-lg border bg-slate-50">
										<svg viewBox="-220 -220 440 440" className="h-[500px] w-full">
											{data.networkMap.links.map((link) => {
												const source = networkNodesById.get(link.source)
												const target = networkNodesById.get(link.target)
												if (!source || !target) return null
												return (
													<line
														key={`${link.source}-${link.target}`}
														x1={source.x}
														y1={source.y}
														x2={target.x}
														y2={target.y}
														stroke="#94a3b8"
														strokeWidth={Math.max(1, link.strength * 4)}
														strokeOpacity={0.7}
													/>
												)
											})}
											{data.networkMap.nodes.map((node) => (
												<g key={node.id}>
													<circle
														cx={node.x}
														cy={node.y}
														r={node.type === 'offender' ? 10 : 8}
														fill={node.type === 'offender' ? '#3b82f6' : '#10b981'}
													/>
													<text
														x={node.x}
														y={node.y + 20}
														textAnchor="middle"
														className="fill-slate-700 text-[10px]"
													>
														{node.name.length > 18 ? `${node.name.slice(0, 18)}...` : node.name}
													</text>
												</g>
											))}
										</svg>
									</div>
								)}
								<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
									<Card>
										<CardContent className="p-4">
											<div className="text-sm text-gray-500">Total Nodes</div>
											<div className="text-2xl font-bold">{data.networkMap.nodes.length}</div>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<div className="text-sm text-gray-500">Total Connections</div>
											<div className="text-2xl font-bold">{data.networkMap.links.length}</div>
										</CardContent>
									</Card>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	)
}

