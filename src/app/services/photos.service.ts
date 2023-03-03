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
      this.uploadPhotoToStorage(uidPhoto, imageBase64).then(async (urlPhoto) => {
        const photo = {
          uid: uidPhoto,
          url: urlPhoto
        };
        await setDoc(doc(this.db, 'chessPhotos-photos', photo.uid), photo);
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



  loadMore() {
    let q = query(collection(this.db, 'chessPhotos-photos'),
      orderBy('uid', 'desc'),
      limit(10)
    );

    if (this.lastPhoto) {
      q = query(collection(this.db, 'chessPhotos-photos'),
        orderBy('uid', 'desc'),
        startAfter(this.lastPhoto),
        limit(10)
      );
    }

    onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const newPhotos: DocumentData[] = [];
      querySnapshot.forEach((doc) => {
        newPhotos.push(doc.data());
      });

      this.photos = [...this.photos, ...newPhotos];
      this.photosSubject.next(this.photos);

      this.lastPhoto = querySnapshot.docs[querySnapshot.docs.length - 1];
    });
  }


  // obtiene las fotos de firestore paginadas de 10 en 10
  // async getPhotosPaginated(lastPhoto: DocumentData | null = null): Promise<DocumentData[]> {
  //   const photos: DocumentData[] = [];

  //   let q = query(collection(this.db, 'chessPhotos/photos'),
  //     orderBy('uid', 'desc'),
  //     limit(10)
  //   );

  //   if (lastPhoto) {
  //     q = query(collection(this.db, 'chessPhotos/photos'),
  //       orderBy('uid', 'desc'),
  //       startAfter(lastPhoto['data']().uid),
  //       limit(10)
  //     );
  //   }

  //   const querySnapshot = await getDocs(q);
  //   querySnapshot.forEach((doc) => {
  //     photos.push(doc.data());
  //   });

  //   return photos;
  // }



}
