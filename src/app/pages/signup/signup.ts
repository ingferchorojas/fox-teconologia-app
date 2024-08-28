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
    confirm_password: '', 
    first_name: '', 
    last_name: '',  
    phone: ''       
  };
  submitted = false;
  loading = false;

  constructor(
    public router: Router,
    public userData: UserData,
    public alertCtrl: AlertController 
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
    this.loading = true;

    if (form.valid) {
      const usernamePattern = /^[a-zA-Z0-9]+$/;
      if (!usernamePattern.test(this.signup.username)) {
        await this.showAlert('Error', 'El nombre de usuario debe ser alfanumérico y no debe contener espacios.');
        this.loading = false;
        return;
      }

      const namePattern = /^[a-zA-Z]+$/;
      if (!namePattern.test(this.signup.first_name)) {
        await this.showAlert('Error', 'El nombre solo debe contener letras.');
        this.loading = false;
        return;
      }

      if (!namePattern.test(this.signup.last_name)) {
        await this.showAlert('Error', 'El apellido solo debe contener letras.');
        this.loading = false;
        return;
      }

      const phonePattern = /^0971[0-9]{6}$/;
      if (!phonePattern.test(this.signup.phone)) {
        await this.showAlert('Error', 'El teléfono debe tener el formato 0971422641.');
        this.loading = false;
        return;
      }

      // Verificar si las contraseñas coinciden
      if (this.signup.password !== this.signup.confirm_password) {
        await this.showAlert('Error', 'Las contraseñas no coinciden.');
        this.loading = false;
        return;
      }

      try {
        await this.userData.signup(this.signup.username, this.signup.password, this.signup.first_name, this.signup.last_name, this.signup.phone);
        
        const alert = await this.alertCtrl.create({
          header: 'Registro exitoso',
          message: 'Tu registro fue exitoso. Ahora puedes iniciar sesión.',
          buttons: [
            {
              text: 'OK',
              handler: () => {
                this.router.navigateByUrl('/login');
              }
            }
          ]
        });
        await alert.present();
      } catch (error) {
        await this.showAlert('Error', error.message || 'Hubo un error al registrarse');
      } finally {
        this.loading = false;
      }
    } else {
      this.loading = false;
    }
  }

  onLogin() {
    this.router.navigateByUrl('/login');
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
