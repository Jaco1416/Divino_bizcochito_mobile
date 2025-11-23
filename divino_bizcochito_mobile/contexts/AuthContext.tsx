"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../libs/supabaseClient";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Perfil {
  id: string;
  nombre: string;
  rol: "admin" | "cliente";
  imagen: string;
  telefono: string;
}

interface AuthContextType {
  user: any | null;
  perfil: Perfil | null;
  loading: boolean;
  handleLogout: () => Promise<void>;
  handleLogin: (email: string, password: string) => Promise<{ error: any }>;
  handleRegister: (email: string, password: string, nombre: string, telefono: string) => Promise<{ error: any }>;
  refreshPerfil: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  perfil: null,
  loading: true,
  handleLogout: async () => {},
  handleLogin: async () => ({ error: null }),
  handleRegister: async () => ({ error: null }),
  refreshPerfil: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Función para obtener el perfil desde la BD
  
  const fetchPerfil = async (userId: string) => {
    const { data, error } = await supabase
      .from("Perfiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("❌ Error al obtener perfil:", error);
      return null;
    }

    console.log("✅ Perfil obtenido:", data);
    return data;
  };

  // 🔹 Guardar sesión en AsyncStorage
  const saveSession = async (user: any, perfil: Perfil | null) => {
    try {
      await AsyncStorage.setItem('@user_session', JSON.stringify({ user, perfil }));
      console.log("✅ Sesión guardada en AsyncStorage");
    } catch (error) {
      console.error("❌ Error al guardar sesión:", error);
    }
  };

  // 🔹 Cargar sesión desde AsyncStorage
  const loadSession = async () => {
    try {
      const sessionData = await AsyncStorage.getItem('@user_session');
      if (sessionData) {
        const { user, perfil } = JSON.parse(sessionData);
        console.log("✅ Sesión cargada desde AsyncStorage");
        return { user, perfil };
      }
      return null;
    } catch (error) {
      console.error("❌ Error al cargar sesión:", error);
      return null;
    }
  };

  // 🔹 Limpiar sesión de AsyncStorage
  const clearSession = async () => {
    try {
      await AsyncStorage.removeItem('@user_session');
      console.log("✅ Sesión eliminada de AsyncStorage");
    } catch (error) {
      console.error("❌ Error al limpiar sesión:", error);
    }
  };

  // 🔹 Cargar sesión inicial
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      
      // Verificar sesión con Supabase primero
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Si hay sesión en Supabase, usarla
        const perfilData = await fetchPerfil(session.user.id);
        setUser(session.user);
        setPerfil(perfilData);
        await saveSession(session.user, perfilData);
      } else {
        // Si no hay sesión en Supabase, intentar cargar desde AsyncStorage
        const savedSession = await loadSession();
        if (savedSession) {
          setUser(savedSession.user);
          setPerfil(savedSession.perfil);
        } else {
          setUser(null);
          setPerfil(null);
        }
      }

      setLoading(false);
    };

    initialize();

    // 🔹 Suscribirse a cambios de sesión (login / logout / refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const perfilData = await fetchPerfil(session.user.id);
        setUser(session.user);
        setPerfil(perfilData);
        await saveSession(session.user, perfilData);
      } else {
        // Solo limpiar si es un evento SIGNED_OUT explícito
        if (_event === 'SIGNED_OUT') {
          setUser(null);
          setPerfil(null);
          await clearSession();
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 🔹 Cerrar sesión
  const handleLogout = async () => {
    console.log("🔹 handleLogout ejecutado");
    await supabase.auth.signOut();
    setUser(null);
    setPerfil(null);
    await clearSession();
  };

  // 🔹 Refrescar perfil manualmente
  const refreshPerfil = async () => {
    if (!user?.id) return;
    const perfilData = await fetchPerfil(user.id);
    setPerfil(perfilData);
    await saveSession(user, perfilData);
  };

  // 🔹 Iniciar sesión
  const handleLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Error al iniciar sesión:", error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error("❌ Error inesperado:", error);
      return { error };
    }
  };

  // 🔹 Registrar usuario
  const handleRegister = async (email: string, password: string, nombre: string, telefono: string) => {
    try {
      // Crear usuario en Supabase Auth (el trigger creará automáticamente el perfil)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
            telefono,
          },
        },
      });

      if (error) {
        console.error("❌ Error al registrar usuario:", error);
        return { error };
      }

      console.log("✅ Usuario registrado correctamente (perfil creado por trigger):", data);
      return { error: null };
    } catch (error) {
      console.error("❌ Error inesperado:", error);
      return { error };
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, perfil, loading, handleLogout, handleLogin, handleRegister, refreshPerfil }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
