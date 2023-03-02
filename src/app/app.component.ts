import { Component } from '@angular/core';
import { environment } from '../environments/environment';
import { initializeApp } from 'firebase/app';



import { AuthService } from './login/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private authService: AuthService,
  ) {
    this.initFirebase();
  }


  async initFirebase() {
    initializeApp(environment.firebase);
    await this.authService.init();
  }


}
