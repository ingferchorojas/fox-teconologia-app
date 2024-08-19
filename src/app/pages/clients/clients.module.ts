import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ClientsPage } from './clients';
import { ClientsPageRoutingModule } from './clients-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ClientsPageRoutingModule
    ],
    declarations: [
        ClientsPage
    ]
})
export class ClientsModule { }
