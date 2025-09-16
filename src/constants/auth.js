export const JWT_CLAIMS = {
  ID: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  USERNAME: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  EMAIL: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  ROLE: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
};

export const API_ENDPOINTS = {
  LOGIN: 'identity/Authentication/Login',
  REGISTER: 'identity/Authentication/Registration',
  REFRESH_TOKEN: 'identity/Authentication/UpdateToken',
  UPDATE_PROFILE: 'identity/api/User',
  LOGIN_GOOGLE: 'identity/Authentication/ExternalLogin'
};