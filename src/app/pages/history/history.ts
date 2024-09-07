import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController, Config } from '@ionic/angular';
import { App } from '@capacitor/app';
import { OrderData } from '../../providers/order-data'

@Component({
  selector: 'page-history',
  templateUrl: 'history.html',
  styleUrls: ['./history.scss'],
})
export class HistoryPage implements OnInit {
  ios: boolean;
  queryText = '';
  showSearchbar: boolean;

  productosSeleccionados: any[] = [];
  clienteSeleccionado: any = null;

  items = [];
  loading = false;

  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public router: Router,
    public config: Config,
    private orderData: OrderData // Inyección del servicio OrderData
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
    this.ios = this.config.get('mode') === 'ios';
    this.loadOrders(); // Cargar las órdenes al iniciar el componente
  }

  async handleRefresh(event: Event) {
    await this.loadOrders();
    (event as CustomEvent).detail.complete(); // Completa el refresco
  }

  async loadOrders() {
    try {
      this.loading = true;
      const orders = await this.orderData.getOrderData(); // Llama al servicio para obtener las órdenes
      console.log("orders", orders)
      this.items = orders.map(order => ({
        nombreCliente: order.client_id.name, // Nombre del cliente
        total: order.items.reduce((sum, item) => sum + (item.price * item.qty), 0), // Sumar precio * cantidad
        fecha: order.createdAt
      }));
      this.loading = false; 
    } catch (error) {
      this.loading = false; 
    } 
  }
}
