import {devApi} from '../build/config_dev.js';
import {prodApi} from '../build/config_prod.js';
import {testApi} from '../build/config_test.js';

const apiEnvMap = {
  'nmap-web-editor.idc-uat.nioint.com': testApi,
  'nmap-web-editor.idc-prod.nioint.com': prodApi,
  localhost: prodApi,
};

if (apiEnvMap[window.location.hostname]) {
  window.api = apiEnvMap[window.location.hostname];
} else {
  window.api = prodApi;
}
