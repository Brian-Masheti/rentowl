import { FaMoneyBillWave, FaTrash, FaEdit, FaUniversity, FaMobileAlt } from 'react-icons/fa';

export function getPaymentMethodIcon(method) {
  switch (method) {
    case 'mpesa':
      return (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/512px-M-PESA_LOGO-01.svg.png?20191120100524"
          alt="Mpesa"
          title="Mpesa"
          style={{ height: 24, width: 48, objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle', background: '#fff', borderRadius: 6, boxShadow: '0 1px 4px #03A6A133' }}
        />
      );
    case 'dtb':
      return (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/3/34/DTB_LOGO_.jpg"
          alt="DTB"
          title="DTB"
          style={{ height: 24, width: 48, objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle', background: '#fff', borderRadius: 6, boxShadow: '0 1px 4px #D9042933' }}
        />
      );
    case 'kcb':
      return (
        <img
          src="https://upload.wikimedia.org/wikipedia/en/d/de/KCB_Bank_Kenya_Limited_logo.png"
          alt="KCB"
          title="KCB"
          style={{ height: 24, width: 48, objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle', background: '#fff', borderRadius: 6, boxShadow: '0 1px 4px #1E7F3A33' }}
        />
      );
    case 'cooperative':
      return (
        <img
          src="https://images.africanfinancials.com/ke-coop-logo-min.png"
          alt="Cooperative Bank"
          title="Cooperative Bank"
          style={{ height: 24, width: 48, objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle', background: '#fff', borderRadius: 6, boxShadow: '0 1px 4px #1B5E2033' }}
        />
      );
    case 'equity':
      return (
        <img
          src="https://simpauldesign.com/wp-content/uploads/2019/10/equity-bank-new-logo.png"
          alt="Equity Bank"
          title="Equity Bank"
          style={{ height: 24, width: 48, objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle', background: '#fff', borderRadius: 6, boxShadow: '0 1px 4px #7C2D1233' }}
        />
      );
    case 'family':
      return (
        <img
          src="https://pbs.twimg.com/profile_images/500397752467996674/O_1QbpNS_400x400.jpeg"
          alt="Family Bank"
          title="Family Bank"
          style={{ height: 24, width: 24, objectFit: 'cover', display: 'inline-block', verticalAlign: 'middle', background: '#fff', borderRadius: '50%', boxShadow: '0 1px 4px #0D47A133' }}
        />
      );
    case 'custom':
      return <FaMoneyBillWave style={{ color: '#FFA673', fontSize: 22 }} title="Custom/Other" />;
    default:
      return <FaMoneyBillWave style={{ color: '#03A6A1', fontSize: 22 }} title="Payment" />;
  }
}

export { FaTrash, FaEdit };
