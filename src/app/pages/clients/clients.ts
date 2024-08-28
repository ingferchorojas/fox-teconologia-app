import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ModalController, ToastController, Config, IonModal } from '@ionic/angular';
import { App } from '@capacitor/app';
import { ClientData } from '../../providers/client-data'; // Ajusta la ruta al servicio
import { Geolocation } from '@capacitor/geolocation';
import { OverlayEventDetail } from '@ionic/core/components';
import * as L from 'leaflet';

@Component({
  selector: 'page-clients',
  templateUrl: 'clients.html',
  styleUrls: ['./clients.scss'],
})
export class ClientsPage implements OnInit {
  @ViewChild('modalTrigger') modal: IonModal;

  message = 'This modal example uses triggers to automatically open a modal when the button is clicked.';
  name: string;

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

  loading = true;

  defaultLatitude = -25.439967325365544;
  defaultLongitude = -56.42787288104681;

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

    // Llamar a getCurrentLocation solo si el segmento es 'add'
    if (this.segment === 'add') {
      this.getCurrentLocation();
    }
  }

  async openModal() {
    await this.modal.present();
  
    // Configurar el mapa en el modal
    setTimeout(() => {
      const map = L.map('map').setView([this.newCustomer.latitude, this.newCustomer.longitude], 13);
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
  
      // Crear un ícono personalizado
      const customIcon = L.icon({
        iconUrl: '../../../assets/leaflet/marker-icon-2x.png', // Ruta de tu ícono personalizado
        iconSize: [28, 48], // Tamaño del ícono
        iconAnchor: [19, 38], // Punto de anclaje del ícono (centro inferior)
        popupAnchor: [0, -38]  // Punto donde se ancla el popup (justo encima del ícono)
      });
  
      // Agregar el marcador draggable con el ícono personalizado
      const marker = L.marker([this.newCustomer.latitude, this.newCustomer.longitude], {
        draggable: true,
        icon: customIcon // Usar el ícono personalizado
      }).addTo(map)
        .bindPopup('Ubicación del cliente')
        .openPopup();
  
      // Actualizar las coordenadas cuando el marcador se mueve
      marker.on('dragend', (event: L.LeafletEvent) => {
        const position = event.target.getLatLng();
        this.defaultLatitude = position.lat;
        this.defaultLongitude = position.lng;
      });
  
      // Permitir seleccionar un nuevo punto con clic
      map.on('click', (event: L.LeafletMouseEvent) => {
        const position = event.latlng;
        marker.setLatLng(position); // Mover el marcador al nuevo punto
        this.defaultLatitude = position.lat;
        this.defaultLongitude = position.lng;
        marker.bindPopup('Nueva ubicación').openPopup(); // Actualizar el popup del marcador
      });
    }, 300); // Delay para asegurar que el modal está completamente renderizado
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
      
      // Llamar a getCurrentLocation al cargar el formulario para agregar un cliente
      this.getCurrentLocation();
    }
  }

  async loadCustomers() {
    try {
      const data = await this.clientData.getClientData(); // Obtiene los datos desde el servicio
      this.customers = data; // Asigna los datos a la lista de clientes
      console.log("customers", this.customers)
      this.loading = false;
    } catch (error) {
      this.loading = false;
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
  async submitForm(form) {
    if (form.valid) {
      try {
        // Llamar al servicio para agregar el nuevo cliente
        this.loading = true;
        const response = await this.clientData.addClient(this.newCustomer);
        console.log('Respuesta del servidor:', response);
        this.loading = false;
        if (response && !response.error) {
          // Agregar el nuevo cliente a la lista localmente si la respuesta es exitosa
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

          // Muestra un mensaje de éxito
          const toast = await this.toastCtrl.create({
            message: 'Cliente registrado exitosamente',
            duration: 2000,
            position: 'top'
          });
          toast.present();
        } else {
          this.loading = false;
          throw new Error(response.message || 'Error desconocido');
        }
      } catch (error) {
        this.loading = false;
        console.error('Error al registrar cliente:', error);
        // Muestra un mensaje de error
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudo registrar el cliente. Inténtelo de nuevo más tarde.',
          buttons: ['OK']
        });
        await alert.present();
      }
    } else {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Por favor, complete todos los campos correctamente.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async getCurrentLocation() {
    try {
      // Verificar permisos de ubicación
      const permissions = await Geolocation.checkPermissions();
      
      // Solicitar permisos si no están concedidos
      if (permissions.location !== 'granted') {
        const result = await Geolocation.requestPermissions();
        if (result.location !== 'granted') {
          // Si el permiso sigue sin ser concedido, informar al usuario
          const alert = await this.alertCtrl.create({
            header: 'Permiso Denegado',
            message: 'Para registrar clientes, necesitas permitir el acceso a tu ubicación.',
            buttons: ['OK']
          });
          await alert.present();
          return; // Salir de la función si no se concedió el permiso
        }
      }
      
      // Obtener la ubicación actual
      this.loading = true;
      const coordinates = await Geolocation.getCurrentPosition();
      this.newCustomer.latitude = coordinates.coords.latitude;
      this.newCustomer.longitude = coordinates.coords.longitude;
      this.loading = false;
      
    } catch (error) {
      this.loading = false;
      console.error('Error obteniendo ubicación:', error);
      // Mostrar alerta de error
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo obtener la ubicación. Verifica los permisos y vuelve a intentarlo.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.newCustomer.latitude = this.defaultLatitude;
    this.newCustomer.longitude = this.defaultLongitude;
    this.modal.dismiss(this.name, 'confirm');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.message = `Hello, ${ev.detail.data}!`;
    }
  }

  callPhone(phone: string) {
    const dialerUrl = `tel:${phone}`;
    window.open(dialerUrl, '_system');
  }
  
  editCustomer(customer: any) {
    // Aquí puedes implementar la lógica para editar el cliente
    console.log(`Editando cliente: ${customer.name}`);
  }
  
  deleteCustomer(customer: any) {
    // Aquí puedes implementar la lógica para borrar el cliente
    console.log(`Borrando cliente: ${customer.name}`);
  }
}
