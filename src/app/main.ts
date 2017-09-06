declare var require: any
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';
import { KeycloakService } from '../services/keycloak.service';
import Request from 'request-promise'
import Sync from '@akeating-redhat/fh-sync-js';

const mcpConfig = require('../config/mcp-config.json');

const requestOptions: any = {
  uri: mcpConfig.host + '/sdk/mobileapp/' + mcpConfig.appID + '/config',
  headers: {
    'x-app-api-key': mcpConfig.apiKey
  },
  json: true
};

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
    })
  }
}

// TODO: Clean this up, SyncService
Request(requestOptions).then((response) => {
  Sync.init({
    cloudUrl: response['fh-sync-server'].config.uri,
    storage_strategy: 'dom'
  });
  Sync.manage('myShoppingList', {
    cloudUrl: response['fh-sync-server'].config.uri,
    storage_strategy: 'dom'
  }, {}, {}, () => {
    KeycloakService.init(response['keycloak'])
    .then(() => {
      if(response['keycloak']) {
        const syncCloudUrl = response['fh-sync-server'].config.uri + '/sync/';
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
    })
    .catch((err) => {
      return console.error("Error initalizing Keycloak", err)
    });
  });

}).catch((err) => {
  return console.error('Error retrieving MCP configuration: ', err);
});
