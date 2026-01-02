'use client';

import { useState } from 'react';

type LoanType = 'equal-payment' | 'equal-principal';

export default function MortgageCalculator() {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [loanYears, setLoanYears] = useState(30);
  const [interestRate, setInterestRate] = useState(4.1);
  const [loanType, setLoanType] = useState<LoanType>('equal-payment');

  const calculateEqualPayment = () => {
    const monthlyRate = interestRate / 100 / 12;
    const months = loanYears * 12;
    const monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - loanAmount;

    return {
      monthlyPayment: monthlyPayment.toFixed(2),
      totalPayment: totalPayment.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
    };
  };

  const calculateEqualPrincipal = () => {
    const monthlyRate = interestRate / 100 / 12;
    const months = loanYears * 12;
    const monthlyPrincipal = loanAmount / months;

    const firstMonthPayment =
      monthlyPrincipal + loanAmount * monthlyRate;
    const lastMonthPayment =
      monthlyPrincipal + monthlyPrincipal * monthlyRate;

    const totalInterest = (loanAmount * (months + 1) * monthlyRate) / 2;
    const totalPayment = loanAmount + totalInterest;

    return {
      firstMonthPayment: firstMonthPayment.toFixed(2),
      lastMonthPayment: lastMonthPayment.toFixed(2),
      monthlyDecrease: ((firstMonthPayment - lastMonthPayment) / months).toFixed(2),
      totalPayment: totalPayment.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
    };
  };

  const equalPaymentResult = calculateEqualPayment();
  const equalPrincipalResult = calculateEqualPrincipal();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">房贷计算器</h1>

        {/* 输入参数 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">贷款信息</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                贷款金额 (元)
              </label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <div className="mt-2 flex gap-2 flex-wrap">
                {[500000, 1000000, 1500000, 2000000, 3000000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setLoanAmount(amount)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    {(amount / 10000).toFixed(0)}万
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                贷款年限
              </label>
              <input
                type="number"
                value={loanYears}
                onChange={(e) => setLoanYears(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <div className="mt-2 flex gap-2 flex-wrap">
                {[5, 10, 15, 20, 25, 30].map((years) => (
                  <button
                    key={years}
                    onClick={() => setLoanYears(years)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    {years}年
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                年利率 (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <div className="mt-2 flex gap-2 flex-wrap">
                {[3.7, 4.1, 4.5, 4.9, 5.5, 6.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setInterestRate(rate)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                还款方式
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={loanType === 'equal-payment'}
                    onChange={() => setLoanType('equal-payment')}
                    className="mr-2"
                  />
                  等额本息
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={loanType === 'equal-principal'}
                    onChange={() => setLoanType('equal-principal')}
                    className="mr-2"
                  />
                  等额本金
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 计算结果 */}
        {loanType === 'equal-payment' ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              等额本息结果
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="text-gray-700">每月还款</span>
                <span className="text-2xl font-bold text-blue-600">
                  ¥{equalPaymentResult.monthlyPayment}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">还款总额</div>
                  <div className="text-xl font-semibold text-gray-900 mt-1">
                    ¥{equalPaymentResult.totalPayment}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">支付利息</div>
                  <div className="text-xl font-semibold text-red-600 mt-1">
                    ¥{equalPaymentResult.totalInterest}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              等额本金结果
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="text-gray-700">首月还款</span>
                <span className="text-2xl font-bold text-green-600">
                  ¥{equalPrincipalResult.firstMonthPayment}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">末月还款</div>
                  <div className="text-xl font-semibold text-gray-900 mt-1">
                    ¥{equalPrincipalResult.lastMonthPayment}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">每月递减</div>
                  <div className="text-xl font-semibold text-gray-900 mt-1">
                    ¥{equalPrincipalResult.monthlyDecrease}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">还款总额</div>
                  <div className="text-xl font-semibold text-gray-900 mt-1">
                    ¥{equalPrincipalResult.totalPayment}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">支付利息</div>
                  <div className="text-xl font-semibold text-red-600 mt-1">
                    ¥{equalPrincipalResult.totalInterest}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">还款方式说明:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>等额本息</strong>: 每月还款金额固定，前期利息多本金少</li>
            <li>• <strong>等额本金</strong>: 每月本金固定，还款金额逐月递减，总利息较少</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
