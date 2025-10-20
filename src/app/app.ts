import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CarritoService } from './services/carrito';
import { CommonModule } from '@angular/common'; // 2. Importa CommonModule para *ngIf

@Component({
  selector: 'app-root',
  // 3. Añade RouterLink y CommonModule a los imports
  imports: [RouterOutlet, RouterLink, CommonModule], 
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  // 4. Inyecta el servicio del carrito
  private carritoService = inject(CarritoService);

  // 5. Crea una señal computada para obtener la cantidad de productos
  cantidadEnCarrito = computed(() => this.carritoService.productos().length);
}