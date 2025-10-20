import { Component, OnInit, inject } from '@angular/core';
import { Product } from '../models/product';
import { ProductoService } from '../services/producto';
import { CarritoService } from '../services/carrito';
import { CarritoComponent } from '../carrito/carrito';
import { NgFor, AsyncPipe, NgIf } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  imports: [NgFor, AsyncPipe, NgIf, CarritoComponent], // ← Añadir CarritoComponent
  selector: 'app-catalogo',
  templateUrl: './catalogo.html',
  styleUrls: ['./catalogo.css'],
  standalone: true
})
export class CatalogoComponent implements OnInit {
  productos$!: Observable<Product[]>;
  error: string | null = null;
  
  private carritoService = inject(CarritoService); // ← Inyectar servicio

  constructor(private productoService: ProductoService) { }

  ngOnInit(): void {
    this.productos$ = this.productoService.getProductos();
    
    this.productos$.subscribe({
      next: (productos) => {
        console.log('Productos cargados:', productos);
      },
      error: (err) => {
        console.error('Error:', err);
        this.error = err.message;
      }
    });
  }

  // Nuevo método para agregar al carrito
  agregarAlCarrito(producto: Product): void {
    this.carritoService.agregar(producto);
    console.log('Producto agregado al carrito:', producto.nombre);
  }

  onImageError(event: any): void {
    console.log('Error cargando imagen:', event.target.src);
    event.target.src = 'images/placeholder.jpg';
  }
}