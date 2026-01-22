import { useEffect, useMemo, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Alert } from '@/components/ui/alert'
import { toast } from '@/components/ui/use-toast'
import { Camera, Loader2, Save, User as UserIcon, KeyRound } from 'lucide-react'
import { api } from '@/config/api'
import { useAuth } from '@/contexts/AuthContext'
import { sessionStore } from '@/state/sessionStore'
import type { User } from '@/types/user'
import type { EmployeeDetailResponse } from '@/services/employeeService'
import type { BackendApiResponse } from '@/types/backend-api'
import { getApiData, getApiErrors, getApiMessage, getApiSuccess } from '@/types/backend-api'
import { compressImageFileToDataUrl, validateImageFile } from '@/utils/image'
import { profilePhotoCache } from '@/utils/profilePhotoCache'
import { userProfilePhotoCache } from '@/utils/userProfilePhotoCache'

type UserWithLegacyEmployeeId = User & { EmployeeId?: number | string }

const profileSchema = z.object({
	firstName: z.string().trim().min(1, 'First name is required').max(100, 'First name is too long'),
	lastName: z.string().trim().min(1, 'Last name is required').max(100, 'Last name is too long'),
	phoneNumber: z
		.string()
		.optional()
		.transform((v) => (v ?? '').trim())
		.refine((v) => v.length <= 20, 'Phone number is too long'),
	jobTitle: z
		.string()
		.optional()
		.transform((v) => (v ?? '').trim())
		.refine((v) => v.length <= 100, 'Job title is too long'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Current password is required'),
		newPassword: z.string().min(8, 'New password must be at least 8 characters').max(100),
		confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
	})
	.refine((v) => v.newPassword === v.confirmNewPassword, {
		message: 'Passwords do not match',
		path: ['confirmNewPassword'],
	})

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

const Profile = () => {
	const { user, isLoading } = useAuth()

	const [isSavingProfile, setIsSavingProfile] = useState(false)
	const [isChangingPassword, setIsChangingPassword] = useState(false)

	const [employeeLoading, setEmployeeLoading] = useState(false)
	const [employeeError, setEmployeeError] = useState<string | null>(null)
	const [employeePhotoFile, setEmployeePhotoFile] = useState<string | null>(null)
	const [localProfilePhotoFile, setLocalProfilePhotoFile] = useState<string | null>(null)

	const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const employeeId = useMemo<number | null>(() => {
		if (!user) return null
		const legacyUser = user as UserWithLegacyEmployeeId
		const raw = user.employeeId ?? legacyUser.EmployeeId
		if (typeof raw === 'number' && Number.isFinite(raw)) return raw
		if (typeof raw === 'string' && raw.trim() !== '' && Number.isFinite(Number(raw))) return Number(raw)
		return null
	}, [user])

	const displayPhotoFile = employeePhotoFile || localProfilePhotoFile || ''

	useEffect(() => {
		if (!user?.id) {
			setLocalProfilePhotoFile(null)
			return
		}
		setLocalProfilePhotoFile(userProfilePhotoCache.get(user.id))
	}, [user?.id])

	const defaultProfileValues = useMemo<ProfileFormValues>(() => {
		return {
			firstName: user?.firstName ?? '',
			lastName: user?.lastName ?? '',
			phoneNumber: user?.phoneNumber ?? '',
			jobTitle: user?.jobTitle ?? '',
		}
	}, [user?.firstName, user?.lastName, user?.phoneNumber, user?.jobTitle])

	const profileForm = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: defaultProfileValues,
		mode: 'onBlur',
	})

	useEffect(() => {
		profileForm.reset(defaultProfileValues)
	}, [defaultProfileValues, profileForm])

	const changePasswordForm = useForm<ChangePasswordFormValues>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmNewPassword: '',
		},
		mode: 'onBlur',
	})

	const loadEmployeePhoto = async (employeeId: number) => {
		setEmployeeLoading(true)
		setEmployeeError(null)
		try {
			const cached = profilePhotoCache.get(employeeId)
			if (cached) {
				setEmployeePhotoFile(cached)
			}

			const response = await api.get<BackendApiResponse<EmployeeDetailResponse>>(`/employee/${employeeId}`)
			const apiResponse = response.data
			if (!getApiSuccess(apiResponse)) {
				throw new Error(getApiMessage(apiResponse) || 'Failed to load employee profile')
			}
			const data = getApiData(apiResponse)
			const photoFile = data?.photoFile ?? null
			setEmployeePhotoFile(photoFile)
			if (photoFile) {
				profilePhotoCache.set(employeeId, photoFile)
			} else {
				profilePhotoCache.clear(employeeId)
			}
		} catch (err) {
			console.error('❌ [Profile] Failed to load employee:', err)
			const cached = profilePhotoCache.get(employeeId)
			if (!cached) {
				setEmployeeError(err instanceof Error ? err.message : 'Failed to load employee profile')
			}
		} finally {
			setEmployeeLoading(false)
		}
	}

	useEffect(() => {
		if (!employeeId) {
			setEmployeePhotoFile(null)
			setEmployeeError(null)
			return
		}
		loadEmployeePhoto(employeeId)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [employeeId])

	const triggerFileInput = () => {
		fileInputRef.current?.click()
	}

	const handleProfilePhotoSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return
		if (!user?.id) return

		const validation = validateImageFile(file, { maxSizeBytes: 2 * 1024 * 1024, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] })
		if (!validation.ok) {
			toast({
				title: 'Invalid image',
				description: validation.message,
				variant: 'destructive',
			})
			event.target.value = ''
			return
		}

		setIsUploadingPhoto(true)
		try {
			const compressed = await compressImageFileToDataUrl(file, { maxSizePx: 256, mimeType: 'image/jpeg', quality: 0.85 })

			// Always allow local profile photo (works even without backend / employee link)
			setLocalProfilePhotoFile(compressed)
			userProfilePhotoCache.set(user.id, compressed)

			// If we have an employeeId, also sync to employee profile photo
			if (employeeId) {
				setEmployeePhotoFile(compressed)
				profilePhotoCache.set(employeeId, compressed)

				try {
					const response = await api.put<BackendApiResponse<EmployeeDetailResponse>>(`/employee/${employeeId}/photo`, { photoFile: compressed })
					const apiResponse = response.data
					if (!getApiSuccess(apiResponse)) {
						const errors = getApiErrors(apiResponse)
						throw new Error(errors[0] || getApiMessage(apiResponse) || 'Failed to update profile photo')
					}
					const updatedEmployee = getApiData(apiResponse)
					const serverPhotoFile = updatedEmployee?.photoFile ?? compressed
					setEmployeePhotoFile(serverPhotoFile)
					profilePhotoCache.set(employeeId, serverPhotoFile)
				} catch (apiErr) {
					console.warn('⚠️ [Profile] Photo update API failed (kept local preview):', apiErr)
				}
			}

			toast({
				title: 'Profile photo updated',
				description: employeeId
					? 'Your profile photo has been updated successfully.'
					: 'Saved locally. It will sync to your employee profile once your account is linked.',
			})
		} catch (err) {
			console.error('❌ [Profile] Photo update failed:', err)
			toast({
				title: 'Upload failed',
				description: err instanceof Error ? err.message : 'Failed to update profile photo',
				variant: 'destructive',
			})
		} finally {
			setIsUploadingPhoto(false)
			event.target.value = ''
		}
	}

	const handleSaveProfile = async (values: ProfileFormValues) => {
		if (!user) return

		setIsSavingProfile(true)
		try {
			const response = await api.put<BackendApiResponse<User>>('/Auth/me', {
				firstName: values.firstName,
				lastName: values.lastName,
				phoneNumber: values.phoneNumber || null,
				jobTitle: values.jobTitle || null,
			})
			const apiResponse = response.data
			if (!getApiSuccess(apiResponse)) {
				const errors = getApiErrors(apiResponse)
				throw new Error(errors[0] || getApiMessage(apiResponse) || 'Failed to update profile')
			}

			const updatedUser = getApiData<User>(apiResponse)
			if (!updatedUser) {
				throw new Error('Profile updated but no user data returned')
			}

			sessionStore.setUser(updatedUser)
			window.dispatchEvent(new CustomEvent<User>('user-assignments-updated', { detail: updatedUser }))

			toast({
				title: 'Profile updated',
				description: 'Your profile information has been saved.',
			})
		} catch (err) {
			console.error('❌ [Profile] Save failed:', err)
			toast({
				title: 'Update failed',
				description: err instanceof Error ? err.message : 'Failed to update profile',
				variant: 'destructive',
			})
		} finally {
			setIsSavingProfile(false)
		}
	}

	const handleChangePassword = async (values: ChangePasswordFormValues) => {
		setIsChangingPassword(true)
		try {
			const response = await api.post<BackendApiResponse<object>>('/Auth/change-password', values)
			const apiResponse = response.data
			if (!getApiSuccess(apiResponse)) {
				const errors = getApiErrors(apiResponse)
				throw new Error(errors[0] || getApiMessage(apiResponse) || 'Failed to change password')
			}

			changePasswordForm.reset()
			toast({
				title: 'Password updated',
				description: 'Your password has been changed successfully.',
			})
		} catch (err) {
			console.error('❌ [Profile] Change password failed:', err)
			toast({
				title: 'Password change failed',
				description: err instanceof Error ? err.message : 'Failed to change password',
				variant: 'destructive',
			})
		} finally {
			setIsChangingPassword(false)
		}
	}

	if (isLoading) {
		return (
			<div className="h-full">
				<div className="flex items-center justify-between border-b px-6 py-4">
					<div>
						<h1 className="text-2xl font-semibold">Profile</h1>
						<p className="text-sm text-muted-foreground">Loading your profile…</p>
					</div>
				</div>
				<div className="p-4 md:p-6">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center gap-3">
								<Loader2 className="h-5 w-5 animate-spin" />
								<span className="text-sm text-muted-foreground">Loading…</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	if (!user) {
		return (
			<div className="h-full">
				<div className="flex items-center justify-between border-b px-6 py-4">
					<div>
						<h1 className="text-2xl font-semibold">Profile</h1>
						<p className="text-sm text-muted-foreground">You are not logged in.</p>
					</div>
				</div>
			</div>
		)
	}

  return (
		<div className="h-full">
			<div className="flex items-center justify-between border-b px-6 py-4">
				<div>
					<h1 className="text-2xl font-semibold">Profile</h1>
					<p className="text-sm text-muted-foreground">Update your personal information and profile photo</p>
				</div>
			</div>

			<div className="p-4 md:p-6 space-y-6">
				<Tabs defaultValue="personal" className="w-full">
					<TabsList className="mb-4">
						<TabsTrigger value="personal">Personal</TabsTrigger>
						<TabsTrigger value="security">Security</TabsTrigger>
					</TabsList>

					<TabsContent value="personal" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Profile Photo</CardTitle>
								<CardDescription>
									{employeeId
										? 'This photo is linked to your employee profile.'
										: 'Upload works now and is saved locally until your account is linked to an employee record.'}
								</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-col sm:flex-row items-center gap-6">
								<div className="relative">
									<Avatar className="h-24 w-24 border-2 border-primary/10">
										<AvatarImage src={displayPhotoFile} alt={`${user.firstName} ${user.lastName}`} />
										<AvatarFallback className="bg-primary/10 text-primary">
											{isUploadingPhoto || employeeLoading ? (
												<Loader2 className="h-8 w-8 animate-spin" />
											) : (
												<UserIcon className="h-8 w-8" />
											)}
										</AvatarFallback>
									</Avatar>

									<Button
										size="icon"
										className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-lg"
										onClick={triggerFileInput}
										disabled={isUploadingPhoto || (employeeId ? employeeLoading : false)}
										aria-label="Change profile photo"
									>
										<Camera className="h-4 w-4" />
									</Button>

									<input
										type="file"
										ref={fileInputRef}
										className="hidden"
										accept="image/*"
										onChange={handleProfilePhotoSelected}
									/>
								</div>

								<div className="space-y-2 text-center sm:text-left">
									<h3 className="font-medium">Upload a new photo</h3>
									<p className="text-sm text-muted-foreground">
										JPG/PNG/GIF/WEBP. Max size 2MB.
									</p>
									{employeeError && (
										<Alert variant="destructive" className="py-2">
											<p className="text-sm">{employeeError}</p>
										</Alert>
									)}
									<Button
										variant="outline"
										size="sm"
										onClick={triggerFileInput}
										disabled={isUploadingPhoto || (employeeId ? employeeLoading : false)}
									>
										{isUploadingPhoto ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Uploading…
											</>
										) : (
											'Choose file'
										)}
									</Button>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Personal Information</CardTitle>
								<CardDescription>These details are used across the application.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<form className="space-y-4" onSubmit={profileForm.handleSubmit(handleSaveProfile)}>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="firstName">First Name</Label>
											<Input id="firstName" {...profileForm.register('firstName')} disabled={isSavingProfile} />
											{profileForm.formState.errors.firstName?.message && (
												<p className="text-sm text-red-600">{profileForm.formState.errors.firstName.message}</p>
											)}
										</div>
										<div className="space-y-2">
											<Label htmlFor="lastName">Last Name</Label>
											<Input id="lastName" {...profileForm.register('lastName')} disabled={isSavingProfile} />
											{profileForm.formState.errors.lastName?.message && (
												<p className="text-sm text-red-600">{profileForm.formState.errors.lastName.message}</p>
											)}
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="email">Email</Label>
											<Input id="email" value={user.email} readOnly aria-readonly="true" />
										</div>
										<div className="space-y-2">
											<Label htmlFor="phoneNumber">Phone Number</Label>
											<Input id="phoneNumber" {...profileForm.register('phoneNumber')} disabled={isSavingProfile} />
											{profileForm.formState.errors.phoneNumber?.message && (
												<p className="text-sm text-red-600">{profileForm.formState.errors.phoneNumber.message}</p>
											)}
										</div>
									</div>

									<Separator />

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="jobTitle">Job Title</Label>
											<Input id="jobTitle" {...profileForm.register('jobTitle')} disabled={isSavingProfile} />
											{profileForm.formState.errors.jobTitle?.message && (
												<p className="text-sm text-red-600">{profileForm.formState.errors.jobTitle.message}</p>
											)}
										</div>
									</div>

									<Button type="submit" className="mt-2" disabled={isSavingProfile}>
										{isSavingProfile ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Saving…
											</>
										) : (
											<>
												<Save className="mr-2 h-4 w-4" />
												Save Changes
											</>
										)}
									</Button>
								</form>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="security" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Change Password</CardTitle>
								<CardDescription>Use a strong password you don’t reuse elsewhere.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<form className="space-y-4" onSubmit={changePasswordForm.handleSubmit(handleChangePassword)}>
									<div className="space-y-2">
										<Label htmlFor="currentPassword">Current Password</Label>
										<Input id="currentPassword" type="password" {...changePasswordForm.register('currentPassword')} disabled={isChangingPassword} />
										{changePasswordForm.formState.errors.currentPassword?.message && (
											<p className="text-sm text-red-600">{changePasswordForm.formState.errors.currentPassword.message}</p>
										)}
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="newPassword">New Password</Label>
											<Input id="newPassword" type="password" {...changePasswordForm.register('newPassword')} disabled={isChangingPassword} />
											{changePasswordForm.formState.errors.newPassword?.message && (
												<p className="text-sm text-red-600">{changePasswordForm.formState.errors.newPassword.message}</p>
											)}
										</div>
										<div className="space-y-2">
											<Label htmlFor="confirmNewPassword">Confirm New Password</Label>
											<Input id="confirmNewPassword" type="password" {...changePasswordForm.register('confirmNewPassword')} disabled={isChangingPassword} />
											{changePasswordForm.formState.errors.confirmNewPassword?.message && (
												<p className="text-sm text-red-600">{changePasswordForm.formState.errors.confirmNewPassword.message}</p>
											)}
										</div>
									</div>

									<Button type="submit" disabled={isChangingPassword}>
										{isChangingPassword ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Updating…
											</>
										) : (
											<>
												<KeyRound className="mr-2 h-4 w-4" />
												Update Password
											</>
										)}
									</Button>
								</form>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
  )
}

export default Profile