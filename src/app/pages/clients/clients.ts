import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ModalController, ToastController, Config } from '@ionic/angular';
import { App } from '@capacitor/app';

@Component({
  selector: 'page-clients',
  templateUrl: 'clients.html',
  styleUrls: ['./clients.scss'],
})
export class ClientsPage implements OnInit {
  ios: boolean;
  queryText = '';
  segment = 'list'; // Default segment
  showSearchbar = false;

  // Datos de clientes existentes
  customers = [
    { name: 'Cliente A', phone: '+595 123 456', selected: false, coordinates: { lat: -25.2637, lng: -57.5759 } },
    { name: 'Cliente B', phone: '+595 234 567', selected: false, coordinates: { lat: -25.2844, lng: -57.6117 } },
    { name: 'Cliente C', phone: '+595 345 678', selected: false, coordinates: { lat: -25.3007, lng: -57.6359 } }
  ];

  // Datos para el nuevo cliente
  newCustomer = {
    name: '',
    address: '',
    phone: '',
    latitude: null,
    longitude: null
  };

  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public router: Router,
    public toastCtrl: ToastController,
    public config: Config
  ) { 
    App.addListener('backButton', data => {
      if (data.canGoBack) {
        window.history.back();
      } else {
        App.minimizeApp();
      }
    })
  }

  ngOnInit() {
    this.ios = this.config.get('mode') === 'ios';
    this.updateView(); // Ensure initial view setup
    this.logCurrentRoute();
  }

  logCurrentRoute() {
    console.log('Current route:', this.router.url);
  }

  updateView() {
    if (this.segment === 'list') {
      // Update view for the list of customers if necessary
      // Example: this.updateSchedule(); or any other necessary updates
    } else if (this.segment === 'add') {
      // Update view for adding new customers
      // Example: initialize form data or reset states
      this.newCustomer = {
        name: '',
        address: '',
        phone: '',
        latitude: null,
        longitude: null
      };
    }
  }

  selectCustomer(customer) {
    this.customers.forEach(c => c.selected = false); // Deseleccionar todos los clientes
    customer.selected = true; // Seleccionar el cliente clickeado
  }

  openMap(coordinates) {
    const { lat, lng } = coordinates;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  }

  async presentFilter() {
    // Implement your filter functionality here
  }

  confirmSelection() {
    const selectedCustomer = this.customers.find(customer => customer.selected);
    if (selectedCustomer) {
      // Aquí puedes hacer algo con el cliente seleccionado, por ejemplo, navegar a otra página o mostrar una alerta
      console.log('Cliente seleccionado:', selectedCustomer);
      // Ejemplo: Mostrar una alerta de confirmación
      this.alertCtrl.create({
        header: 'Confirmación',
        message: `¿Estás seguro de que quieres confirmar a ${selectedCustomer.name}?`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Confirmar',
            handler: () => {
              // Aquí puedes manejar la confirmación, como enviar los datos a un servidor
              console.log('Confirmado:', selectedCustomer);
            }
          }
        ]
      }).then(alert => alert.present());
    } else {
      // No hay cliente seleccionado
      this.alertCtrl.create({
        header: 'Error',
        message: 'Por favor, selecciona un cliente.',
        buttons: ['OK']
      }).then(alert => alert.present());
    }
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

  // Manejar el envío del formulario
  submitForm() {
    if (this.newCustomer.name && this.newCustomer.address && this.newCustomer.phone && this.newCustomer.latitude !== null && this.newCustomer.longitude !== null) {
      // Aquí puedes manejar el envío del formulario, como enviar los datos a un servidor
      console.log('Nuevo Cliente:', this.newCustomer);
      
      // Agregar el nuevo cliente a la lista
      this.customers.push({
        ...this.newCustomer,
        selected: false,
        coordinates: { lat: this.newCustomer.latitude, lng: this.newCustomer.longitude }
      });

      // Resetea el formulario después de enviarlo
      this.newCustomer = {
        name: '',
        address: '',
        phone: '',
        latitude: null,
        longitude: null
      };

      // Cambia el segmento a la lista después de agregar
      this.segment = 'list';
    } else {
      this.alertCtrl.create({
        header: 'Error',
        message: 'Por favor, complete todos los campos.',
        buttons: ['OK']
      }).then(alert => alert.present());
    }
  }
}
