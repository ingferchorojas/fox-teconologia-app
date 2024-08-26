import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { UserData } from '../../providers/user-data';
import { UserOptions } from '../../interfaces/user-options';
import { App } from '@capacitor/app';
import { AlertController } from '@ionic/angular';

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
    public userData: UserData,
    public alertCtrl: AlertController // Inyecta AlertController
  ) {
    App.addListener('backButton', data => {
      if (data.canGoBack) {
        window.history.back();
      } else {
        App.minimizeApp();
      }
    });
  }

  async onSignup(form: NgForm) {
    this.submitted = true;
    this.loading = true; // Mostrar indicador de carga

    if (form.valid) {
      // Verificar si el nombre de usuario cumple con los requisitos
      const usernamePattern = /^[a-zA-Z0-9]+$/;
      if (!usernamePattern.test(this.signup.username)) {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'El nombre de usuario debe ser alfanumérico y no debe contener espacios.',
          buttons: ['OK']
        });
        await alert.present();
        this.loading = false; // Ocultar indicador de carga
        return;
      }

      try {
        await this.userData.signup(this.signup.username, this.signup.password);
        
        // Mostrar alerta de éxito
        const alert = await this.alertCtrl.create({
          header: 'Registro exitoso',
          message: 'Tu registro fue exitoso. Ahora puedes iniciar sesión.',
          buttons: [
            {
              text: 'OK',
              handler: () => {
                this.router.navigateByUrl('/login'); // Redirigir a la página de inicio de sesión
              }
            }
          ]
        });
        await alert.present();
      } catch (error) {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: error.message || 'Hubo un error al registrarse',
          buttons: ['OK']
        });
        await alert.present();
      } finally {
        this.loading = false; // Ocultar indicador de carga
      }
    } else {
      this.loading = false; // Ocultar indicador de carga si el formulario no es válido
    }
  }
}
