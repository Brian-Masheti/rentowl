// This utility takes an array of paymentOptions and fills in the instructions field for each using paymentInstructions.js
const paymentInstructions = require('./paymentInstructions');

module.exports = function applyPaymentInstructions(paymentOptions) {
  return paymentOptions.map(opt => {
    let instructions = '';
    try {
      switch (opt.method) {
        case 'mpesa':
          instructions = paymentInstructions.mpesa(opt.phone).instructions;
          break;
        case 'dtb':
          instructions = paymentInstructions.dtb(opt.account).instructions;
          break;
        case 'cooperative':
          instructions = paymentInstructions.coop(opt.account).instructions;
          break;
        case 'equity':
          instructions = paymentInstructions.equity(opt.account).instructions;
          break;
        case 'family':
          instructions = paymentInstructions.family(opt.account).instructions;
          break;
        case 'kcb':
          instructions = paymentInstructions.kcb(opt.account).instructions;
          break;
        case 'custom':
          instructions = paymentInstructions.custom(opt.account).instructions;
          break;
        case 'manual':
          instructions = paymentInstructions.manual().instructions;
          break;
        default:
          instructions = '';
      }
    } catch (err) {
      instructions = '';
    }
    return { ...opt, instructions };
  });
};
