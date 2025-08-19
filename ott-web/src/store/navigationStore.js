import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useNavigationStore = create(
  persist(
    (set, get) => ({
      // Mobile navigation
      isMobileNavOpen: false,
      openMobileNav: () => set({ isMobileNavOpen: true }),
      closeMobileNav: () => set({ isMobileNavOpen: false }),
      toggleMobileNav: () => set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
      
      // Command palette
      isCommandOpen: false,
      openCommand: () => set({ isCommandOpen: true }),
      closeCommand: () => set({ isCommandOpen: false }),
      toggleCommand: () => set((state) => ({ isCommandOpen: !state.isCommandOpen })),
      
      // Profile menu
      isProfileMenuOpen: false,
      openProfileMenu: () => set({ isProfileMenuOpen: true }),
      closeProfileMenu: () => set({ isProfileMenuOpen: false }),
      toggleProfileMenu: () => set((state) => ({ isProfileMenuOpen: !state.isProfileMenuOpen })),
      
      // Navigation blur effect
      isNavigationBlurActive: false,
      activateNavigationBlur: () => set({ isNavigationBlurActive: true }),
      deactivateNavigationBlur: () => set({ isNavigationBlurActive: false }),
      
      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      
      // Language
      language: 'en',
      setLanguage: (language) => set({ language }),
      
      // User authentication (simplified)
      isAuthed: false,
      setAuth: (isAuthed) => set({ isAuthed }),
      
      // Reset all navigation state
      resetNavigation: () => set({
        isMobileNavOpen: false,
        isCommandOpen: false,
        isProfileMenuOpen: false,
        isNavigationBlurActive: false,
      }),
    }),
    {
      name: 'navigation-storage',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
      }),
    }
  )
)
