import { RecordPage } from './../record/record';
import { Component, NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';
import { KeycloakService } from '../../services/keycloak.service';
import { AlertController, ModalController } from 'ionic-angular';
import viewGuardRules from "../../config/viewGuardRules";
import Sync from '@akeating-redhat/fh-sync-js';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [KeycloakService]
})

export class HomePage {
profile: any;
listItems: any;

  /**
  * @param keycloak The Keycloak Service
  * @param alertCtrl The ionic alert controller
  * @param navCtrl The Ionic Navigation Controller
  */
  constructor(private keycloak: KeycloakService, private zone: NgZone, public alertCtrl: AlertController, public modalCtrl: ModalController, public navCtrl: NavController) {
    this.keycloak = keycloak;
    this.alertCtrl = alertCtrl;
    this.navCtrl = navCtrl;
    this.profile = {};
    this.listItems = [];
  }

  showItem(item): void {
    const recordModal = this.modalCtrl.create(RecordPage, { item: item });
    recordModal.present();
  }

  deleteItem(item): void {
    console.log('Deleting item ', item, this.listItems);
    Sync.doDelete('myShoppingList', item.uid, () => {}, () => {});
  }

  ionViewDidEnter(): void {
    Sync.notify('myShoppingList', () => {
      this.updateList('myShoppingList')
    });
  }

  updateList(datasetId): void {
    Sync.doList(datasetId, (dataset) => {
      const newListItems = [];
      Object.keys(dataset).forEach((key) => {
        dataset[key].uid = key;
        newListItems.push(dataset[key]);
      });
      this.zone.run(() => {
        this.listItems = newListItems.reverse();
      })
    }, (err, datasetId) => {
      console.error('Error occurred during list ', err);
    })
  }

  /**
  * Check Auth state before rendering the view to allow/deny access for rendering this view
  */
  ionViewCanEnter(): boolean {
    return this.keycloak.viewGuard(viewGuardRules.default);
  }

}
