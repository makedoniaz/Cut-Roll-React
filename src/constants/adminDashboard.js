export const ADMIN_DASHBOARD_ENDPOINTS = {
  GET_USERS_FILTERED: 'admindashboard/Admin/GetUsersFiltered',
  GET_FILTERED_USER_COUNT: 'admindashboard/Admin/GetFilteredUserCount',
  ASSIGN_ROLE: 'admindashboard/Admin/AssignRole',
  REMOVE_ROLE: 'admindashboard/Admin/RemoveRole',
  TOGGLE_BAN: 'admindashboard/Admin/ToggleBan',
  TOGGLE_MUTE: 'admindashboard/Admin/ToggleMute'
};

export const ADMIN_DASHBOARD_DEFAULTS = {
  SEARCH_TERM: null,
  ROLE: 0,
  IS_BANNED: false,
  IS_MUTED: false,
  REGISTERED_AFTER: '2025-08-01T00:00:00.000Z', // 01.08.2025
  REGISTERED_BEFORE: new Date().toISOString(), // Current date
  PAGE_NUMBER: 1,
  PAGE_SIZE: 10
};

export const USER_ROLES = {
    ADMIN: 0,
    USER: 1,
    PUBLISHER: 2
};
