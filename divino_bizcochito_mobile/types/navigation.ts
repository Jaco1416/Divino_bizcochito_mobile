import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

export type RecipeFromDB = {
  id: number | string;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  autor?: string | null;
  categoria?: string | null;
  ingredientes?: string | null;
  pasos?: string | null;
};

export type RootStackParamList = {
  Login: undefined;
  Registro: undefined;
  Home: undefined;
  Profile: undefined;
  Recetas: { lockBack?: boolean } | undefined;
  CrearReceta: undefined;
  DetalleReceta: {
    id: number | string;
    recipe?: RecipeFromDB;
  };
};

export type AppNavigation = NativeStackNavigationProp<RootStackParamList>;
export type RecetasRouteProp = RouteProp<RootStackParamList, 'Recetas'>;
export type DetalleRecetaRouteProp = RouteProp<RootStackParamList, 'DetalleReceta'>;