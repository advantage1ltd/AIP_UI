/**
 * Public login and password reset entry.
 * Flow: credential submit via auth service → session store → role-based redirect.
 */
import { useState } from 'react'
import { isAxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Mail, Lock, ShieldCheck, ArrowRight, LifeBuoy } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { usePageAccess } from '@/contexts/PageAccessContext'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/config/api'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'

interface LoginError {
	type: 'credentials' | 'network' | 'server' | 'validation'
	message: string
}

const loginSchema = z.object({
	username: z.string().trim().min(1, 'Email address is required'),
	password: z.string().trim().min(1, 'Password is required'),
})

const twoFactorSchema = z.object({
	code: z.string().trim().min(4, 'Verification code is required'),
})
const debugLogsEnabled = import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGS === 'true'

const getErrorMessage = (
	error: LoginError
): {
	title: string
	message: string
} => {
	switch (error.type) {
		case 'credentials':
			return {
				title: 'Authentication failed',
				message: error.message,
			}
		case 'validation':
			return {
				title: 'Invalid input',
				message: error.message,
			}
		default:
			return {
				title: 'Error',
				message: error.message,
			}
	}
}

export default function LoginPage() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState<LoginError | null>(null)
	const [loading, setLoading] = useState(false)
	const [twoFactorCode, setTwoFactorCode] = useState('')
	const [twoFactorToken, setTwoFactorToken] = useState<string | null>(null)
	const [twoFactorDestination, setTwoFactorDestination] = useState<string | null>(null)
	const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
	const navigate = useNavigate()
	const { setCurrentRole } = usePageAccess()
	const { login, verifyTwoFactor, resendTwoFactorCode } = useAuth()
	useToast()

	const validateForm = (): boolean => {
		const validationResult = loginSchema.safeParse({
			username,
			password,
		})

		if (!validationResult.success) {
			setError({
				type: 'validation',
				message: validationResult.error.issues[0]?.message ?? 'Please provide valid credentials',
			})
			return false
		}

		return true
	}

	const handleTogglePasswordVisibility = () => {
		setShowPassword((prev) => !prev)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		if (!validateForm()) {
			return
		}

		setLoading(true)
		try {
			const loginResult = await login(username, password)

			if ('user' in loginResult) {
				const loggedInUser = loginResult.user

				// Set the page access role - use role if pageAccessRole is not available
				const roleToSet = loggedInUser.role

				// Set role (don't await - let it load in background)
				setCurrentRole(roleToSet).catch((err) => {
					if (debugLogsEnabled) {
						console.warn('⚠️ [LoginPage] Error setting role:', err)
					}
				})

				// All users now go to /dashboard
				const redirectPath = '/dashboard'

				// Use replace to prevent going back to login page
				navigate(redirectPath, { replace: true })
				return
			}

			setRequiresTwoFactor(true)
			setTwoFactorToken(loginResult.twoFactorToken)
			setTwoFactorDestination(loginResult.twoFactorDestination ?? null)
			setTwoFactorCode('')
		} catch (err) {
			if (debugLogsEnabled) {
				console.error('❌ Login error:', err)
			}
			setError({
				type: 'credentials',
				message: err instanceof Error ? err.message : 'An error occurred during login',
			})
		} finally {
			setLoading(false)
		}
	}

	const handleVerifyTwoFactor = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		const validationResult = twoFactorSchema.safeParse({ code: twoFactorCode })
		if (!validationResult.success) {
			setError({
				type: 'validation',
				message: validationResult.error.issues[0]?.message ?? 'Please provide a valid verification code',
			})
			return
		}
		if (!twoFactorToken) {
			setError({
				type: 'credentials',
				message: 'Verification session expired. Please sign in again.',
			})
			setRequiresTwoFactor(false)
			return
		}

		setLoading(true)
		try {
			const loggedInUser = await verifyTwoFactor(twoFactorToken, twoFactorCode)
			const roleToSet = loggedInUser.role
			setCurrentRole(roleToSet).catch((err) => {
				if (debugLogsEnabled) {
					console.warn('⚠️ [LoginPage] Error setting role:', err)
				}
			})
			navigate('/dashboard', { replace: true })
		} catch (err) {
			setError({
				type: 'credentials',
				message: err instanceof Error ? err.message : 'Failed to verify code',
			})
		} finally {
			setLoading(false)
		}
	}

	const handleResendCode = async () => {
		if (!twoFactorToken || loading) return
		setLoading(true)
		setError(null)
		try {
			await resendTwoFactorCode(twoFactorToken)
		} catch (err) {
			setError({
				type: 'server',
				message: err instanceof Error ? err.message : 'Unable to resend verification code',
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
			<div
				className="absolute inset-0 bg-cover bg-center bg-no-repeat"
				style={{ backgroundImage: 'url("/Login-bg.png")' }}
				aria-hidden="true"
			/>
			<div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/82 to-slate-950/95" aria-hidden="true" />
			<div
				className="absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(56,189,248,0.14),transparent_42%),radial-gradient(circle_at_84%_78%,rgba(59,130,246,0.16),transparent_40%)]"
				aria-hidden="true"
			/>

			<div className="relative z-10 flex min-h-screen flex-col">
				<header className="flex items-center justify-between px-4 py-4 sm:px-8 sm:py-5 lg:px-12">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur">
							<ShieldCheck className="h-5 w-5 text-cyan-200" />
						</div>
						<div>
							<p className="text-sm font-semibold leading-none text-white">Advantage One</p>
							<p className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-cyan-100/80 sm:text-[11px]">
								Crime Intelligence Platform
							</p>
						</div>
					</div>

					<div className="hidden items-center gap-4 sm:flex">
						<div className="flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200 backdrop-blur">
							<span className="relative flex h-2 w-2">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
								<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
							</span>
							All systems operational
						</div>
						<a
							href="mailto:ops@advantage1.co.uk"
							className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
						>
							<LifeBuoy className="h-3.5 w-3.5" />
							Need help?
						</a>
					</div>
				</header>

				<main className="flex flex-1 items-center px-4 pb-8 pt-4 sm:px-8 lg:px-12">
					<div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-8 xl:gap-12">
						<aside className="order-2 rounded-3xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-sm sm:p-7 lg:order-1 lg:min-h-[560px] lg:p-10">
							<div className="flex h-full flex-col justify-between">
								<div>
									<span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100">
										Restricted access
									</span>
									<h1 className="mt-5 text-2xl font-semibold leading-tight text-white sm:text-3xl xl:text-4xl">
										Unified crime intelligence for faster response decisions
									</h1>
									<p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 sm:text-[15px]">
										Sign in to monitor incidents, coordinate field teams, and review intelligence trends from one secure operational workspace.
									</p>
								</div>
								<div className="mt-8 grid gap-3 sm:grid-cols-2 lg:mt-10">
									<div className="rounded-xl border border-white/10 bg-slate-900/55 p-4">
										<p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/80">Platform</p>
										<p className="mt-1 text-sm font-medium text-white">Crime Intelligence Suite</p>
									</div>
									<div className="rounded-xl border border-white/10 bg-slate-900/55 p-4">
										<p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/80">Security</p>
										<p className="mt-1 text-sm font-medium text-white">MFA and encrypted sessions</p>
									</div>
									<div className="rounded-xl border border-white/10 bg-slate-900/55 p-4 sm:col-span-2">
										<p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/80">Operational support</p>
										<a
											href="mailto:support@advantageone.com"
											className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-cyan-100 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
										>
											<LifeBuoy className="h-4 w-4" />
											ops@advantage1.co.uk
										</a>
									</div>
								</div>
							</div>
						</aside>

						<section className="order-1 lg:order-2" aria-label="Sign in">
							<div className="mx-auto w-full max-w-[380px] rounded-2xl border border-white/15 bg-white/95 p-5 text-slate-900 shadow-[0_24px_90px_rgba(2,6,23,0.55)] backdrop-blur-xl sm:max-w-[400px] sm:p-7 lg:max-w-[420px] lg:p-8">
								<div className="mb-6 flex items-center justify-center">
									<div className="w-full max-w-[260px] rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
										<img
											src="/AdvantageOne.svg"
											alt="Advantage One Security"
											className="h-auto w-full object-contain"
										/>
									</div>
								</div>

								<div className="mb-6 text-center">
									<h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[30px]">Sign in to continue</h2>
									<p className="mt-2 text-sm leading-6 text-slate-600">
										Use your work account credentials to access the platform.
									</p>
								</div>

								{error && (
									<Alert variant="destructive" className="mb-5">
										<h3 className="font-medium">{getErrorMessage(error).title}</h3>
										<p className="text-sm" role="alert" aria-live="assertive">
											{getErrorMessage(error).message}
										</p>
									</Alert>
								)}

								{!requiresTwoFactor ? (
									<form className="space-y-4" onSubmit={handleSubmit}>
										<div className="space-y-1.5">
											<label htmlFor="username" className="text-sm font-medium text-slate-700">
												Email address
											</label>
											<div className="relative">
												<Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
												<Input
													id="username"
													name="username"
													type="text"
													autoComplete="username"
													placeholder="name@company.com"
													value={username}
													onChange={(e) => setUsername(e.target.value)}
													className="h-11 w-full rounded-lg border-slate-200 bg-slate-50 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-blue-500"
													disabled={loading}
												/>
											</div>
										</div>

										<div className="space-y-1.5">
											<label htmlFor="password" className="text-sm font-medium text-slate-700">
												Password
											</label>
											<div className="relative">
												<Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
												<Input
													id="password"
													name="password"
													type={showPassword ? 'text' : 'password'}
													autoComplete="current-password"
													placeholder="Enter your password"
													value={password}
													onChange={(e) => setPassword(e.target.value)}
													className="h-11 w-full rounded-lg border-slate-200 bg-slate-50 pl-10 pr-10 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-blue-500"
													disabled={loading}
												/>
												<button
													type="button"
													onClick={handleTogglePasswordVisibility}
													className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
													aria-label={showPassword ? 'Hide password' : 'Show password'}
													disabled={loading}
												>
													{showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
												</button>
											</div>
										</div>

										<Button
											type="submit"
											className="group h-11 w-full rounded-lg bg-slate-900 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition-all hover:bg-slate-800"
											disabled={loading}
										>
											{loading ? (
												<div className="flex items-center justify-center gap-2">
													<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
													Signing in...
												</div>
											) : (
												<span className="inline-flex items-center justify-center gap-2">
													Sign in
													<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
												</span>
											)}
										</Button>
									</form>
								) : (
									<form className="space-y-4" onSubmit={handleVerifyTwoFactor}>
										<div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
											A verification code was sent to {twoFactorDestination ?? 'your email'}.
										</div>
										<div className="space-y-1.5">
											<label htmlFor="twoFactorCode" className="text-sm font-medium text-slate-700">
												Verification code
											</label>
											<Input
												id="twoFactorCode"
												name="twoFactorCode"
												type="text"
												inputMode="numeric"
												autoComplete="one-time-code"
												placeholder="Enter code"
												value={twoFactorCode}
												onChange={(e) => setTwoFactorCode(e.target.value)}
												className="h-11 w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-blue-500"
												disabled={loading}
											/>
										</div>
										<Button
											type="submit"
											className="group h-11 w-full rounded-lg bg-slate-900 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition-all hover:bg-slate-800"
											disabled={loading}
										>
											{loading ? 'Verifying...' : 'Verify and sign in'}
										</Button>
										<div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
											<Button type="button" variant="outline" className="h-10 flex-1" onClick={handleResendCode} disabled={loading}>
												Resend code
											</Button>
											<Button
												type="button"
												variant="ghost"
												className="h-10 flex-1"
												onClick={() => {
													setRequiresTwoFactor(false)
													setTwoFactorToken(null)
													setTwoFactorCode('')
													setTwoFactorDestination(null)
												}}
												disabled={loading}
											>
												Back
											</Button>
										</div>
									</form>
								)}

								<div className="mt-6 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-[11px] text-slate-500">
									<ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
									<span>Encrypted connection · Authorised users only</span>
								</div>
							</div>
						</section>
					</div>
				</main>

				<footer className="bg-[#080D1F] px-4 pb-6 pt-4 sm:px-8 lg:px-12">
					<div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 text-[11px] text-slate-400 sm:flex-row">
						<p>© {new Date().getFullYear()} Advantage One Security. All rights reserved.</p>
						<div className="flex items-center gap-4">
							<a className="transition hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D1F]" href="#privacy">
								Privacy
							</a>
							<a className="transition hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D1F]" href="#terms">
								Terms
							</a>
							<a className="transition hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D1F]" href="#security">
								Security
							</a>
						</div>
					</div>
				</footer>
			</div>

		</div>
	)
}