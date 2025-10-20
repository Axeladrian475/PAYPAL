import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:4000/api/productos';

  constructor(private http: HttpClient) { }

  getProductos(): Observable<Product[]> {

    return this.http.get<Product[]>(this.apiUrl);
  }

}