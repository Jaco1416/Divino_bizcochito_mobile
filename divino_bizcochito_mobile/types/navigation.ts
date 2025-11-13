import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import { Float } from 'react-native/Libraries/Types/CodegenTypes'

export type RecipeFromDB = {
  id: number | string
  titulo: string
  descripcion: string
  imagenUrl: string
  autor?: string | null
  categoria?: string | null
  ingredientes?: string | null
  pasos?: string | null
}

export type ProductFromDB = {
  id: string
  nombre: string
  descripcion: string
  precio: number
  toppingId: string
  rellenoId: string
  categoriaId: string
  imagenUrl: string
}

export type RootStackParamList = {
  Login: undefined
  Registro: undefined
  Home: undefined
  Profile: undefined
  Recetas: { lockBack?: boolean } | undefined
  CrearReceta: undefined
  DetalleReceta: {
    id: number | string
    recipe?: RecipeFromDB
  }
  Catalogo: undefined
  DetalleProducto: {
    id: string
    product?: ProductFromDB
  }
  Carrito: undefined
  PagoView: {
    paymentUrl: string;
    token: string;
  };
  ResultadoPago: {
    estado: string;
  };
  PedidoDetalle: {
    id: number | string;
  };
}

export type AppNavigation = NativeStackNavigationProp<RootStackParamList>
export type RecetasRouteProp = RouteProp<RootStackParamList, 'Recetas'>
export type DetalleRecetaRouteProp = RouteProp<
  RootStackParamList,
  'DetalleReceta'
>
