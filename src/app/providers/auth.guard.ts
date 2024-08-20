import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserData } from './user-data';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private userData: UserData,) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  
    return this.checkUserAccess().then(hasAccess => {
      if (!hasAccess) {
        this.router.navigate(['/login']); // Redirige si no tiene acceso
        return false;
      } 
      return true;
    });
  }

  async checkUserAccess() {
    return this.userData.isLoggedIn();
  }  
}
