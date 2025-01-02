import {devApi} from './config_dev';
import {localDevApi} from './config_local_dev';
import {prodApi} from './config_prod';
import {testApi} from './config_test';

const apiEnvMap = {
  'nio-mark-platform-uat.nioint.com.nioint.com': testApi,
  'nio-mark-platform-uat.nioint.com': testApi,
  'nio-mark-platform.nioint.com': prodApi,
};

if (apiEnvMap[window.location.hostname]) {
  window.api = apiEnvMap[window.location.hostname];
} else {
  window.api = prodApi;
}
