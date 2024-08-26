import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { UserData } from '../../providers/user-data';
import { UserOptions } from '../../interfaces/user-options';
import { App } from '@capacitor/app';

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
  styleUrls: ['./signup.scss'],
})
export class SignupPage {
  signup: UserOptions = { username: '', password: '' };
  submitted = false;
  loading = false; // Añadido para mostrar un indicador de carga

  constructor(
    public router: Router,
    public userData: UserData
  ) {
    App.addListener('backButton', data => {
      if (data.canGoBack) {
        window.history.back();
      } else {
        App.minimizeApp();
      }
    });
  }

  onSignup(form: NgForm) {
    this.submitted = true;
    this.loading = true; // Mostrar indicador de carga

    if (form.valid) {
      // Verificar si el nombre de usuario cumple con los requisitos
      const usernamePattern = /^[a-zA-Z0-9]+$/;
      if (!usernamePattern.test(this.signup.username)) {
        alert('El nombre de usuario debe ser alfanumérico y no debe contener espacios.');
        this.loading = false; // Ocultar indicador de carga
        return;
      }

      this.userData.signup(this.signup.username, this.signup.password)
        .then(() => {
          this.router.navigateByUrl('/login');
        })
        .catch(error => {
          this.loading = false
          alert(error ?? 'Hubo un error al registrarse');
        })
    } else {
      this.loading = false; // Ocultar indicador de carga si el formulario no es válido
    }
  }
}
