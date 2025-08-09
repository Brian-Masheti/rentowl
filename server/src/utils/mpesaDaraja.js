// Mpesa Daraja API Utility for STK Push and Authentication
const axios = require('axios');
const moment = require('moment');

// Load credentials and config from environment variables
const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE,
  MPESA_PASSKEY,
  MPESA_CALLBACK_URL,
  MPESA_ENV
} = process.env;

// Set the base URL depending on environment (sandbox or production)
const BASE_URL = MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

// Get OAuth access token from Daraja API
async function getAccessToken() {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  const res = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return res.data.access_token;
}

// Get current timestamp in required format
function getTimestamp() {
  return moment().format('YYYYMMDDHHmmss');
}

// Generate password for STK Push (base64 encoded)
function getPassword() {
  const timestamp = getTimestamp();
  const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');
  return { password, timestamp };
}

// Initiate an STK Push (payment prompt) to a phone number
// phone: phone number to prompt (format: 2547XXXXXXXX)
// amount: amount to charge
// accountRef: reference for the transaction (e.g., unit, property, etc.)
// transactionDesc: description for the transaction
async function stkPush({ phone, amount, accountRef, transactionDesc }) {
  const accessToken = await getAccessToken();
  const { password, timestamp } = getPassword();
  const payload = {
    BusinessShortCode: MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phone,
    PartyB: MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: MPESA_CALLBACK_URL,
    AccountReference: accountRef || 'RentOwl',
    TransactionDesc: transactionDesc || 'Rent Payment'
  };
  // Send STK Push request to Daraja API
  const res = await axios.post(
    `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
    payload,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return res.data;
}

module.exports = {
  stkPush
};
