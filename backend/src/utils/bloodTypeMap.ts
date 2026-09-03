import { BloodType } from '../types/enums';

export const bloodTypeMap: Record<string, BloodType> = {
  'A+':  BloodType.A_POS,
  'A-':  BloodType.A_NEG,
  'B+':  BloodType.B_POS,
  'B-':  BloodType.B_NEG,
  'O+':  BloodType.O_POS,
  'O-':  BloodType.O_NEG,
  'AB+': BloodType.AB_POS,
  'AB-': BloodType.AB_NEG,
};

export const reverseBloodTypeMap: Record<BloodType, string> = {
  [BloodType.A_POS]:  'A+',
  [BloodType.A_NEG]:  'A-',
  [BloodType.B_POS]:  'B+',
  [BloodType.B_NEG]:  'B-',
  [BloodType.O_POS]:  'O+',
  [BloodType.O_NEG]:  'O-',
  [BloodType.AB_POS]: 'AB+',
  [BloodType.AB_NEG]: 'AB-',
};

export function toBloodTypeEnum(display: string): BloodType {
  const mapped = bloodTypeMap[display];
  if (!mapped) {
    throw new Error(`Invalid blood type: ${display}. Valid values: A+, A-, B+, B-, O+, O-, AB+, AB-`);
  }
  return mapped;
}

export function fromBloodTypeEnum(bt: BloodType): string {
  return reverseBloodTypeMap[bt];
}

export const ALL_BLOOD_TYPES: BloodType[] = [
  BloodType.A_POS,
  BloodType.A_NEG,
  BloodType.B_POS,
  BloodType.B_NEG,
  BloodType.O_POS,
  BloodType.O_NEG,
  BloodType.AB_POS,
  BloodType.AB_NEG,
];
