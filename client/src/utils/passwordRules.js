// Password validation rules for RentOwl
export const passwordRules = [
  { label: 'At least 8 characters', test: pw => pw.length >= 8 },
  { label: 'At least one lowercase letter', test: pw => /[a-z]/.test(pw) },
  { label: 'At least one uppercase letter', test: pw => /[A-Z]/.test(pw) },
  { label: 'At least one number', test: pw => /[0-9]/.test(pw) },
  { label: 'At least one symbol (@!#$%^&*)', test: pw => /[@!#$%^&*]/.test(pw) },
];
