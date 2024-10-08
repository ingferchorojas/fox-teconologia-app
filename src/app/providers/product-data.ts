import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserData } from './user-data'; // Ajusta la ruta según la ubicación del servicio
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductData {
  private apiUrlProduct = 'http://100.26.210.128:3000/api/product';

  constructor(private http: HttpClient, private userData: UserData) { }

  async getClientData(): Promise<any[]> {
    try {
      const token = await this.userData.getToken(); // Obtiene el token del servicio UserData
      const headers = new HttpHeaders({
        'authorization': `Bearer ${token}`
      });

      const response: any = await firstValueFrom(this.http.get(this.apiUrlProduct, { headers }));
      console.log(response)
      if (response && !response.error) {
        return response.data; // Devuelve solo el campo "data"
      } else {
        console.error('Error en la respuesta del servidor:', response.message);
        return []; // Devuelve un array vacío si la respuesta no es exitosa
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
      return []; // Devuelve un array vacío en caso de error
    }
  }

}
