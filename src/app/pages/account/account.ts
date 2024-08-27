import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { UserData } from '../../providers/user-data';
import { App } from '@capacitor/app';

@Component({
  selector: 'page-account',
  templateUrl: 'account.html',
  styleUrls: ['./account.scss'],
})
export class AccountPage implements AfterViewInit {

  username: string;
  loading = true;

  constructor(
    public alertCtrl: AlertController,
    public toastCtrl: ToastController, // Añadido para mostrar toasts
    public router: Router,
    public userData: UserData
  ) { 
    App.addListener('backButton', data => {
      if (data.canGoBack) {
        window.history.back();
      } else {
        App.minimizeApp();
      }
    })
  }

  ngAfterViewInit() {
    this.getUsername();
    this.loading = false;
  }

  updatePicture() {
    console.log('Clicked to update picture');
  }

  async changeUsername() {
    const alert = await this.alertCtrl.create({
      header: 'Change Username',
      buttons: [
        'Cancel',
        {
          text: 'Ok',
          handler: (data: any) => {
            this.userData.setUsername(data.username);
            this.getUsername();
          }
        }
      ],
      inputs: [
        {
          type: 'text',
          name: 'username',
          value: this.username,
          placeholder: 'username'
        }
      ]
    });
    await alert.present();
  }

  getUsername() {
    this.userData.getUsername().then((username) => {
      this.username = username;
    });
  }

  async changePassword() {
    const alert = await this.alertCtrl.create({
      header: 'Cambiar contraseña',
      inputs: [
        {
          name: 'oldPassword',
          type: 'password',
          placeholder: 'Antigua contraseña',
          attributes: {
            minlength: 6,
            required: true
          },
        },
        {
          name: 'newPassword',
          type: 'password',
          placeholder: 'Nueva contraseña',
          attributes: {
            minlength: 6,
            required: true
          },
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cambio de contraseña cancelado');
          }
        },
        {
          text: 'Confirmar',
          handler: async (data) => {
            const { oldPassword, newPassword } = data;
            
            if (oldPassword && newPassword) {
              try {
                this.loading = true;
                await this.userData.changePassword(this.username, oldPassword, newPassword);
                this.loading = false;
                // Mostrar toast de éxito
                const toast = await this.toastCtrl.create({
                  message: 'La contraseña se cambió correctamente.',
                  duration: 2000,
                  position: 'top'
                });
                await toast.present();
              } catch (error) {
                this.loading = false;
                // Mostrar alerta de error
                const errorAlert = await this.alertCtrl.create({
                  header: 'Error',
                  message: error.message || 'No se pudo cambiar la contraseña.',
                  buttons: ['OK']
                });
                await errorAlert.present();
              }
            } else {
              // Mostrar mensaje de error si alguno de los campos está vacío
              alert.message = 'Ambos campos son obligatorios.';
              return false; // Evitar que el alert se cierre si las validaciones fallan
            }
          }
        }
      ]
    });
  
    await alert.present();
  }
  
  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Logout cancelado');
          }
        },
        {
          text: 'Cerrar sesión',
          handler: () => {
            this.userData.logout();
            this.router.navigateByUrl('/login');
          }
        }
      ]
    });
    await alert.present();
  }

  support() {
    this.router.navigateByUrl('/support');
  }
}
