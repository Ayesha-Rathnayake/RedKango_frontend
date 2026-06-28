import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

type RentalStockLabel = 'Available' | 'Running Out' | 'Unavailable';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  featuredRentals: Product[] = [];
  loadingRentals = false;
  rentalError = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFeaturedRentals();
  }

  loadFeaturedRentals(): void {
    this.loadingRentals = true;
    this.rentalError = '';

    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.featuredRentals = products
          .filter((product) => product.type === 'RENTAL')
          .slice(0, 6);

        this.loadingRentals = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.rentalError = 'Unable to load featured rentals.';
        this.loadingRentals = false;
        this.cdr.detectChanges();
      },
    });
  }

  getProductImage(product: Product): string {
    return product.imageUrl?.trim() || 'images/products/placeholder.png';
  }

  getRentalStockLabel(product: Product): RentalStockLabel {
    if (product.stockStatus === 'OUT_OF_STOCK' || product.availableUnits <= 0) {
      return 'Unavailable';
    }

    if (product.stockStatus === 'LOW_STOCK') {
      return 'Running Out';
    }

    return 'Available';
  }

  isRentalAvailable(product: Product): boolean {
    return product.stockStatus !== 'OUT_OF_STOCK' && product.availableUnits > 0;
  }

  handleRentNow(): void {
    this.router.navigate(['/rentals']);
  }

  goToRentalProduct(productId: number): void {
    this.router.navigate(['/rentals'], {
      queryParams: { highlight: productId },
    });
  }

  goToRentals(): void {
    this.router.navigate(['/rentals']);
  }

  goToShop(): void {
    this.router.navigate(['/shop']);
  }

  goToGuides(): void {
    this.router.navigate(['/camping-tips']);
  }
}