import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Theme } from '../types'

interface ChatStore {
  theme: Theme

  // 应用状态相关操作
  setTheme: (theme: Theme) => void
}

export const useAppConfigStore = create<ChatStore>()(
  persist(
    set => ({
      theme: 'light',

      // 应用状态相关操作
      setTheme: theme => {
        set({ theme })
        document.documentElement.classList.toggle('dark', theme === 'dark')
      },
    }),
    {
      name: 'app-config-storage',
      partialize: state => ({
        theme: state.theme,
      }),
    }
  )
)
