export const ActionInRequestEnum = {
  REJECTED: 1,
  ACCEPTED: 2,
};

export const RequestStatusEnum = {
  PENDING: 0,
  ...ActionInRequestEnum,
};

export const RequestsTypeEnum = {
  ALL: 3,
  ...RequestStatusEnum,
};

Object.freeze(ActionInRequestEnum);
Object.freeze(RequestStatusEnum);
Object.freeze(RequestsTypeEnum);
