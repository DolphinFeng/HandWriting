export const DOMAIN_MAP_TMS = {
  'nmap-prior-issue-web.idc-uat.nioint.com': 'http://nmap-tms-rbac.idc-uat.nioint.com',
  'nmap-prior-issue-web.idc-prod.nioint.com': 'http://nmap-tms-rbac.idc-prod.nioint.com',
  'localhost': 'http://nmap-tms-rbac.idc-uat.nioint.com',
};

let Domain = DOMAIN_MAP_TMS[window.location.hostname];

if (Domain === undefined) {
  Domain = 'http://nmap-tms-rbac.idc-uat.nioint.com';
}

export default DOMAIN_MAP_TMS