import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';

import { MenuController, Platform, ToastController, AlertController } from '@ionic/angular';

import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

import { Storage } from '@ionic/storage-angular';

import { UserData } from './providers/user-data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  isLoggedInPages = [
    { title: 'Clientes', url: '/app/tabs/clients', icon: 'people' },
    { title: 'Productos', url: '/app/tabs/products', icon: 'storefront' },
    { title: 'Venta', url: '/app/tabs/cart', icon: 'cart' },
    { title: 'Historial', url: '/app/tabs/history', icon: 'ticket' },
    { title: 'Información', url: '/app/tabs/about', icon: 'information-circle' }
  ];
  
  isLoggedOutPages = [];
  loggedIn = false;
  dark = false;

  constructor(
    private menu: MenuController,
    private platform: Platform,
    private router: Router,
    private storage: Storage,
    private userData: UserData,
    private swUpdate: SwUpdate,
    private toastCtrl: ToastController,
    public alertCtrl: AlertController,
  ) {
    this.initializeApp();
  }

  async ngOnInit() {
    await this.storage.create();
    await this.checkLoginStatus();
    await this.loadDarkModePreference(); // Cargar la preferencia del modo oscuro
    this.listenForLoginEvents();

    this.swUpdate.versionUpdates.subscribe(async res => {
      const toast = await this.toastCtrl.create({
        message: 'Update available!',
        position: 'bottom',
        buttons: [
          { role: 'cancel', text: 'Reload' }
        ]
      });

      await toast.present();

      toast
        .onDidDismiss()
        .then(() => this.swUpdate.activateUpdate())
        .then(() => window.location.reload());
    });
  }

  async ngAfterViewInit() {
    await this.loadDarkModePreference();
  }
  
  initializeApp() {
    this.platform.ready().then(() => {
      if (this.platform.is('hybrid')) {
        StatusBar.hide();
        SplashScreen.hide();
      }
    });
  }

  checkLoginStatus() {
    return this.userData.isLoggedIn().then(loggedIn => {
      return this.updateLoggedInStatus(loggedIn);
    });
  }

  updateLoggedInStatus(loggedIn: boolean) {
    setTimeout(() => {
      this.loggedIn = loggedIn;
    }, 300);
  }

  listenForLoginEvents() {
    window.addEventListener('user:login', () => this.updateLoggedInStatus(true));
    window.addEventListener('user:signup', () => this.updateLoggedInStatus(true));
    window.addEventListener('user:logout', () => this.updateLoggedInStatus(false));
  }

  async loadDarkModePreference() {
    const darkMode = await this.storage.get('darkMode');
    this.dark = darkMode !== null ? darkMode : false;
  }

  async toggleDarkMode(event: CustomEvent | boolean) {
    if (typeof event === 'boolean') {
      // Si el evento es un booleano, actualiza directamente
      this.dark = event;
    } else if (event && event.detail) {
      // Si es un CustomEvent, usa event.detail.checked
      this.dark = event.detail.checked;
    }
  
    await this.storage.set('darkMode', this.dark);
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel', handler: () => console.log('Logout cancelado') },
        { text: 'Cerrar sesión', handler: () => {
          this.userData.logout();
          this.router.navigateByUrl('/login');
        }}
      ]
    });
    await alert.present();
  }

  openTutorial() {
    this.menu.enable(false);
    this.storage.set('ion_did_tutorial', false);
    this.router.navigateByUrl('/tutorial');
  }
}
