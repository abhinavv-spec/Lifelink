export enum Role {
  HOSPITAL = 'HOSPITAL',
  BLOOD_BANK = 'BLOOD_BANK'
}

export enum BloodType {
  A_POS = 'A_POS',
  A_NEG = 'A_NEG',
  B_POS = 'B_POS',
  B_NEG = 'B_NEG',
  O_POS = 'O_POS',
  O_NEG = 'O_NEG',
  AB_POS = 'AB_POS',
  AB_NEG = 'AB_NEG'
}

export enum UrgencyLevel {
  NORMAL = 'NORMAL',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  RESERVED = 'RESERVED',
  EMERGENCY = 'EMERGENCY',
  FULFILLED = 'FULFILLED',
  REJECTED = 'REJECTED'
}

export enum ContactType {
  NSS = 'NSS',
  CHARITY = 'CHARITY',
  CLUB = 'CLUB'
}
