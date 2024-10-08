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
  private host = 'http://149.28.106.111:3000'
  private apiUrlLogin = `${this.host}/login`;
  private apiUrlSignup = `${this.host}/users`;
  private apitUrlChangePassword = `${this.host}/change-password`;

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

  signup(username: string, password: string, first_name: string, last_name: string, phone: string): Promise<any> {
    const signupData = { username: username.trim(), password, first_name: first_name.trim(), last_name: last_name.trim(), phone: phone.trim() };
    console.log(signupData)
    return firstValueFrom(this.http.post<any>(this.apiUrlSignup, signupData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      catchError(error => {
        return throwError(() => new Error(error.error.message ?? 'Signup failed. Please try again.'));
      })
    )).then(response => {
      return {}
    });
  }

  logout(): Promise<any> {
    return this.storage.remove(this.HAS_LOGGED_IN).then(() => {
      return this.storage.remove('username');
    }).then(() => {
      window.dispatchEvent(new CustomEvent('user:logout'));
    });
  }

  changePassword(username: string, oldPassword: string, newPassword: string): Promise<any> {
    const changePasswordData = { username, oldPassword, newPassword };
  
    return this.getToken().then(token => {
      if (!token) {
        return Promise.reject('User is not authenticated.');
      }
  
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'authorization': `Bearer ${token}`
      });
  
      return firstValueFrom(this.http.post<any>(this.apitUrlChangePassword, changePasswordData, { headers })
        .pipe(
          catchError(error => {
            return throwError(() => new Error(error.error.message ?? 'Password change failed. Please try again.'));
          })
        ));
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

  getToken(): Promise<string> {
    return this.storage.get('token').then((value) => {
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
