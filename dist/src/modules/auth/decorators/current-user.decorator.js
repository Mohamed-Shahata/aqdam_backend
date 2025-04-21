"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
const constant_1 = require("../../../utils/constant");
exports.CurrentUser = (0, common_1.createParamDecorator)((data, context) => {
    const request = context.switchToHttp().getRequest();
    const payload = request[constant_1.CURRENT_USER_KEY];
    return payload;
});
//# sourceMappingURL=current-user.decorator.js.map