import { Injectable } from '@angular/core';

import { Observable, BehaviorSubject } from 'rxjs';


/** Firebase Modules **/
import { getApp } from 'firebase/app';
import { User as FirebaseUser } from 'firebase/auth';
import {
  Firestore,
  DocumentReference,
  DocumentData,
  FirestoreSettings,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  getFirestore,
  initializeFirestore,
  enableIndexedDbPersistence,
  disableNetwork,
  enableNetwork,
  collection, query, where, getDocs,
  increment,
  onSnapshot,
  limitToLast,
  orderBy as orderByQuery,
  startAfter,
  endBefore,
  orderBy, limit,
  QuerySnapshot
} from 'firebase/firestore';

import { getStorage, ref, uploadString, getDownloadURL, FirebaseStorage } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class PhotosService {
  private storage!: FirebaseStorage;
  private db!: Firestore;

  private photos: DocumentData[] = [];
  private lastPhoto: DocumentData | null = null;
  private photosSubject = new BehaviorSubject<DocumentData[]>([]);


  constructor() {
    this.init();
  }

  getPhotosPaginated(): Observable<DocumentData[]> {
    return this.photosSubject.asObservable();
  }

  async init() {
    const firestoreSettings: FirestoreSettings & { useFetchStreams: boolean } = {
      useFetchStreams: false
    };
    initializeFirestore(getApp(), firestoreSettings);
    this.db = getFirestore(getApp());
    this.storage = getStorage(getApp());
    await enableIndexedDbPersistence(this.db)
      .then(async () => { }).catch((err) => {
        console.log('Error in persistence', err);
        if (err.code === 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a a time.
          // ...
        } else if (err.code === 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
          // ...
        }
      });
    this.loadMore();
  }

  async savePhoto(imageBase64: string): Promise<string> {

    // crea un uid para firestore usando la fecha actual
    const uidPhoto = new Date().getTime().toString();

    return new Promise((resolve, reject) => {
      this.uploadPhotoToStorage(uidPhoto, imageBase64).then((urlPhoto) => {
        const photo = {
          uid: uidPhoto,
          url: urlPhoto
        };
        setDoc(doc(this.db, 'chessPhotos-photos', photo.uid), photo).then(() => {
          console.log('Document successfully written!');
        }).catch((error) => {
          console.error('Error writing document: ', error);
        });
        this.photos = [photo, ...this.photos];
        this.photosSubject.next(this.photos);
        resolve(urlPhoto);

      }).catch(error => reject(error));

    });

  }



  uploadPhotoToStorage(uidPhoto: string, imageBase64: string): Promise<string> {

    return new Promise((resolve, reject) => {

      const storageRef = ref(this.storage, `chessPhotos/photos/${uidPhoto}}.jpg`);
      // Base64 formatted string
      uploadString(storageRef, imageBase64, 'base64').then((snapshot) => {
        console.log('Uploaded a base64 string! ', snapshot);

        // Upload completed successfully, now we can get the download URL
        getDownloadURL(storageRef).then((downloadURL) => {
          resolve(downloadURL);
        });

      }).catch(error => reject(error));


    });


  }



  async loadMore() {
    let q = query(
      collection(this.db, 'chessPhotos-photos'),
      orderBy('uid', 'desc'),
      limit(20)
    );

    if (this.lastPhoto) {
      q = query(
        collection(this.db, 'chessPhotos-photos'),
        orderBy('uid', 'desc'),
        startAfter(this.lastPhoto),
        limit(20)
      );
    }

    const querySnapshot = await getDocs(q);
    const newPhotos: DocumentData[] = [];

    querySnapshot.forEach((document) => {
      newPhotos.push(document.data());
    });

    this.photos = [...this.photos, ...newPhotos];

    this.photosSubject.next(this.photos);

  }


  // retorna una promesa que se cumple cuando se refresquen las fotos
  refreshPhotos(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.photos = [];
      this.lastPhoto = null;
      this.photosSubject.next([]);
      this.loadMore().then(() => resolve());
    });

  }


}
