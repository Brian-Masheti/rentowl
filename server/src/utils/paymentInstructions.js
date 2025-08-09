// Utility: Dynamic payment instructions for each method

function getMpesaInstructions(phone) {
  return [
    'Go to M-Pesa',
    'Lipa na M-Pesa',
    'Send Money',
    `Enter Phone Number: ${phone || '(not provided)'}`,
    'Enter Amount',
    'Enter PIN',
    'Confirm.'
  ].join('\n');
}

function getDtbInstructions(account) {
  return [
    'Go to M-Pesa',
    'Lipa na M-Pesa',
    'PayBill',
    'Business Number: 516600',
    `Account: ${account || '(not provided)'}`,
    'Enter Amount',
    'Enter PIN',
    'Confirm.'
  ].join('\n');
}

function getCoopInstructions(account) {
  return [
    'Go to M-Pesa',
    'Lipa na M-Pesa',
    'PayBill',
    'Business Number: 400200',
    `Account: ${account || '(not provided)'}`,
    'Enter Amount',
    'Enter PIN',
    'Confirm.'
  ].join('\n');
}

function getEquityInstructions(account) {
  return [
    'Go to M-Pesa',
    'Lipa na M-Pesa',
    'PayBill',
    'Business Number: 247247',
    `Account: ${account || '(not provided)'}`,
    'Enter Amount',
    'Enter PIN',
    'Confirm.'
  ].join('\n');
}

function getFamilyInstructions(account) {
  return [
    'Go to M-Pesa',
    'Lipa na M-Pesa',
    'PayBill',
    'Business Number: 222169',
    `Account: ${account || '(not provided)'}`,
    'Enter Amount',
    'Enter PIN',
    'Confirm.'
  ].join('\n');
}

function getKcbInstructions(account) {
  return [
    'Go to M-Pesa',
    'Lipa na M-Pesa',
    'PayBill',
    'Business Number: 522559',
    `Account: ${account || '(not provided)'}`,
    'Enter Amount',
    'Enter PIN',
    'Confirm.'
  ].join('\n');
}

function getCustomInstructions(account) {
  return [
    'Follow the instructions provided by your landlord.',
    account ? `Account: ${account}` : null
  ].filter(Boolean).join('\n');
}

function getManualInstructions() {
  return [
    'Pay cash directly to the landlord.',
    'The landlord will record the payment in the system.'
  ].join('\n');
}

module.exports = {
  mpesa: (phone) => ({
    label: 'Direct Mpesa',
    instructions: getMpesaInstructions(phone)
  }),
  dtb: (account) => ({
    label: 'DTB (Diamond Trust Bank)',
    paybill: '516600',
    instructions: getDtbInstructions(account)
  }),
  coop: (account) => ({
    label: 'Cooperative Bank',
    paybill: '400200',
    instructions: getCoopInstructions(account)
  }),
  equity: (account) => ({
    label: 'Equity Bank',
    paybill: '247247',
    instructions: getEquityInstructions(account)
  }),
  family: (account) => ({
    label: 'Family Bank',
    paybill: '222169',
    instructions: getFamilyInstructions(account)
  }),
  kcb: (account) => ({
    label: 'KCB',
    paybill: '522559',
    instructions: getKcbInstructions(account)
  }),
  custom: (account) => ({
    label: 'Custom/Other',
    instructions: getCustomInstructions(account)
  }),
  manual: () => ({
    label: 'Manual/Cash',
    instructions: getManualInstructions()
  })
};
