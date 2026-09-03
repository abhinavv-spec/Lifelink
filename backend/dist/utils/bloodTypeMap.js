"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_BLOOD_TYPES = exports.reverseBloodTypeMap = exports.bloodTypeMap = void 0;
exports.toBloodTypeEnum = toBloodTypeEnum;
exports.fromBloodTypeEnum = fromBloodTypeEnum;
const enums_1 = require("../types/enums");
exports.bloodTypeMap = {
    'A+': enums_1.BloodType.A_POS,
    'A-': enums_1.BloodType.A_NEG,
    'B+': enums_1.BloodType.B_POS,
    'B-': enums_1.BloodType.B_NEG,
    'O+': enums_1.BloodType.O_POS,
    'O-': enums_1.BloodType.O_NEG,
    'AB+': enums_1.BloodType.AB_POS,
    'AB-': enums_1.BloodType.AB_NEG,
};
exports.reverseBloodTypeMap = {
    [enums_1.BloodType.A_POS]: 'A+',
    [enums_1.BloodType.A_NEG]: 'A-',
    [enums_1.BloodType.B_POS]: 'B+',
    [enums_1.BloodType.B_NEG]: 'B-',
    [enums_1.BloodType.O_POS]: 'O+',
    [enums_1.BloodType.O_NEG]: 'O-',
    [enums_1.BloodType.AB_POS]: 'AB+',
    [enums_1.BloodType.AB_NEG]: 'AB-',
};
function toBloodTypeEnum(display) {
    const mapped = exports.bloodTypeMap[display];
    if (!mapped) {
        throw new Error(`Invalid blood type: ${display}. Valid values: A+, A-, B+, B-, O+, O-, AB+, AB-`);
    }
    return mapped;
}
function fromBloodTypeEnum(bt) {
    return exports.reverseBloodTypeMap[bt];
}
exports.ALL_BLOOD_TYPES = [
    enums_1.BloodType.A_POS,
    enums_1.BloodType.A_NEG,
    enums_1.BloodType.B_POS,
    enums_1.BloodType.B_NEG,
    enums_1.BloodType.O_POS,
    enums_1.BloodType.O_NEG,
    enums_1.BloodType.AB_POS,
    enums_1.BloodType.AB_NEG,
];
