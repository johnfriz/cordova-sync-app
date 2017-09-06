import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import Keycloak from 'keycloak-js';

@Injectable()
/**
 * Contains properties of the Keycloak Service.
 */
export class KeycloakService {
  static auth: any = {};
  static enabled: boolean = false;

  /**
  * @param alertCtrl The ionic alert controller
  */
  constructor(public alertCtrl: AlertController) {
    this.alertCtrl = alertCtrl;
  }

  /**
  * Initialise the Keycloak Client Adapter
  */
  static init(keycloakConfig: any): Promise<any> {
    if (keycloakConfig) {
      let keycloakAuth: any = Keycloak(keycloakConfig.config);

      return new Promise((resolve, reject) => {
        keycloakAuth.init({ onLoad: 'login-required', flow: 'implicit' }).success(() => {
          KeycloakService.auth.authz = keycloakAuth;
          KeycloakService.auth.logoutUrl = keycloakAuth.authServerUrl + "/realms/keypress/protocol/openid-connect/logout?redirect_uri=/";
          KeycloakService.enabled = true;
          resolve();
        }).error((err) => {
          reject(err);
        });
      });
    }
    return new Promise((resolve, reject) => { return resolve() });
  }
  /**
  * Redirect to logout
  */
  logout(): void {
    KeycloakService.auth.authz.logout();
  }
  /**
   * Redirect to Login
   */
  login(): void {
    KeycloakService.auth.authz.login();
  }
  /**
   * Clears Authentication State
   */
  clearToken(): void {
    KeycloakService.auth.authz.clearToken();
  }

  /**
   * Redirects to the Account Management Console
   */
  accountManagement(): void {
    KeycloakService.auth.authz.accountManagement();
  }
  /**
   * Get the users profile
   */
  loadUserProfile(): any {
    return new Promise((resolve, reject) => {
      KeycloakService.auth.authz.loadUserProfile().success((profile) => {
        resolve(<object>profile);
      }).error(() => {
        reject('Failed to retrieve user profile');
      });
    });
  }
  /**
   * Check if the user has a given role
   * @param role The role to check if the user posesses
   */
  viewGuard(role: string): boolean {
    if (!KeycloakService.enabled ||KeycloakService.auth.authz.hasRealmRole(role)) {
      return true
    } else {
      this.alertCtrl.create({ title: 'Access Denied', subTitle: "You don't have access to the requested resource." }).present();
      return false;
    }
  }

  authEnabled(): boolean {
    return KeycloakService.enabled;
  }
}
