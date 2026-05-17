import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (username, password) => {
        set({ isLoading: true })
        const { data } = await api.post('/auth/login', { username, password })
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
        set({ user: data.user, token: data.token, isLoading: false })
        return data.user
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization']
        set({ user: null, token: null })
      },

      initAuth: () => {
        const { token } = get()
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
      },
    }),
    {
      name: 'portgate-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
