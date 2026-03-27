import React, { useState } from 'react';

interface PaymentCalculatorProps {
  currentRate: number | null;
}

function calculateMonthlyPayment(homePrice: number, downPaymentPct: number, annualRate: number): number {
  const principal = homePrice * (1 - downPaymentPct / 100);
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = 30 * 12;

  if (monthlyRate === 0) return principal / numPayments;

  return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);
}

const PaymentCalculator: React.FC<PaymentCalculatorProps> = ({ currentRate }) => {
  const [homePrice, setHomePrice] = useState(600000);
  const [downPayment, setDownPayment] = useState(20);
  const rate = currentRate ?? 7.0;

  const monthlyPayment = calculateMonthlyPayment(homePrice, downPayment, rate);
  const principal = homePrice * (1 - downPayment / 100);

  // Show payment at different rate scenarios
  const scenarios = [
    { label: 'Current', rate },
    { label: '-0.5%', rate: rate - 0.5 },
    { label: '-1.0%', rate: rate - 1.0 },
    { label: '+0.5%', rate: rate + 0.5 },
  ];

  return (
    <div className="bg-forest-800 p-6 rounded-lg border border-forest-600 shadow-lg">
      <h3 className="text-lg font-semibold text-accent-400 mb-4">Your Payment Calculator</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm text-forest-300 mb-1">Home Price</label>
          <input
            type="range"
            min={300000}
            max={800000}
            step={10000}
            value={homePrice}
            onChange={(e) => setHomePrice(Number(e.target.value))}
            className="w-full accent-accent-400"
          />
          <span className="text-forest-100 font-bold">${homePrice.toLocaleString()}</span>
        </div>
        <div>
          <label className="block text-sm text-forest-300 mb-1">Down Payment</label>
          <input
            type="range"
            min={5}
            max={30}
            step={5}
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full accent-accent-400"
          />
          <span className="text-forest-100 font-bold">{downPayment}% (${(homePrice * downPayment / 100).toLocaleString()})</span>
        </div>
        <div>
          <label className="block text-sm text-forest-300 mb-1">Loan Amount</label>
          <span className="text-2xl font-bold text-forest-100">${principal.toLocaleString()}</span>
        </div>
      </div>

      {/* Current payment */}
      <div className="bg-forest-900 rounded-lg p-4 mb-4">
        <div className="text-sm text-forest-300">Monthly Payment at {rate.toFixed(2)}%</div>
        <div className="text-3xl font-bold text-forest-100">
          ${Math.round(monthlyPayment).toLocaleString()}/mo
        </div>
        <div className="text-xs text-forest-400 mt-1">Principal + Interest only (excludes taxes, insurance, PMI)</div>
      </div>

      {/* Rate scenarios */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {scenarios.map((s) => {
          const payment = calculateMonthlyPayment(homePrice, downPayment, s.rate);
          const diff = payment - monthlyPayment;
          return (
            <div key={s.label} className="bg-forest-900 rounded p-3 text-center">
              <div className="text-xs text-forest-400">{s.label} ({s.rate.toFixed(1)}%)</div>
              <div className="text-lg font-bold text-forest-100">${Math.round(payment).toLocaleString()}</div>
              {diff !== 0 && (
                <div className={`text-xs ${diff > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {diff > 0 ? '+' : ''}{Math.round(diff).toLocaleString()}/mo
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentCalculator;
