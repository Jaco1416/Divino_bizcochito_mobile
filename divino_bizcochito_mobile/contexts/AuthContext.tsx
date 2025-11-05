"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../libs/supabaseClient";

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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  perfil: null,
  loading: true,
  handleLogout: async () => {},
  handleLogin: async () => ({ error: null }),
  handleRegister: async () => ({ error: null }),
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

  // 🔹 Cargar sesión inicial
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const perfilData = await fetchPerfil(session.user.id);
        setUser(session.user);
        setPerfil(perfilData);
      } else {
        setUser(null);
        setPerfil(null);
      }

      setLoading(false);
    };

    initialize();

    // 🔹 Suscribirse a cambios de sesión (login / logout / refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const perfilData = await fetchPerfil(session.user.id);
        setPerfil(perfilData);
      } else {
        setUser(null);
        setPerfil(null);
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

      console.log("✅ Sesión iniciada:", data);
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
    <AuthContext.Provider value={{ user, perfil, loading, handleLogout, handleLogin, handleRegister }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
