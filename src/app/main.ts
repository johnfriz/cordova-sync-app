declare var require: any
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';
import { KeycloakService } from '../services/keycloak.service';
import Request from 'request-promise'
import Sync from '@akeating-redhat/fh-sync-js';
import { MobileCore } from '@akeating-redhat/fh-mobile-core';

const mcpConfig = require('../config/mcp-config.json');

function buildSyncCloudHandler(cloudUrl, options) {
  return function (params, success, failure) {
    var url = cloudUrl + params.dataset_id;
    var headers = (options.headers || {});
    Request({
      method: 'POST',
      uri: url,
      headers: headers,
      body: params.req,
      json: true
    })
    .then((res) => {
      return success(res);
    })
    .catch((err) => {
      return failure(err);
    });
  }
}

const bootstrap = function() {
  MobileCore.configure(mcpConfig).then((config) => {
    const syncConfig = config.getConfigFor('fh-sync-server');
    const keycloakConfig = config.getConfigFor('keycloak');

    console.log('Config is ', config);

    Sync.init({
      cloudUrl: syncConfig.uri,
      storage_strategy: 'dom'
    });

    Sync.manage('myShoppingList', null, {}, {}, () => {
      KeycloakService.init(keycloakConfig).then(() => {
        if(keycloakConfig) {
          const syncCloudUrl = syncConfig.uri + '/sync/';
          const syncCloudHandler = buildSyncCloudHandler(syncCloudUrl, {
            headers: {
              'Authorization': 'Bearer ' + KeycloakService.auth.authz.token
            }
          });
          Sync.setCloudHandler(syncCloudHandler);
        }
        const platform = platformBrowserDynamic();
        // Mnaually intiliase angular
        return platform.bootstrapModule(AppModule);
      }).catch((err) => {
        console.error("Error initalizing Keycloak", err);
      });
    });
  }).catch(function(err) {
    console.error('An error occurred while retrieving service configuration', err);
  });
}

if (window['cordova']) {
  document.addEventListener('deviceready', bootstrap);
} else {
  bootstrap();
}
