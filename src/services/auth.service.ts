import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { from, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment'; 

const app = initializeApp(environment.firebaseConfig);
const auth = getAuth(app);

@Injectable({
  providedIn: 'root' 
})
export class AuthService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Restore user state from local storage on service initialization
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('authUser');
      if (user) {
        // Assume that you might need to manually set this state in your app's state management (if applicable)
        console.log('User restored from local storage:', JSON.parse(user));
        // You can set the user state in your application state management here
      }
    }
  }

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(auth, email, password)).pipe(
      tap((userCredential) => {
        if (isPlatformBrowser(this.platformId)) {
          // Store user info in local storage upon successful login
          localStorage.setItem('authUser', JSON.stringify(userCredential.user));
        }
      })
    );
  }
  
  register(email: string, password: string) {
    return from(createUserWithEmailAndPassword(auth, email, password)).pipe(
      tap((userCredential) => {
        if (isPlatformBrowser(this.platformId)) {
          // Store user info in local storage upon successful registration
          localStorage.setItem('authUser', JSON.stringify(userCredential.user));
        }
      })
    );
  }

  logout() {
    return from(signOut(auth)).pipe(
      tap(() => {
        if (isPlatformBrowser(this.platformId)) {
          // Remove user info from local storage upon logout
          localStorage.removeItem('authUser');
        }
      })
    );
  }

  googleLogin() {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(auth, provider)).pipe(
      tap((userCredential) => {
        if (isPlatformBrowser(this.platformId)) {
          // Store user info in local storage upon successful Google login
          localStorage.setItem('authUser', JSON.stringify(userCredential.user));
        }
      })
    );
  }

  getCurrentUser(): Observable<User | null> {
    return new Observable((subscriber) => {
      onAuthStateChanged(auth, (user) => {
        // Emit the user state to subscribers
        subscriber.next(user);
        if (user && isPlatformBrowser(this.platformId)) {
          // Update localStorage if the user is signed in
          localStorage.setItem('authUser', JSON.stringify(user));
        }
      });
    });
  }
}
