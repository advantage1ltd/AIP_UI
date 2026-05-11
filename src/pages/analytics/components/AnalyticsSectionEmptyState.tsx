/** Shared empty state when an analytics hub section has no rows for the active filters. */
interface AnalyticsSectionEmptyStateProps {
	title: string
	description: string
}

export const AnalyticsSectionEmptyState = ({
	title,
	description,
}: AnalyticsSectionEmptyStateProps) => (
	<div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
		<p className="text-sm font-medium text-slate-700">{title}</p>
		<p className="mt-1 text-sm text-slate-500">{description}</p>
	</div>
)
