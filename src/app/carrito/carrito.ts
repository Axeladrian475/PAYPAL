import { Component, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CarritoService } from '../services/carrito';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { NgxPayPalModule, IOnApproveCallbackData } from 'ngx-paypal';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, NgxPayPalModule],
  templateUrl: 'carrito.html',
  styleUrls: ['carrito.css']
})
export class CarritoComponent {
  private carritoService = inject(CarritoService);
  private http = inject(HttpClient);

  carrito = this.carritoService.productos;
  total = computed(() => this.carritoService.total());
  productosConCantidad = computed(() => this.carritoService.obtenerProductosConCantidad());

  public payPalConfig?: any;

  ngOnInit(): void {
    this.initConfig();
  }

  private initConfig(): void {
    this.payPalConfig = {
      currency: 'MXN',
      clientId: 'Aa926d9SPXMrJB-1NmJWP6NjQyvTR2IRX-ed39gGa29inrex5dDeV8Evk2VsBYZpMWnu2OxC2uPMdGAu', 
      createOrderOnServer: (data: any) => {
        return this.http.post<{ id: string }>('http://localhost:4000/api/orders/create-order', {
          total: this.total()
        }).toPromise().then(order => {
          // SOLUCIÓN 1: Añadir una comprobación para 'order'
          if (order) {
            return order.id;
          }
          // Si 'order' es undefined, lanzamos un error para detener el proceso.
          throw new Error("No se pudo obtener el ID de la orden del servidor.");
        });
      },
      onApprove: (data: IOnApproveCallbackData, actions: any) => { // SOLUCIÓN 2: Añadir tipo a 'data'
        console.log('onApprove - transaction was approved, but not authorized', data, actions);
        this.http.post('http://localhost:4000/api/orders/capture-order', { 
          orderID: data.orderID 
        }).subscribe({
          next: (details) => {
            alert('¡Pago completado con éxito! Gracias por tu compra.');
            this.carritoService.vaciar();
          },
          error: (err: any) => { // SOLUCIÓN 3: Añadir tipo a 'err'
            console.error('Error al capturar la orden', err);
            alert('Hubo un problema al confirmar tu pago. Por favor, contacta a soporte.');
          }
        });
      },
      onError: (err: any) => { // SOLUCIÓN 3: Añadir tipo a 'err'
        console.log('OnError', err);
        alert('PayPal encontró un error. Por favor, intenta de nuevo.');
      },
      onCancel: (data: any, actions: any) => { // SOLUCIÓN 4: Añadir tipo a 'data' y 'actions'
        console.log('OnCancel', data, actions);
      },
    };
  }

  quitar(id: number) { this.carritoService.quitar(id); }
  vaciar() { this.carritoService.vaciar(); }
  exportarXML() { this.carritoService.exportarXML(); }
}