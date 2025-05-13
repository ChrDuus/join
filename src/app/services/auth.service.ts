/**
 * Authentication service for user management
 * @fileoverview Provides authentication functionality including login, registration, and logout
 * @module services/auth
 */
import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  query,
  where,
  doc,
  getDocs,
  setDoc,
} from '@angular/fire/firestore';
import { ContactService } from './contact.service';
import { Router } from '@angular/router';
import { FeedbackServiceService } from './feedback.service';

/**
 * Authentication service
 * @description Handles user authentication operations
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Flag to indicate if email is already in use */
  emailAlreadyUsed: boolean = false;
  
  /** Current logged in user stored in local storage */
  UserLoggedIn: string|null = localStorage.getItem('loggedIn');
  
  /** Contact service injection */
  contactService= inject(ContactService);
  
  /** Router injection */
  router= inject(Router);
  
  /** Feedback service injection */
  feedbackService= inject(FeedbackServiceService);
  
  /**
   * Constructor for AuthService
   * @param auth - Firebase Auth instance
   * @param firestore - Firebase Firestore instance
   */
  constructor(private auth: Auth, private firestore: Firestore) {}

  /**
   * Login a user with email/username and password
   * @param emailOrUsername - User's email or username
   * @param password - User's password
   * @returns Firebase user credential promise
   */
  async login(emailOrUsername: string, password: string) {
    let email = emailOrUsername;
    const isEmail = emailOrUsername.includes('@');
    if (!isEmail) {
      const q = query(collection(this.firestore, 'users'), where('username', '==', emailOrUsername));
      const result = await getDocs(q);
      if (result.empty) {
        throw new Error('Username not found');
      }
      const userData = result.docs[0].data();
      email = userData['email'];
    }
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  /**
   * Register a new user
   * @param email - User's email
   * @param password - User's password
   * @param username - User's username
   * @throws Error when registration fails
   */
  async register(email: string, password: string, username: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const uid = userCredential.user.uid;
      await setDoc(doc(this.firestore, 'users', uid), {
        username: username,
        email: email,
      });
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        this.emailAlreadyUsed = true;
      } else {
      }
      throw error;
    }
  }

  /**
   * Get username from email address
   * @param email - User's email address
   * @returns Username corresponding to the email
   */
  getUsername(email:string){
    let userName='';
    this.contactService.contactList.forEach(c =>{
      if(c.email == email){          
        userName=  c.name;
      }
    });
    return userName;
  }

  /**
   * Logout current user
   * @returns Firebase signOut promise
   */
  logout() {
    this.UserLoggedIn= '';
    this.router.navigate(['/login']);
    this.feedbackService.show('Log out successfull');
    localStorage.setItem('loggedIn', this.UserLoggedIn);
    return signOut(this.auth);
  }
}