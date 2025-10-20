import { Component, computed, inject, OnInit } from '@angular/core';
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
export class CarritoComponent implements OnInit {
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
          if (order) return order.id;
          throw new Error("No se pudo obtener el ID de la orden del servidor.");
        });
      },
      onApprove: (data: IOnApproveCallbackData, actions: any) => {
        console.log('onApprove - transaction was approved, but not authorized', data, actions);
        this.http.post('http://localhost:4000/api/orders/capture-order', {
          orderID: data.orderID
        }).subscribe({
          next: (details: any) => {
            alert('¡Pago completado con éxito! Gracias por tu compra. Se descargará tu recibo.');

            // 1. Obtenemos los datos del carrito ANTES de vaciarlo
            const productosParaRecibo = this.productosConCantidad();
            const totalParaRecibo = this.total();
            
            // 2. Llamamos al método exportarXML del servicio con los datos
            this.carritoService.exportarXML(productosParaRecibo, totalParaRecibo, data.orderID);

            // 3. Vaciamos el carrito
            this.carritoService.vaciar();
          },
          error: (err: any) => {
            console.error('Error al capturar la orden', err);
            alert('Hubo un problema al confirmar tu pago. Por favor, contacta a soporte.');
          }
        });
      },
      onError: (err: any) => {
        console.log('OnError', err);
        alert('PayPal encontró un error. Por favor, intenta de nuevo.');
      },
      onCancel: (data: any, actions: any) => {
        console.log('OnCancel', data, actions);
      },
    };
  }

  quitar(id: number) { this.carritoService.quitar(id); }
  vaciar() { this.carritoService.vaciar(); }

  
}