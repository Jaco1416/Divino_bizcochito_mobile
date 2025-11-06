import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

export type RecipeFromDB = {
  id: number | string;
  titulo?: string | null;
  autor?: string | null;
  descripcion?: string | null;
  imagenUrl?: string | null;
};

export type RootStackParamList = {
  Login: undefined;
  Registro: undefined;
  Home: undefined;
  Profile: undefined;
  Recetas: undefined; // usa undefined si no pasas params
};

// Tipo para useNavigation en componentes como el Navbar
export type AppNavigation = NativeStackNavigationProp<RootStackParamList>;

// Tipo para usar useRoute en RecetasView
export type RecetasRouteProp = RouteProp<RootStackParamList, 'Recetas'>;