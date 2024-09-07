import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonList, IonRouterOutlet, LoadingController, ModalController, ToastController, Config } from '@ionic/angular';

import { ConferenceData } from '../../providers/conference-data';
import { UserData } from '../../providers/user-data';
import { ProductData } from '../../providers/product-data'; // Importar el servicio ProductData
import { App } from '@capacitor/app';

@Component({
  selector: 'page-products',
  templateUrl: 'products.html',
  styleUrls: ['./products.scss'],
})
export class ProductsPage implements OnInit {
  @ViewChild('scheduleList', { static: true }) scheduleList: IonList;

  ios: boolean;
  dayIndex = 0;
  queryText = '';
  segment = 'all';
  excludeTracks: any = [];
  shownSessions: any = [];
  groups: any = [];
  confDate: string;
  showSearchbar: boolean;

  speakers: any[] = [];

  loading = false;

  products = []; // Aquí se guardarán los productos obtenidos del endpoint

  constructor(
    public alertCtrl: AlertController,
    public confData: ConferenceData,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public router: Router,
    public routerOutlet: IonRouterOutlet,
    public toastCtrl: ToastController,
    public user: UserData,
    public config: Config,
    private productData: ProductData // Inyectar ProductData en el constructor
  ) { 
    App.addListener('backButton', data => {
      if (data.canGoBack) {
        window.history.back();
      } else {
        App.minimizeApp();
      }
    });
  }

  ngOnInit() {
    this.updateSchedule();

    this.ios = this.config.get('mode') === 'ios';

    // Llamar a la función para obtener los productos
    this.loadProducts();
  }

  async handleRefresh(event: Event) {
    await this.loadProducts();
    (event as CustomEvent).detail.complete(); // Completa el refresco
  }

  // Función para cargar los productos
  async loadProducts() {
    try {
      this.loading = true;
      this.products = await this.productData.getClientData(); // Obtener productos del servicio y asignarlos a la variable
      this.loading = false;
      console.log('Productos cargados:', this.products);
    } catch (error) {
      this.loading = false;
      console.error('Error al cargar productos:', error);
    }
  }

  selectCustomer() {
    console.log('Cliente seleccionado');
  }

  addProduct(product) {
    if (product.stock > 0) {
      product.stock--;
      product.added++;
    }
  }

  removeProduct(product) {
    if (product.added > 0) {
      product.added--;
      product.stock++;
    }
  }

  updateSchedule() {
    if (this.scheduleList) {
      this.scheduleList.closeSlidingItems();
    }

    this.confData.getTimeline(this.dayIndex, this.queryText, this.excludeTracks, this.segment).subscribe((data: any) => {
      this.shownSessions = data.shownSessions;
      this.groups = data.groups;
    });
  }

  async presentFilter() {}

  async addFavorite(slidingItem: HTMLIonItemSlidingElement, sessionData: any) {
    if (this.user.hasFavorite(sessionData.name)) {
      this.removeFavorite(slidingItem, sessionData, 'Favorite already added');
    } else {
      this.user.addFavorite(sessionData.name);
      slidingItem.close();

      const toast = await this.toastCtrl.create({
        header: `${sessionData.name} was successfully added as a favorite.`,
        duration: 3000,
        buttons: [{ text: 'Close', role: 'cancel' }]
      });

      await toast.present();
    }
  }

  async removeFavorite(slidingItem: HTMLIonItemSlidingElement, sessionData: any, title: string) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: 'Would you like to remove this session from your favorites?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => slidingItem.close(),
        },
        {
          text: 'Remove',
          handler: () => {
            this.user.removeFavorite(sessionData.name);
            this.updateSchedule();
            slidingItem.close();
          }
        }
      ]
    });

    await alert.present();
  }

  async openSocial(network: string, fab: HTMLIonFabElement) {
    const loading = await this.loadingCtrl.create({
      message: `Posting to ${network}`,
      duration: (Math.random() * 1000) + 500
    });
    await loading.present();
    await loading.onWillDismiss();
    fab.close();
  }
}
