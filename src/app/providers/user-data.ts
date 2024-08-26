import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { firstValueFrom, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserData {
  favorites: string[] = [];
  HAS_LOGGED_IN = 'hasLoggedIn';
  HAS_SEEN_TUTORIAL = 'hasSeenTutorial';
  private apiUrlLogin = 'http://100.26.210.128:3000/api/auth/login';
  private apiUrlSignup = 'http://100.26.210.128:3000/api/auth/signup';

  constructor(
    public storage: Storage,
    private http: HttpClient
  ) { }

  hasFavorite(sessionName: string): boolean {
    return (this.favorites.indexOf(sessionName) > -1);
  }

  addFavorite(sessionName: string): void {
    this.favorites.push(sessionName);
  }

  removeFavorite(sessionName: string): void {
    const index = this.favorites.indexOf(sessionName);
    if (index > -1) {
      this.favorites.splice(index, 1);
    }
  }

  login(username: string, password: string): Promise<any> {
    const loginData = { username, password };

    return firstValueFrom(this.http.post<any>(this.apiUrlLogin, loginData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Invalid username or password'));
      })
    )).then(response => {
      const token = response.data; // Ajusta según la estructura de la respuesta
      if (token) {
        return this.storage.set(this.HAS_LOGGED_IN, true).then(() => {
          this.setUsername(username);
          this.setToken(token);
          return window.dispatchEvent(new CustomEvent('user:login'));
        });
      } else {
        return Promise.reject('Token not found in response');
      }
    });
  }

  signup(username: string, password: string): Promise<any> {
    const signupData = { username, password };

    return firstValueFrom(this.http.post<any>(this.apiUrlSignup, signupData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      catchError(error => {
        return throwError(() => new Error(error.error.message ?? 'Signup failed. Please try again.'));
      })
    )).then(response => {
      const token = response.data; // Ajusta según la estructura de la respuesta
      // Manejar la respuesta del registro si es necesario
      // Puedes optar por iniciar sesión automáticamente después del registro
      return this.storage.set(this.HAS_LOGGED_IN, false).then(() => {
        return window.dispatchEvent(new CustomEvent('user:signup'));
      });
    });
  }

  logout(): Promise<any> {
    return this.storage.remove(this.HAS_LOGGED_IN).then(() => {
      return this.storage.remove('username');
    }).then(() => {
      window.dispatchEvent(new CustomEvent('user:logout'));
    });
  }

  setUsername(username: string): Promise<any> {
    return this.storage.set('username', username);
  }

  setToken(token: string): Promise<any> {
    return this.storage.set('token', token);
  }

  getUsername(): Promise<string> {
    return this.storage.get('username').then((value) => {
      return value;
    });
  }

  isLoggedIn(): Promise<boolean> {
    return this.storage.get(this.HAS_LOGGED_IN).then((value) => {
      return value === true;
    });
  }

  checkHasSeenTutorial(): Promise<string> {
    return this.storage.get(this.HAS_SEEN_TUTORIAL).then((value) => {
      return value;
    });
  }
}
