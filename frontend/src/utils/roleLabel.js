export const roleLabel = (role) => ({
  admin: 'ADMINISTRATOR',
  normal: 'NORMAL USER',
  store_owner: 'STORE OWNER',
}[role] || role.replace('_', ' ').toUpperCase());