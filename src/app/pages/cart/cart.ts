import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController, Config } from '@ionic/angular';
import { App } from '@capacitor/app';

@Component({
  selector: 'page-cart',
  templateUrl: 'cart.html',
  styleUrls: ['./cart.scss'],
})
export class CartPage implements OnInit {
  ios: boolean;
  queryText = '';
  showSearchbar: boolean;

  productosSeleccionados: any[] = [];
  clienteSeleccionado: any = null;

  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public router: Router,
    public config: Config
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
    this.loadCartData();
  }

  loadCartData() {
    this.productosSeleccionados = [
      { nombre: 'Producto A', precio: 10, cantidad: 2, stock: 10, imagen: '../../../assets/img/package.png' },
      { nombre: 'Producto B', precio: 20, cantidad: 1, stock: 5, imagen: '../../../assets/img/package.png' },
      { nombre: 'Producto C', precio: 15, cantidad: 1, stock: 5, imagen: '../../../assets/img/package.png' }
    ];
    this.clienteSeleccionado = {
      nombre: 'Cliente Ejemplo',
      telefono: '123456789',
      coordenadas: 'geo:0,0'
    };
  }

  addProduct(producto: any) {
    console.log('Producto antes de añadir:', producto);
    if (producto && producto.stock > 0) {
      producto.cantidad++;
      producto.stock--;
      console.log('Producto después de añadir:', producto);
    } else {
      console.log('No se puede añadir el producto. Stock insuficiente.');
    }
  }

  removeProduct(producto: any) {
    console.log('Producto antes de eliminar:', producto);
    if (producto && producto.cantidad > 0) {
      producto.cantidad--;
      producto.stock++;
      console.log('Producto después de eliminar:', producto);
    } else {
      console.log('No se puede eliminar el producto. Cantidad insuficiente.');
    }
  }

  async openMap(coordenadas: string) {
    window.open(coordenadas, '_system');
  }

  async finalizarVenta() {
    const alert = await this.alertCtrl.create({
      header: 'Finalizar Venta',
      message: '¿Estás seguro de que quieres finalizar la venta?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Finalizar',
          handler: () => {
            this.showSuccessMessage('Venta finalizada con éxito.');
          }
        }
      ]
    });
    await alert.present();
  }

  async showSuccessMessage(message: string) {
    const toast = await this.toastCtrl.create({
      header: message,
      duration: 3000,
      buttons: [{
        text: 'Cerrar',
        role: 'cancel'
      }]
    });
    await toast.present();
  }

  cambiarCliente() {
    // Lógica para cambiar el cliente
    console.log('Cambiar cliente');
    // Puedes abrir un modal o redirigir a una página para seleccionar un nuevo cliente
    this.router.navigate(['/app/tabs/clients']);
  }
}
