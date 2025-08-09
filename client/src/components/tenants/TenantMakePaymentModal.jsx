import React, { useState, useEffect } from 'react';

const themeColor = '#03A6A1';

const TenantMakePaymentModal = ({
  open,
  onClose,
  paymentOptions = [],
  outstandingDeposit = 0,
  outstandingRent = 0,
  onPay,
  loading,
  error,
  success,
  splitSummary
}) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [applyDeposit, setApplyDeposit] = useState(outstandingDeposit > 0);
  const [localSplit, setLocalSplit] = useState(null);

  useEffect(() => {
    // Reset split summary when modal opens or amount changes
    setLocalSplit(null);
  }, [open, amount, applyDeposit]);

  if (!open) return null;

  // Simulate split summary on the frontend for preview (matches backend logic)
  const getSplitSummary = () => {
    let remaining = Number(amount);
    let depositPaid = 0, rentPaid = 0;
    let depositDue = applyDeposit ? outstandingDeposit : 0;
    let rentDue = outstandingRent;
    if (applyDeposit && depositDue > 0 && remaining > 0) {
      const payDeposit = Math.min(remaining, depositDue);
      depositPaid = payDeposit;
      remaining -= payDeposit;
    }
    if (rentDue > 0 && remaining > 0) {
      const payRent = Math.min(remaining, rentDue);
      rentPaid = payRent;
      remaining -= payRent;
    }
    return {
      depositPaid,
      rentPaid,
      depositRemaining: depositDue - depositPaid,
      rentRemaining: rentDue - rentPaid
    };
  };

  const split = amount ? getSplitSummary() : null;

  const handlePay = (e) => {
    e.preventDefault();
    if (onPay && selectedMethod && phone && amount) {
      onPay({ method: selectedMethod, phone, amount, applyDeposit });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: themeColor + '22' }}>
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-2 relative border-2" style={{ borderColor: themeColor }}>
        <button
          className="absolute top-2 right-2 text-[#03A6A1] hover:text-red-600 text-xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4" style={{ color: themeColor }}>Make Payment</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 bg-[#F8F8F8] rounded p-2 border border-[#03A6A1]/20">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-[#03A6A1]">Outstanding Deposit:</span>
              <span className="font-mono font-bold text-[#FF4F0F]">KES {outstandingDeposit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-[#03A6A1]">Outstanding Rent:</span>
              <span className="font-mono font-bold text-[#FFA673]">KES {outstandingRent.toLocaleString()}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Select Payment Method</label>
            <select
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              value={selectedMethod || ''}
              onChange={e => setSelectedMethod(e.target.value)}
            >
              <option value="">Choose...</option>
              {paymentOptions.map(opt => (
                <option key={opt.method} value={opt.method}>{opt.label || opt.method}</option>
              ))}
            </select>
          </div>
          {selectedMethod && (
            <div className="bg-[#03A6A1]/10 border border-[#03A6A1] rounded p-3 text-[#03A6A1]">
              <div className="font-bold mb-2">Instructions</div>
              <div className="text-sm whitespace-pre-line">{(paymentOptions.find(opt => opt.method === selectedMethod)?.instructions) || ''}</div>
            </div>
          )}
          {selectedMethod === 'mpesa' && (
            <form onSubmit={handlePay} className="flex flex-col gap-3 mt-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number (2547XXXXXXXX)</label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="2547XXXXXXXX"
                required
              />
              <label className="block text-xs font-semibold text-gray-600 mb-1">Amount (KES)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min={1}
                required
              />
              {outstandingDeposit > 0 && (
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mt-1">
                  <input
                    type="checkbox"
                    checked={applyDeposit}
                    onChange={e => setApplyDeposit(e.target.checked)}
                  />
                  Apply to deposit (if due)
                </label>
              )}
              {split && (
                <div className="bg-[#F8F8F8] border border-[#03A6A1]/20 rounded p-2 mt-2 text-xs text-[#23272F]">
                  <div><b>Payment Split:</b></div>
                  <div>Deposit paid: <span className="font-mono text-[#FF4F0F]">KES {split.depositPaid.toLocaleString()}</span> (remaining: <span className="font-mono">KES {split.depositRemaining.toLocaleString()}</span>)</div>
                  <div>Rent paid: <span className="font-mono text-[#FFA673]">KES {split.rentPaid.toLocaleString()}</span> (remaining: <span className="font-mono">KES {split.rentRemaining.toLocaleString()}</span>)</div>
                </div>
              )}
              <button
                type="submit"
                className="mt-2 w-full py-2 rounded bg-[#03A6A1] text-white font-bold text-base hover:bg-[#028b8a] transition"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Pay Now'}
              </button>
              {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
              {success && splitSummary && (
                <div className="text-green-600 text-xs mt-1">
                  Payment successful!<br/>
                  Deposit paid: <b>KES {splitSummary.depositPaid.toLocaleString()}</b> (remaining: KES {splitSummary.depositRemaining.toLocaleString()})<br/>
                  Rent paid: <b>KES {splitSummary.rentPaid.toLocaleString()}</b> (remaining: KES {splitSummary.rentRemaining.toLocaleString()})
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantMakePaymentModal;
