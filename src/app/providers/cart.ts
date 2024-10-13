import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  constructor() {}

  getCart() {
    return {
      products: [
        { id: 1, name: 'Producto A', quantity: 2, unitPrice: 10000 },
        { id: 2, name: 'Producto B', quantity: 1, unitPrice: 20000 },
        { id: 3, name: 'Producto C', quantity: 3, unitPrice: 5000 }
      ],
      client: {
        ruc_reason: 'Cliente S.A.',
        ruc_id: '1234567890'
      }
    };
  }
}
