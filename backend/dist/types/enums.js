"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactType = exports.RequestStatus = exports.UrgencyLevel = exports.BloodType = exports.Role = void 0;
var Role;
(function (Role) {
    Role["HOSPITAL"] = "HOSPITAL";
    Role["BLOOD_BANK"] = "BLOOD_BANK";
})(Role || (exports.Role = Role = {}));
var BloodType;
(function (BloodType) {
    BloodType["A_POS"] = "A_POS";
    BloodType["A_NEG"] = "A_NEG";
    BloodType["B_POS"] = "B_POS";
    BloodType["B_NEG"] = "B_NEG";
    BloodType["O_POS"] = "O_POS";
    BloodType["O_NEG"] = "O_NEG";
    BloodType["AB_POS"] = "AB_POS";
    BloodType["AB_NEG"] = "AB_NEG";
})(BloodType || (exports.BloodType = BloodType = {}));
var UrgencyLevel;
(function (UrgencyLevel) {
    UrgencyLevel["NORMAL"] = "NORMAL";
    UrgencyLevel["URGENT"] = "URGENT";
    UrgencyLevel["CRITICAL"] = "CRITICAL";
})(UrgencyLevel || (exports.UrgencyLevel = UrgencyLevel = {}));
var RequestStatus;
(function (RequestStatus) {
    RequestStatus["PENDING"] = "PENDING";
    RequestStatus["RESERVED"] = "RESERVED";
    RequestStatus["EMERGENCY"] = "EMERGENCY";
    RequestStatus["FULFILLED"] = "FULFILLED";
    RequestStatus["REJECTED"] = "REJECTED";
})(RequestStatus || (exports.RequestStatus = RequestStatus = {}));
var ContactType;
(function (ContactType) {
    ContactType["NSS"] = "NSS";
    ContactType["CHARITY"] = "CHARITY";
    ContactType["CLUB"] = "CLUB";
})(ContactType || (exports.ContactType = ContactType = {}));
