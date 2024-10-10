import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserData } from './user-data'; // Ajusta la ruta según la ubicación del servicio
import { firstValueFrom, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ClientData {
  private host = 'http://149.28.106.111:3000'
  private apiUrlClient = `${this.host}/clients`;
  private apiUrlDeleteClient = `${this.host}/clients`;

  constructor(private http: HttpClient, private userData: UserData) { }

  async getClientData(): Promise<any[]> {
    try {
      const token = await this.userData.getToken(); // Obtiene el token del servicio UserData
      const headers = new HttpHeaders({
        'authorization': `Bearer ${token}`
      });

      const response: any = await firstValueFrom(this.http.get(this.apiUrlClient, { headers }));
      console.log(response);
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

  async addClient(client: { name: string, address: string, phone: string, latitude: number, longitude: number, ruc_id: string, ruc_reason: string }): Promise<any> {
    try {
      client.name = client.name.trim();
      client.address = client.address.trim();
      client.phone = client.phone.trim();
      const token = await this.userData.getToken(); // Obtiene el token del servicio UserData
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'authorization': `Bearer ${token}`
      });

      const response: any = await firstValueFrom(this.http.post(this.apiUrlClient, client, { headers }));
      console.log('Cliente agregado:', response);
      return response; // Devuelve la respuesta completa
    } catch (error) {
      console.error('Error adding client:', error);
      throw error; // Lanza el error para que pueda ser manejado por el llamador
    }
  }

  async deleteClient(clientId: string): Promise<any> {
    try {
      const token = await this.userData.getToken(); // Obtiene el token del servicio UserData
      if (!token) {
        throw new Error('User is not authenticated.');
      }

      const headers = new HttpHeaders({
        'authorization': `Bearer ${token}`
      });

      const url = `${this.apiUrlDeleteClient}/${clientId}`;

      const response: any = await firstValueFrom(this.http.delete<any>(url, { headers })
        .pipe(
          catchError(error => {
            return throwError(() => new Error(error.error.message ?? 'Failed to delete client.'));
          })
        ));
      console.log('Cliente eliminado:', response);
      return response; // Devuelve la respuesta completa
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error; // Lanza el error para que pueda ser manejado por el llamador
    }
  }

  async updateClient(client: { _id: string, name: string, address: string, phone: string, latitude: number, longitude: number, ruc_id: string, ruc_reason: string }): Promise<any> {
    try {
      client.name = client.name.trim();
      client.address = client.address.trim();
      client.phone = client.phone.trim();
      const token = await this.userData.getToken(); // Obtiene el token del servicio UserData
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'authorization': `Bearer ${token}`
      });

      const url = `${this.apiUrlClient}/${client._id}`;

      const response: any = await firstValueFrom(this.http.put(url, client, { headers }));
      console.log('Cliente actualizado:', response);
      return response; // Devuelve la respuesta completa
    } catch (error) {
      console.error('Error updating client:', error);
      throw error; // Lanza el error para que pueda ser manejado por el llamador
    }
  }
}
