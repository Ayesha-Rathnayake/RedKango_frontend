import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app-config.token';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private cfg = inject(APP_CONFIG);

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.cfg.apiBaseUrl}/api/products`
    );
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(
      `${this.cfg.apiBaseUrl}/api/products/${id}`
    );
  }
}