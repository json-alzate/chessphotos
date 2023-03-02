import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { LoginButtonComponent } from './components/login-button/login-button.component';


@NgModule({
  declarations: [
    LoginButtonComponent
  ],
  exports: [
    LoginButtonComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class LoginModule { }
