import { KeycloakService } from '../../services/keycloak.service';
import { Component } from '@angular/core';

import { HomePage } from './../home/home';
import { AccountPage } from '../account/account';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  listTab = HomePage;
  accountTab = AccountPage;

  constructor(private keycloak: KeycloakService) {

  }

  authEnabled(): boolean {
    return this.keycloak.authEnabled();
  }
}
