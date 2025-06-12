import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageAccess } from '@/contexts/PageAccessContext'
import { getUser } from '@/services/auth'

const RoleBasedRedirect = () => {
  const navigate = useNavigate()
  const { currentRole } = usePageAccess()
  
  useEffect(() => {
    const user = getUser()
    
    // Only redirect if we have a valid role and user
    if (currentRole && user) {
      let redirectPath = '/admin-dashboard' // default
      
      if (user.role === 'Administrator') {
        redirectPath = '/admin-dashboard'
      } else if (user.role === 'Advantage One Officer') {
        redirectPath = '/officer-dashboard'
      } else if (user.role?.startsWith('Customer')) {
        redirectPath = '/customer-dashboard'
      }
      
      console.log('🔄 Role-based redirect to:', redirectPath)
      navigate(redirectPath, { replace: true })
    }
  }, [currentRole, navigate])
  
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
    </div>
  )
}

export default RoleBasedRedirect 