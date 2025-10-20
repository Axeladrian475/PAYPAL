import { Routes } from '@angular/router';
import { CatalogoComponent } from './catalogo/catalogo';
import { CarritoComponent } from './carrito/carrito'; // 1. Importa el componente del carrito

export const routes: Routes = [
  {
    path: 'catalogo',
    component: CatalogoComponent
  },
  {
    path: 'carrito', // 2. Añade la nueva ruta para el carrito
    component: CarritoComponent
  },
  {
    path: '',
    redirectTo: '/catalogo', // La página de inicio sigue siendo el catálogo
    pathMatch: 'full'
  }
];