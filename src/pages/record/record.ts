import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { KeycloakService } from '../../services/keycloak.service';
import viewGuardRules from "../../config/viewGuardRules";
import Sync from '@akeating-redhat/fh-sync-js';

@Component({
  selector: 'page-record',
  templateUrl: 'record.html',
  providers: [KeycloakService]
})
export class RecordPage {
  listItem: any = { data: { name: '' } };
  pageTitle: string = 'Add an item';
  editItem: boolean = false;

  constructor(private keycloak: KeycloakService, public navCtrl: NavController, public viewCtrl: ViewController, public navParams: NavParams) {
  }

  createItem() {
    const close = this.close.bind(this);
    if(this.editItem) {
      Sync.doUpdate('myShoppingList', this.listItem.uid, this.listItem.data, close, close);
    } else {
      Sync.doCreate('myShoppingList', this.listItem.data, close, close);
    }
  }

  close() {
    this.viewCtrl.dismiss();
  }

  ionViewDidLoad() {
    if(this.navParams.get('item')) {
      this.pageTitle = 'Edit an item';
      this.listItem = this.navParams.get('item');
      this.editItem = true;
    } else {
      console.log('SettingListItem')
      this.editItem = false;
      this.listItem = { data: { name: '', created: Date.now() } };
    }
  }

  /**
  * Check Auth state before rendering the view to allow/deny access for rendering this view
  */
  ionViewCanEnter(): boolean {
    return this.keycloak.viewGuard(viewGuardRules.write);
  }

}
