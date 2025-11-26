import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, User2 } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { usePageAccess } from '@/contexts/PageAccessContext'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types/user'

interface LoginError {
  type: 'credentials' | 'network' | 'server' | 'validation';
  message: string;
}

// Remove the roleRedirect function since we handle redirection inline now

const getErrorMessage = (error: LoginError): { title: string; message: string } => {
  switch (error.type) {
    case 'credentials':
      return {
        title: 'Authentication Failed',
        message: error.message
      };
    case 'validation':
      return {
        title: 'Invalid Input',
        message: error.message
      };
    default:
      return {
        title: 'Error',
        message: error.message
      };
  }
};

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<LoginError | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setCurrentRole } = usePageAccess()
  const { login } = useAuth()

  const validateForm = (): boolean => {
    if (!username.trim()) {
      setError({
        type: 'validation',
        message: 'Username is required'
      });
      return false;
    }
    if (!password.trim()) {
      setError({
        type: 'validation',
        message: 'Password is required'
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    console.log('🔒 Starting login process...', { username })

    if (!validateForm()) {
      console.log('❌ Form validation failed')
      return
    }

    setLoading(true)
    try {
      const loggedInUser = await login(username, password)
      
      console.log('✅ Login successful:', {
        username: loggedInUser.username,
        role: loggedInUser.role,
        timestamp: new Date().toISOString()
      })

      // Set the page access role - use role if pageAccessRole is not available
      const roleToSet = loggedInUser.role
      console.log('🔑 Setting role for page access:', roleToSet)
      console.log('🔍 Full user object from login:', loggedInUser)
      
      // Set role (don't await - let it load in background)
      setCurrentRole(roleToSet).catch(err => {
        console.warn('⚠️ [LoginPage] Error setting role:', err);
      })

      // All users now go to /dashboard
      const redirectPath = '/dashboard'
      console.log('🔄 Redirecting to:', redirectPath)
      
      // Use replace to prevent going back to login page
      navigate(redirectPath, { replace: true })
    } catch (err) {
      console.error('❌ Login error:', err)
      setError({
        type: 'credentials',
        message: err instanceof Error ? err.message : 'An error occurred during login'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100/80 via-purple-50/80 to-pink-100/80">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold text-purple-700">
            <User2 className="h-6 w-6 text-purple-500" />
            Sign In
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <h3 className="font-medium">{getErrorMessage(error).title}</h3>
                <p className="text-sm">{getErrorMessage(error).message}</p>
              </Alert>
            )}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          {/* Development Helper - Test Credentials */}
          {import.meta.env.DEV && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Backend Test Credentials (Dev Only)</h3>
              <div className="text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-green-700">✅ Backend Connected - Use These Credentials:</div>
                <div className="mt-2"><strong>🔧 Administrator:</strong></div>
                <div>• Email: admin@advantageone.com</div>
                <div>• Password: Admin123!@#</div>
                <div className="mt-2"><strong>👮 Advantage One Officer:</strong></div>
                <div>• Email: officer@advantageone.com</div>
                <div>• Password: Test123!@#</div>
                <div className="mt-2"><strong>🏢 Customer Site Manager:</strong></div>
                <div>• Email: manager@customer.com</div>
                <div>• Password: Test123!@#</div>
                <div className="mt-2 text-xs text-orange-600">
                  <strong>Note:</strong> These are the backend API credentials.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 