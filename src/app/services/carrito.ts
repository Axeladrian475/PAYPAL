import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product';

// Definimos una interfaz para los productos agrupados con cantidad
interface ProductoConCantidad {
  producto: Product;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private productosSignal = signal<Product[]>([]);
  productos = this.productosSignal.asReadonly();

  agregar(producto: Product) {
    const productoCorregido = {
      ...producto,
      precio: Number(producto.precio)
    };
    this.productosSignal.update(lista => [...lista, productoCorregido]);
  }

  quitar(id: number) {
    this.productosSignal.update(lista =>
      lista.filter(p => p.id !== id)
    );
  }

  vaciar() {
    this.productosSignal.set([]);
  }

  total() {
    return this.productosSignal().reduce((acc, p) => acc + p.precio, 0);
  }

  obtenerProductosConCantidad(): ProductoConCantidad[] {
    const productos = this.productosSignal();
    const productosConCantidad: { [id: number]: ProductoConCantidad } = {};

    productos.forEach(p => {
      if (productosConCantidad[p.id]) {
        productosConCantidad[p.id].cantidad++;
      } else {
        productosConCantidad[p.id] = { producto: p, cantidad: 1 };
      }
    });

    return Object.values(productosConCantidad);
  }

  // === MÉTODO MODIFICADO ===
  // Ahora acepta los datos del pedido como argumentos para ser más reutilizable
  exportarXML(
    productos: ProductoConCantidad[],
    totalPedido: number,
    transaccionId: string // Añadimos el ID de la transacción
  ) {
    const fecha = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const hora = new Date().toLocaleTimeString('es-MX');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n`;
    xml += `  <transaccion_id>${transaccionId}</transaccion_id>\n`; // <-- Se añade el ID de PayPal
    xml += `  <fecha>${fecha}</fecha>\n`;
    xml += `  <hora>${hora}</hora>\n`;
    xml += `  <tienda>Fraganza - Perfumería</tienda>\n`;
    xml += `  <productos>\n`;

    for (const item of productos) {
      const p = item.producto;
      xml += `    <producto>\n`;
      xml += `      <id>${p.id}</id>\n`;
      xml += `      <nombre>${this.escapeXML(p.nombre)}</nombre>\n`;
      xml += `      <descripcion>${this.escapeXML(p.descripcion)}</descripcion>\n`;
      xml += `      <precio_unitario>${p.precio}</precio_unitario>\n`;
      xml += `      <cantidad>${item.cantidad}</cantidad>\n`;
      xml += `      <subtotal>${p.precio * item.cantidad}</subtotal>\n`;
      xml += `    </producto>\n`;
    }

    xml += `  </productos>\n`;
    xml += `  <total>${totalPedido}</total>\n`;
    xml += `  <productos_totales>${productos.reduce((sum, item) => sum + item.cantidad, 0)}</productos_totales>\n`;
    xml += `</recibo>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `recibo_fraganza_${transaccionId}.xml`; // El nombre ahora incluye el ID
    a.click();

    URL.revokeObjectURL(url);
  }

  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}