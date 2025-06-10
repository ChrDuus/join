import { Component, inject } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { FeedbackServiceService } from '../../services/feedback.service';
import { Userdata } from '../../interfaces/userdata';
import { NgClass, CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

/**
 * Component responsible for user registration functionality.
 * Handles form validation, user registration, and redirects after successful signup.
 */
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  /** Service for managing contact data */
  contactService = inject(ContactService);

  /** Service for showing user feedback messages */
  feedbackService = inject(FeedbackServiceService);

  /** Keeps track of which form fields are currently invalid */
  invalidFields: string[] = [];

  /** Whether the privacy policy checkbox is accepted */
  privacyAccepted: boolean = false;

  /** Controls whether the privacy policy dialog is shown */
  showPrivacy = false;

  /** User input values grouped into a Userdata object */
  newUserData: Userdata = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  }

  /** Input field: user's name */
  name: string = '';

  /** Input field: user's email */
  email = '';

  /** Input field: password */
  password = '';

  /** Input field: confirm password */
  passwordConfirm = '';

  /** Error message shown on registration failure */
  public error = '';

  /** Flags for privacy policy validation */
  privacyError: boolean = false;
  showPrivacyError: boolean = false;

  /** Controls visibility of password field */
  passwordVisible: boolean = false;

  /** Controls visibility of confirm password field */
  confirmPasswordVisible: boolean = false;

  /** Flags indicating if user has entered text into password fields */
  passwordEntered: boolean = false;
  confirmPasswordEntered: boolean = false;

  /**
   * Constructor injecting authentication and routing services.
   * @param authService - Handles user authentication
   * @param router - For navigation after successful registration
   */
  constructor(public authService: AuthService, private router: Router) {}

  /**
   * Tracks whether the user has typed into password fields and resets visibility on empty input.
   * @param field - Either 'password' or 'confirmPassword'
   */
  onPasswordInput(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.passwordEntered = this.password.length > 0;
      if (!this.passwordEntered) this.passwordVisible = false;
    } else {
      this.confirmPasswordEntered = this.passwordConfirm.length > 0;
      if (!this.confirmPasswordEntered) this.confirmPasswordVisible = false;
    }
  }

  /**
   * Validates the privacy policy checkbox if other form inputs are valid.
   */
  validatePrivacy() {
    this.autoValidatePrivacyIfReady();
  }

  /**
   * Toggles the visibility of a password field.
   * Only works if the user has entered a value.
   * @param field - Either 'password' or 'confirmPassword'
   */
  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password' && this.passwordEntered) {
      this.passwordVisible = !this.passwordVisible;
    } else if (field === 'confirmPassword' && this.confirmPasswordEntered) {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
    }
  }

  /**
   * Handles user registration.
   * Performs validations and redirects on success.
   */
  public async onRegister() {
    if (this.password === this.passwordConfirm) {
      try {
        await this.authService.register(this.email, this.password, this.name);
        if (!this.checkIfMailinUseInContact()) {
          await this.contactService.addContact({
            name: this.name,
            email: this.email,
            phone: 'Not existing yet'
          });
        }
        this.authService.UserLoggedIn = this.authService.getUsername(this.email);
        this.router.navigate(['/login']);
        this.feedbackService.show('Registration successful');
      } catch (err: any) {
        this.error = err.message;
      }
    }
  }

  /**
   * Checks if a contact with the given email already exists.
   * @returns true if the email is already in use
   */
  checkIfMailinUseInContact(): boolean {
    return this.contactService.contactList.some(c => c.email === this.email);
  }

  /**
   * Returns true if all required fields are valid.
   */
  get isFormValid(): boolean {
    const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.email);
    return this.name.trim().length >= 2 &&
           isEmailValid &&
           this.password.length >= 6 &&
           this.passwordConfirm.length >= 6;
  }

  /**
   * Validates a single form field and updates the invalidFields array.
   * @param field - The field name to validate
   */
  validateForm(field: string) {
    const addFieldIfInvalid = (condition: boolean, fieldName: string) => {
      if (condition && !this.invalidFields.includes(fieldName)) {
        this.invalidFields.push(fieldName);
      } else if (!condition) {
        this.invalidFields = this.invalidFields.filter(f => f !== fieldName);
      }
    };

    if (field === 'name') this.validateName(addFieldIfInvalid);
    if (field === 'email') this.validateMail(addFieldIfInvalid);
    if (field === 'password') this.validatePassword(addFieldIfInvalid);
    if (field === 'confirmPassword') this.validateConfirmedPassword(addFieldIfInvalid);

    this.autoValidatePrivacyIfReady();
  }

  /**
   * Checks if privacy checkbox is unchecked while all other inputs are valid.
   * Displays a visual error if necessary.
   */
  autoValidatePrivacyIfReady() {
    const allInputsValid = this.invalidFields.length === 0 && this.isFormValid;
    this.showPrivacyError = allInputsValid && !this.privacyAccepted;
  }

  /**
   * Validates the name field.
   * @param addFieldIfInvalid - Callback to update validation status
   */
  validateName(addFieldIfInvalid: Function) {
    const isInvalid = !this.name || this.name.trim().length < 2;
    addFieldIfInvalid(isInvalid, 'name');
  }

  /**
   * Validates the email field format.
   * @param addFieldIfInvalid - Callback to update validation status
   */
  validateMail(addFieldIfInvalid: Function) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const email = this.email?.trim().toLowerCase();
    const isInvalid = !email || !emailRegex.test(email);
    addFieldIfInvalid(isInvalid, 'email');
  }

  /**
   * Validates the password field and re-validates the confirm password field.
   * @param addFieldIfInvalid - Callback to update validation status
   */
  validatePassword(addFieldIfInvalid: Function) {
    const isInvalid = !this.password || this.password.length < 6;
    addFieldIfInvalid(isInvalid, 'password');

    if (this.newUserData.confirmPassword) {
      this.validateForm('confirmPassword');
    }
  }

  /**
   * Validates that the confirmation password matches the main password.
   * @param addFieldIfInvalid - Callback to update validation status
   */
  validateConfirmedPassword(addFieldIfInvalid: Function) {
    const isInvalid = this.passwordConfirm !== this.password;
    addFieldIfInvalid(isInvalid, 'confirmPassword');
  }

  /**
   * Navigates to a given route path.
   * @param target - The route string to navigate to
   */
  goToAnotherPage(target: string): void {
    this.router.navigate([target]);
  }

  /**
   * Navigates back to the home page and sets a flag to skip animation.
   */
  onBackClick(): void {
    localStorage.setItem('skipLoginAnimation', 'true');
    this.router.navigate(['/']);
  }

  /**
   * Closes the privacy dialog.
   */
  closePrivacy() {
    this.showPrivacy = false;
  }
}
