import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { UserData } from '../../providers/user-data';
import { UserOptions } from '../../interfaces/user-options';
import { App } from '@capacitor/app';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  styleUrls: ['./login.scss'],
})
export class LoginPage implements OnInit {
  login: UserOptions = { username: '', password: '' };
  submitted = false;
  loggedIn = false;

  constructor(
    public userData: UserData,
    public router: Router
  ) {
    App.addListener('backButton', data => {
      if (data.canGoBack) {
        window.history.back();
      } else {
        App.minimizeApp();
      }
    })
  }

  async ngOnInit() {
    await this.checkLoginStatus();
  }

  onLogin(form: NgForm) {
    this.submitted = true;

    if (form.valid) {
      this.userData.login(this.login.username, this.login.password)
        .then(() => {
          this.router.navigateByUrl('/app/tabs/products');
        })
        .catch(error => {
          console.error(error);
          alert('Usuario o contraseña incorrectos.');
        });
    }
  }

  onSignup() {
    this.router.navigateByUrl('/signup');
  }

  async checkLoginStatus() {
    const loggedIn = await this.userData.isLoggedIn();
    this.updateLoggedInStatus(loggedIn);

    // if (loggedIn) {
    //   this.router.navigateByUrl('/app/tabs/products');
    // }
  }

  updateLoggedInStatus(loggedIn: boolean) {
    this.loggedIn = loggedIn;
  }
}
