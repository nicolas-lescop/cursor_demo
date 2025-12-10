import { useState } from 'react'

const STORAGE_KEY = 'prompt-modal-expanded'

export function useModalExpandPreference() {
    const [isExpanded, setIsExpanded] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY)
            return stored === 'true'
        }
        return false
    })

    const toggleExpanded = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, String(isExpanded))
        }

        setIsExpanded(prev => !prev)
    }

    return { isExpanded, toggleExpanded }
}
