import { Component } from '@angular/core';

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';


import { User as FirebaseUser } from 'firebase/auth';


import { AuthService } from '../login/services/auth.service';
import { PhotosService } from '../services/photos.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  profile!: FirebaseUser;
  photos: any[] = [];

  constructor(
    private authService: AuthService,
    private photosService: PhotosService
  ) {

    // se obtiene el estado del usuario -login-
    this.authService.getAuthState().subscribe((dataAuth: FirebaseUser | null) => {
      // se obtienen los datos del usuario, sino existe se crea el nuevo usuario
      if (dataAuth) {

        this.profile = dataAuth;

      } else {
        // No tiene auth
      }
    });

    this.photosService.getPhotosPaginated().subscribe((photos) => {
      this.photos = photos;
      console.log('photos', photos);

    });

  }

  async getPhoto(source: 'Photos' | 'Camera' = 'Photos') {

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource[source]
    });

    this.photosService.savePhoto(image.base64String!);

  }

  handleRefresh(event: any) {
    this.photosService.refreshPhotos().then(() => {
      event.target.complete();
    });
  }



}
