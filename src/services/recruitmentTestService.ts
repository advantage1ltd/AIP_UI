import { api } from '@/config/api'
import type { BackendApiResponse } from '@/types/backend-api'
import { getApiData, getApiErrors, getApiMessage, getApiSuccess } from '@/types/backend-api'
import type {
	RecruitmentAttemptDetail,
	RecruitmentAttemptStart,
	RecruitmentAttemptSummary,
	RecruitmentAdminTest,
	RecruitmentTestSummary,
	RecruitmentTestTake,
	SubmitRecruitmentAttemptRequest,
} from '@/types/recruitment-tests'
import {
	recruitmentAdminTestSchema,
	recruitmentAttemptDetailSchema,
	recruitmentAttemptStartSchema,
	recruitmentAttemptSummarySchema,
	recruitmentTestSummarySchema,
	recruitmentTestTakeSchema,
	submitRecruitmentAttemptRequestSchema,
} from '@/validation/recruitment-tests'

const parseOrThrow = <T>(schema: { parse: (v: unknown) => T }, value: unknown): T => schema.parse(value)

export const recruitmentTestService = {
	getAvailableTests: async (): Promise<RecruitmentTestSummary[]> => {
		const response = await api.get<BackendApiResponse<RecruitmentTestSummary[]>>('/recruitment/tests/available')
		const apiResponse = response.data
		if (!getApiSuccess(apiResponse)) throw new Error(getApiErrors(apiResponse)[0] || getApiMessage(apiResponse) || 'Failed to load tests')
		const data = getApiData(apiResponse) ?? []
		return parseOrThrow({ parse: (v) => recruitmentTestSummarySchema.array().parse(v) }, data)
	},

	getTestForTaking: async (testId: string): Promise<RecruitmentTestTake> => {
		const response = await api.get<BackendApiResponse<RecruitmentTestTake>>(`/recruitment/tests/${testId}/take`)
		const apiResponse = response.data
		if (!getApiSuccess(apiResponse)) throw new Error(getApiErrors(apiResponse)[0] || getApiMessage(apiResponse) || 'Failed to load test')
		const data = getApiData(apiResponse)
		if (!data) throw new Error('Test loaded but no data returned')
		return parseOrThrow(recruitmentTestTakeSchema, data)
	},

	startAttempt: async (testId: string): Promise<RecruitmentAttemptStart> => {
		const response = await api.post<BackendApiResponse<RecruitmentAttemptStart>>(`/recruitment/tests/${testId}/attempts/start`)
		const apiResponse = response.data
		if (!getApiSuccess(apiResponse)) throw new Error(getApiErrors(apiResponse)[0] || getApiMessage(apiResponse) || 'Failed to start attempt')
		const data = getApiData(apiResponse)
		if (!data) throw new Error('Attempt started but no data returned')
		return parseOrThrow(recruitmentAttemptStartSchema, data)
	},

	submitAttempt: async (attemptId: number, payload: SubmitRecruitmentAttemptRequest): Promise<RecruitmentAttemptDetail> => {
		submitRecruitmentAttemptRequestSchema.parse(payload)
		const response = await api.post<BackendApiResponse<RecruitmentAttemptDetail>>(`/recruitment/attempts/${attemptId}/submit`, payload)
		const apiResponse = response.data
		if (!getApiSuccess(apiResponse)) throw new Error(getApiErrors(apiResponse)[0] || getApiMessage(apiResponse) || 'Failed to submit attempt')
		const data = getApiData(apiResponse)
		if (!data) throw new Error('Attempt submitted but no data returned')
		return parseOrThrow(recruitmentAttemptDetailSchema, data)
	},

	getMyAttempts: async (): Promise<RecruitmentAttemptSummary[]> => {
		const response = await api.get<BackendApiResponse<RecruitmentAttemptSummary[]>>('/recruitment/my/attempts')
		const apiResponse = response.data
		if (!getApiSuccess(apiResponse)) throw new Error(getApiErrors(apiResponse)[0] || getApiMessage(apiResponse) || 'Failed to load attempts')
		const data = getApiData(apiResponse) ?? []
		return parseOrThrow({ parse: (v) => recruitmentAttemptSummarySchema.array().parse(v) }, data)
	},

	getMyAttemptById: async (attemptId: number): Promise<RecruitmentAttemptDetail> => {
		const response = await api.get<BackendApiResponse<RecruitmentAttemptDetail>>(`/recruitment/my/attempts/${attemptId}`)
		const apiResponse = response.data
		if (!getApiSuccess(apiResponse)) throw new Error(getApiErrors(apiResponse)[0] || getApiMessage(apiResponse) || 'Failed to load attempt')
		const data = getApiData(apiResponse)
		if (!data) throw new Error('Attempt loaded but no data returned')
		return parseOrThrow(recruitmentAttemptDetailSchema, data)
	},

	// Admin
	getAdminTests: async (): Promise<RecruitmentTestSummary[]> => {
		const response = await api.get<BackendApiResponse<RecruitmentTestSummary[]>>('/recruitment/admin/tests')
		const apiResponse = response.data
		if (!getApiSuccess(apiResponse)) throw new Error(getApiErrors(apiResponse)[0] || getApiMessage(apiResponse) || 'Failed to load tests')
		const data = getApiData(apiResponse) ?? []
		return parseOrThrow({ parse: (v) => recruitmentTestSummarySchema.array().parse(v) }, data)
	},

	getAdminTestById: async (testId: string): Promise<RecruitmentAdminTest> => {
		const response = await api.get<BackendApiResponse<RecruitmentAdminTest>>(`/recruitment/admin/tests/${testId}`)
		const apiResponse = response.data
		if (!getApiSuccess(apiResponse)) throw new Error(getApiErrors(apiResponse)[0] || getApiMessage(apiResponse) || 'Failed to load test')
		const data = getApiData(apiResponse)
		if (!data) throw new Error('Test loaded but no data returned')
		return parseOrThrow(recruitmentAdminTestSchema, data)
	},

	createAdminTest: async (payload: RecruitmentAdminTest): Promise<RecruitmentAdminTest> => {
		const response = await api.post<BackendApiResponse<RecruitmentAdminTest>>('/recruitment/admin/tests', payload)
		const apiResponse = response.data
		if (!getApiSuccess(apiResponse)) throw new Error(getApiErrors(apiResponse)[0] || getApiMessage(apiResponse) || 'Failed to create test')
		const data = getApiData(apiResponse)
		if (!data) throw new Error('Test created but no data returned')
		return parseOrThrow(recruitmentAdminTestSchema, data)
	},

	updateAdminTest: async (testId: string, payload: RecruitmentAdminTest): Promise<RecruitmentAdminTest> => {
		const response = await api.put<BackendApiResponse<RecruitmentAdminTest>>(`/recruitment/admin/tests/${testId}`, payload)
		const apiResponse = response.data
		if (!getApiSuccess(apiResponse)) throw new Error(getApiErrors(apiResponse)[0] || getApiMessage(apiResponse) || 'Failed to update test')
		const data = getApiData(apiResponse)
		if (!data) throw new Error('Test updated but no data returned')
		return parseOrThrow(recruitmentAdminTestSchema, data)
	},

	deleteAdminTest: async (testId: string): Promise<void> => {
		const response = await api.delete<BackendApiResponse<{ deleted: boolean }>>(`/recruitment/admin/tests/${testId}`)
		const apiResponse = response.data
		if (!getApiSuccess(apiResponse)) throw new Error(getApiErrors(apiResponse)[0] || getApiMessage(apiResponse) || 'Failed to delete test')
	},

	getAdminAttempts: async (testId?: string): Promise<RecruitmentAttemptSummary[]> => {
		const response = await api.get<BackendApiResponse<RecruitmentAttemptSummary[]>>('/recruitment/admin/attempts', { params: testId ? { testId } : undefined })
		const apiResponse = response.data
		if (!getApiSuccess(apiResponse)) throw new Error(getApiErrors(apiResponse)[0] || getApiMessage(apiResponse) || 'Failed to load attempts')
		const data = getApiData(apiResponse) ?? []
		return parseOrThrow({ parse: (v) => recruitmentAttemptSummarySchema.array().parse(v) }, data)
	},

	getAdminAttemptById: async (attemptId: number): Promise<RecruitmentAttemptDetail> => {
		const response = await api.get<BackendApiResponse<RecruitmentAttemptDetail>>(`/recruitment/admin/attempts/${attemptId}`)
		const apiResponse = response.data
		if (!getApiSuccess(apiResponse)) throw new Error(getApiErrors(apiResponse)[0] || getApiMessage(apiResponse) || 'Failed to load attempt')
		const data = getApiData(apiResponse)
		if (!data) throw new Error('Attempt loaded but no data returned')
		return parseOrThrow(recruitmentAttemptDetailSchema, data)
	},
}

