import { useEffect, useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { USER_DATA } from '@/constants/header'
import { sessionStore } from '@/state/sessionStore'
import { userProfilePhotoCache } from '@/utils/userProfilePhotoCache'
import type { User } from '@/types/user'

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showBorder?: boolean;
}

/**
 * A reusable component for displaying the user's avatar consistently across the application
 */
export function UserAvatar({ 
  size = 'md', 
  className = '',
  showBorder = false
}: UserAvatarProps) {
	const [user, setUser] = useState<User | null>(() => sessionStore.getUser())

  // Map size names to actual size classes
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14'
  };
  
  const borderClass = showBorder ? 'border border-blue-700' : '';

	useEffect(() => {
		return sessionStore.subscribe(setUser)
	}, [])

	const userId = user?.id ? String(user.id) : null

	const displayName = useMemo(() => {
		const name = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
		return name || user?.username || USER_DATA.name
	}, [user?.firstName, user?.lastName, user?.username])

	const initials = useMemo(() => {
		const first = (user?.firstName ?? '').trim()
		const last = (user?.lastName ?? '').trim()
		const letters = `${first.slice(0, 1)}${last.slice(0, 1)}`.trim()
		if (letters) return letters.toUpperCase()
		const username = (user?.username ?? '').trim()
		if (username) return username.slice(0, 2).toUpperCase()
		return USER_DATA.initials
	}, [user?.firstName, user?.lastName, user?.username])

	const [photoSrc, setPhotoSrc] = useState<string>(() => {
		if (!userId) return USER_DATA.avatar
		return userProfilePhotoCache.get(userId) || USER_DATA.avatar
	})

	useEffect(() => {
		if (!userId) {
			setPhotoSrc(USER_DATA.avatar)
			return
		}
		setPhotoSrc(userProfilePhotoCache.get(userId) || USER_DATA.avatar)
	}, [userId])

	useEffect(() => {
		const handlePhotoUpdated = (event: Event) => {
			const custom = event as CustomEvent<{ userId?: string }>
			const updatedUserId = custom.detail?.userId
			if (!updatedUserId || updatedUserId !== userId) return
			setPhotoSrc(userProfilePhotoCache.get(updatedUserId) || USER_DATA.avatar)
		}

		window.addEventListener('user-profile-photo-updated', handlePhotoUpdated as EventListener)
		return () => window.removeEventListener('user-profile-photo-updated', handlePhotoUpdated as EventListener)
	}, [userId])

  return (
    <Avatar className={`${sizeClasses[size]} ${borderClass} ${className}`}>
      <AvatarImage 
        src={photoSrc} 
        alt={displayName} 
        className="object-cover"
      />
      <AvatarFallback className="bg-blue-700 text-white">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
} 