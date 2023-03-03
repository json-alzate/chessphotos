import { Component, OnInit } from '@angular/core';

import { User as FirebaseUser } from 'firebase/auth';


import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.scss'],
})
export class LoginButtonComponent implements OnInit {

  profile!: FirebaseUser;
  loading = false;

  constructor(
    private authService: AuthService
  ) {
    this.authService.init();
    // se obtiene el estado del usuario -login-
    this.authService.getAuthState().subscribe((dataAuth: FirebaseUser | null) => {
      // se obtienen los datos del usuario, sino existe se crea el nuevo usuario
      if (dataAuth) {

        this.profile = dataAuth;

      } else {
        // No tiene auth
      }
    });
  }

  ngOnInit() { }

  setProfile(profile: any) {
    this.profile = profile;
  }

  launchLoginGoogle() {
    this.authService.loginGoogle();
  }

}
