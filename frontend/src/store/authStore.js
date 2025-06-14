import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const useAuthStore = create(
  persist(
    (set) => ({
      ...initialState,
      setUser: (user) => {
        console.log('Guardando usuario:', user);
        set({ user, isAuthenticated: !!user });
      },
      setToken: (token) => {
        console.log('Guardando token:', token);
        if (!token || token === 'fake-token-123') {
          console.log('Token inválido, limpiando estado');
          set(initialState);
          sessionStorage.removeItem('auth-storage');
          return;
        }
        set({ token, isAuthenticated: !!token });
      },
      logout: () => {
        console.log('Cerrando sesión');
        set(initialState);
        // Limpiar el sessionStorage
        sessionStorage.removeItem('auth-storage');
      },
      checkAuth: () => {
        const state = useAuthStore.getState();
        if (!state.token || state.token === 'fake-token-123') {
          console.log('Token inválido en checkAuth, limpiando estado');
          set(initialState);
          sessionStorage.removeItem('auth-storage');
          return false;
        }
        return true;
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const selectUser = (state) => state.user;
export const selectToken = (state) => state.token;
export const selectIsAuthenticated = (state) => state.isAuthenticated;

export default useAuthStore; 