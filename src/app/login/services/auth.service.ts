import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

import { Subject } from 'rxjs';


import {
  User as FirebaseUser,
  UserCredential,
  Auth,
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  initializeAuth,
  indexedDBLocalPersistence
} from 'firebase/auth';
import { getApp } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  initialized = false;

  private auth!: Auth;

  constructor() { }

  /**
   * Init the auth service
   */
  init() {
    if (!this.initialized) {
      this.auth = this.whichAuth();
      this.initialized = true;
    }
  }


  /**
   * Returns the active auth component
   *
   * @returns Auth
   */
  whichAuth() {
    let auth;
    if (Capacitor.isNativePlatform()) {
      auth = initializeAuth(getApp(), {
        persistence: indexedDBLocalPersistence
      });
    } else {
      auth = getAuth();
    }
    return auth;
  }


  /**
 * Para escuchar el estado del usuario logueado
 *
 * @returns Subject<FirebaseUser>
 */
  getAuthState(): Subject<FirebaseUser | null> {
    const authState = new Subject<FirebaseUser | null>();
    this.auth.onAuthStateChanged(user => {
      authState.next(user);
    });
    return authState;
  }



  /**
 * Login Google
 * */
  async loginGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.auth, provider);
  }



}
