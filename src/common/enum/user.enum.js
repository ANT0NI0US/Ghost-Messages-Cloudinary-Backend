export const GenderEnum = {
  MALE: 0,
  FEMALE: 1,
};

export const RoleEnum = {
  USER: 0,
  ADMIN: 1,
};

export const ProviderEnum = {
  SYSTEM: 0,
  GOOGLE: 1,
};

export const AccountStatusEnum = {
  ARCHIVE: 0,
  ACTIVE: 1,
};

export const UsersByAccountStatusEnum = {
  ARCHIVE: 0,
  ACTIVE: 1,
  ALL: 2,
};

Object.freeze(GenderEnum);
Object.freeze(RoleEnum);
Object.freeze(ProviderEnum);
Object.freeze(AccountStatusEnum);
Object.freeze(UsersByAccountStatusEnum);
