import { exceptions } from "../common/index.js";

/*
SINGLE
authorization(RoleEnum.ADMIN)
*/
export const authorization = (accessRole) => {
  return async (req, res, next) => {
    if (req.user.role < accessRole) {
      throw exceptions.ForbiddenException({ message: "error.forbidden" });
    }

    next();
  };
};

/*
ARRAY
authorization([RoleEnum.ADMIN ,RoleEnum.USER ])
*/
// export const authorization = (accessRoles) => {
//   return async (req, res, next) => {
//     if (!accessRoles.includes(req.user.role)) {
//       throw exceptions.ForbiddenException({ message: "Forbidden Account" });
//     }

//     next();
//   };
// };

/*
BOTH APPROACHES
authorization(RoleEnum.ADMIN) //* default
authorization([RoleEnum.ADMIN ,RoleEnum.USER ] , byLevel= false)
*/
// export const authorization = (accessRoles, byLevel = true) => {
//   return async (req, res, next) => {
//     switch (byLevel) {
//       case true:
//         if (req.user.role < accessRoles) {
//           throw exceptions.ForbiddenException({ message: "Forbidden Account" });
//         }
//         break;
//       default:
//         if (!accessRoles.includes(req.user.role)) {
//           throw exceptions.ForbiddenException({ message: "Forbidden Account" });
//         }
//         break;
//     }

//     next();
//   };
// };
