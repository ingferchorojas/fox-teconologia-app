import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController, Config } from '@ionic/angular';
import { App } from '@capacitor/app';
import { CartService } from '../../providers/cart';

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
  clienteSeleccionado: any = {
    nombre: null,
    ruc_id: null
  };

  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public router: Router,
    public config: Config,
    private cartService: CartService
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

  async loadCartData() {
    try {
      const cart = await this.cartService.getCart(); // Asegúrate de usar await para obtener el cart
  
      this.productosSeleccionados = cart.products.map(product => ({
        nombre: product.name,
        precio: product.unitPrice,
        cantidad: product.quantity,
        imagen: '../../../assets/img/package.png'
      }));
  
      if (cart.client.ruc_reason && cart.client.ruc_id) {
        this.clienteSeleccionado = {
          nombre: cart.client.ruc_reason ,
          ruc_id: cart.client.ruc_id
        };
      }
  
    } catch (error) {
      console.error('Error al cargar los datos del carrito:', error);
    }
  }
  

  calcularTotal(): number {
    return this.productosSeleccionados.reduce((total, producto) => total + producto.precio * producto.cantidad, 0);
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
    console.log('Cambiar cliente');
    this.router.navigate(['/app/tabs/clients']);
  }
}
