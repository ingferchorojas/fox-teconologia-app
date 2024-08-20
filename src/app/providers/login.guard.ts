import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserData } from './user-data';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private router: Router, private userData: UserData) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.checkUserNotLoggedIn().then(isNotLoggedIn => {
      if (!isNotLoggedIn) {
        this.router.navigate(['/app/tabs/products']); // Redirige a la ruta 'app' si ya está logueado
        return false;
      } 
      return true;
    });
  }

  async checkUserNotLoggedIn() {
    return !(await this.userData.isLoggedIn());
  }  
}
