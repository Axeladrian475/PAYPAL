import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  // Signal con la lista de productos en el carrito
  private productosSignal = signal<Product[]>([]);

  // Exponer el carrito como readonly
  productos = this.productosSignal.asReadonly();

  agregar(producto: Product) {
    // === LA SOLUCIÓN ESTÁ AQUÍ ===
    // Creamos una copia del producto, convirtiendo el precio a un número
    const productoCorregido = {
      ...producto,
      precio: Number(producto.precio) // Aseguramos que el precio sea numérico
    };
    // Agregamos la copia corregida a la lista
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
    // Ahora esta suma funcionará correctamente porque los precios son numéricos
    return this.productosSignal().reduce((acc, p) => acc + p.precio, 0);
  }

  // Este método se mantiene igual, tu componente lo necesita
  obtenerProductosConCantidad() {
    const productos = this.productosSignal();
    const productosConCantidad: { [id: number]: { producto: Product, cantidad: number } } = {};

    productos.forEach(p => {
      if (productosConCantidad[p.id]) {
        productosConCantidad[p.id].cantidad++;
      } else {
        productosConCantidad[p.id] = { producto: p, cantidad: 1 };
      }
    });

    return Object.values(productosConCantidad);
  }

  exportarXML() {
    const productos = this.obtenerProductosConCantidad();
    const fecha = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const hora = new Date().toLocaleTimeString('es-MX');

    // Generar estructura XML manualmente
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n`;
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
      // La multiplicación del subtotal también será correcta ahora
      xml += `      <subtotal>${p.precio * item.cantidad}</subtotal>\n`;
      xml += `    </producto>\n`;
    }

    xml += `  </productos>\n`;
    xml += `  <total>${this.total()}</total>\n`;
    xml += `  <productos_totales>${this.productosSignal().length}</productos_totales>\n`;
    xml += `</recibo>`;

    // Crear un Blob con el contenido XML
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);

    // Crear un enlace para forzar la descarga
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibo_fraganza_${fecha}.xml`;
    a.click();

    // Liberar memoria
    URL.revokeObjectURL(url);
  }

  // Escapar caracteres especiales XML
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}