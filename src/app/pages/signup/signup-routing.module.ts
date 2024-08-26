import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SignupPage } from './signup';
import { LoginGuard } from '../../providers/login.guard'

const routes: Routes = [
  {
    path: '',
    component: SignupPage,
    canActivate: [LoginGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SignupPageRoutingModule { }
