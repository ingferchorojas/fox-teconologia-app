import { Component } from '@angular/core';

import { PopoverController } from '@ionic/angular';

@Component({
  template: `
    <ion-list>
    <ion-item button (click)="close('https://wa.me/595981474248?text=Hola,%20necesito%20ayuda%20con%20la%20app')">
        <ion-label>Whatsapp</ion-label>
      </ion-item>
      <ion-item button (click)="close('https://github.com/ingferchorojas/fox-teconologia-app')">
        <ion-label>GitHub Repositorio</ion-label>
      </ion-item>
    </ion-list>
  `
})
export class PopoverPage {
  constructor(public popoverCtrl: PopoverController) {}

  support() {
    // this.app.getRootNavs()[0].push('/support');
    this.popoverCtrl.dismiss();
  }

  close(url: string) {
    window.open(url, '_blank');
    this.popoverCtrl.dismiss();
  }
}
