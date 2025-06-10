// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding() 
    ),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: "AIzaSyA5XtwCHOy2Mc2JGvs-el17xoc-4slQOKc",
  authDomain: "join-da-ee725.firebaseapp.com",
  projectId: "join-da-ee725",
  storageBucket: "join-da-ee725.firebasestorage.app",
  messagingSenderId: "251223421284",
  appId: "1:251223421284:web:a748e0c05e6a600907ca71",
  measurementId: "G-5PJYYZ7LHV"
      })
    ),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideAnimationsAsync(),
  ],

  
};
