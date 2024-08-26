import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ModalController, ToastController, Config } from '@ionic/angular';
import { App } from '@capacitor/app';
import { ClientData } from '../../providers/client-data'; // Ajusta la ruta al servicio

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

  customers = []; // Se cargará dinámicamente

  // Datos para el nuevo cliente
  newCustomer = {
    name: '',
    address: '',
    phone: '',
    latitude: null,
    longitude: null
  };

  loading = true

  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public router: Router,
    public toastCtrl: ToastController,
    public config: Config,
    private clientData: ClientData // Inyección del servicio ClientData
  ) { 
    App.addListener('backButton', async () => {
      // Obtén la ruta actual
      const currentUrl = this.router.url;

      // Verifica si la ruta es la que deseas controlar
      if (currentUrl === '/app/tabs/clients') { // Ajusta esto según la ruta de tu página
        const alert = await this.alertCtrl.create({
          header: 'Salir de la aplicación',
          message: '¿Estás seguro de que quieres salir?',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => {
                // No hacer nada si el usuario cancela
              }
            },
            {
              text: 'Salir',
              handler: () => {
                // Minimizar la app si el usuario confirma
                App.minimizeApp();
              }
            }
          ]
        });
        await alert.present();
      } else {
        // Si no estás en la página específica, maneja el botón de retroceso de la forma habitual
        if (window.history.length > 1) {
          window.history.back();
        } else {
          App.minimizeApp();
        }
      }
    });
  }

  ngOnInit() {
    this.ios = this.config.get('mode') === 'ios';
    this.updateView(); // Ensure initial view setup
    this.logCurrentRoute();

    this.loadCustomers(); // Cargar los clientes al iniciar
  }

  logCurrentRoute() {
    console.log('Current route:', this.router.url);
  }

  updateView() {
    if (this.segment === 'list') {
      // Update view for the list of customers if necessary
    } else if (this.segment === 'add') {
      // Reset form for adding new customers
      this.newCustomer = {
        name: '',
        address: '',
        phone: '',
        latitude: null,
        longitude: null
      };
    }
  }

  async loadCustomers() {
    try {
      const data = await this.clientData.getClientData(); // Obtiene los datos desde el servicio
      this.customers = data; // Asigna los datos a la lista de clientes
      this.loading = false
    } catch (error) {
      this.loading = false
      console.error('Error loading customers:', error);
      this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudieron cargar los clientes. Inténtelo de nuevo más tarde.',
        buttons: ['OK']
      }).then(alert => alert.present());
    }
  }

  async handleRefresh(event: Event) {
    await this.loadCustomers();
    (event as CustomEvent).detail.complete(); // Completa el refresco
  }

  selectCustomer(customer) {
    this.customers.forEach(c => c.selected = false); // Deseleccionar todos los clientes
    customer.selected = true; // Seleccionar el cliente clickeado
  }

  openMap(latitude, longitude) {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
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
