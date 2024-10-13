import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  constructor() {}

  getCart() {
    return {
      products: [
       
      ],
      client: {
        ruc_reason: 'Cliente S.A.',
        ruc_id: '1234567890'
      }
    };
  }
}
