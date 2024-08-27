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
  signup: UserOptions = { 
    username: '', 
    password: '', 
    first_name: '', // Añadido para el nombre
    last_name: '',  // Añadido para el apellido
    phone: ''       // Añadido para el teléfono
  };
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

      // Verificar si el nombre cumple con los requisitos
      const namePattern = /^[a-zA-Z]+$/;
      if (!namePattern.test(this.signup.first_name)) {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'El nombre solo debe contener letras.',
          buttons: ['OK']
        });
        await alert.present();
        this.loading = false; // Ocultar indicador de carga
        return;
      }

      // Verificar si el apellido cumple con los requisitos
      if (!namePattern.test(this.signup.last_name)) {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'El apellido solo debe contener letras.',
          buttons: ['OK']
        });
        await alert.present();
        this.loading = false; // Ocultar indicador de carga
        return;
      }

      // Verificar si el teléfono cumple con los requisitos
      const phonePattern = /^0971[0-9]{6}$/;
      if (!phonePattern.test(this.signup.phone)) {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'El teléfono debe tener el formato 0971422641.',
          buttons: ['OK']
        });
        await alert.present();
        this.loading = false; // Ocultar indicador de carga
        return;
      }

      try {
        await this.userData.signup(this.signup.username, this.signup.password, this.signup.first_name, this.signup.last_name, this.signup.phone);
        
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

  onLogin() {
    this.router.navigateByUrl('/login')
  }
}
