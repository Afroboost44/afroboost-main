// // ================localhost=================
// export const baseURL = 'http://localhost:3003';
// export const devURL = 'http://localhost:3000';


// =============  Deployed (VPS server) n==============
const httpPort = 3003;
const httpsPort = 3004;
const protocol = window.location.protocol === 'https:' ? 'https://' : 'http://';
export const baseURL = `${protocol}afroboost.com:${(protocol === 'https://') ? httpsPort : httpPort}`;
export const devURL = `${protocol}afroboost.com`;
