"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenderType = exports.ReactionType = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["SUP_USER"] = "sup_user";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
;
var ReactionType;
(function (ReactionType) {
    ReactionType["BENEFITED"] = "benefited";
    ReactionType["NOT_BENEFITED"] = "not_benefited";
})(ReactionType || (exports.ReactionType = ReactionType = {}));
var GenderType;
(function (GenderType) {
    GenderType["MALE"] = "male";
    GenderType["FEMALE"] = "female";
})(GenderType || (exports.GenderType = GenderType = {}));
//# sourceMappingURL=enum.roles.js.map