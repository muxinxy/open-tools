'use client';

import { useState } from 'react';

type Gender = 'male' | 'female';

export default function BmiCalculator() {
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(65);
  const [gender, setGender] = useState<Gender>('male');

  const calculateBmi = () => {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { category: '偏瘦', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (bmi < 24) return { category: '正常', color: 'text-green-600', bg: 'bg-green-50' };
    if (bmi < 28) return { category: '偏胖', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (bmi < 30) return { category: '肥胖', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { category: '重度肥胖', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const getIdealWeight = () => {
    const heightInMeters = height / 100;
    if (gender === 'male') {
      return (heightInMeters * heightInMeters * 22).toFixed(1);
    } else {
      return (heightInMeters * heightInMeters * 21).toFixed(1);
    }
  };

  const getWeightRange = () => {
    const heightInMeters = height / 100;
    const min = (heightInMeters * heightInMeters * 18.5).toFixed(1);
    const max = (heightInMeters * heightInMeters * 24).toFixed(1);
    return { min, max };
  };

  const bmi = parseFloat(calculateBmi());
  const category = getBmiCategory(bmi);
  const idealWeight = getIdealWeight();
  const weightRange = getWeightRange();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">BMI 计算器</h1>

        {/* 输入参数 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              性别
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={gender === 'male'}
                  onChange={() => setGender('male')}
                  className="mr-2"
                />
                男性
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={gender === 'female'}
                  onChange={() => setGender('female')}
                  className="mr-2"
                />
                女性
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              身高 (cm): {height}
            </label>
            <input
              type="range"
              min="100"
              max="220"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full"
            />
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              体重 (kg): {weight}
            </label>
            <input
              type="range"
              min="30"
              max="200"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full"
            />
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* BMI 结果 */}
        <div className={`bg-white rounded-lg shadow-md p-6 mb-6 ${category.bg}`}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">BMI 指数</h2>
          <div className="text-center">
            <div className={`text-6xl font-bold ${category.color} mb-2`}>
              {bmi}
            </div>
            <div className={`text-2xl font-semibold ${category.color}`}>
              {category.category}
            </div>
          </div>
        </div>

        {/* BMI 范围 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">BMI 分类标准</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span>偏瘦</span>
              <span className="font-semibold">&lt; 18.5</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span>正常</span>
              <span className="font-semibold">18.5 - 24.0</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
              <span>偏胖</span>
              <span className="font-semibold">24.0 - 28.0</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
              <span>肥胖</span>
              <span className="font-semibold">28.0 - 30.0</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded">
              <span>重度肥胖</span>
              <span className="font-semibold">≥ 30.0</span>
            </div>
          </div>
        </div>

        {/* 理想体重 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">体重建议</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-gray-600 mb-1">理想体重</div>
              <div className="text-2xl font-bold text-green-600">
                {idealWeight} kg
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-gray-600 mb-1">正常体重范围</div>
              <div className="text-2xl font-bold text-blue-600">
                {weightRange.min} - {weightRange.max} kg
              </div>
            </div>
          </div>

          {bmi < 18.5 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                您的体重偏轻，建议适当增加营养摄入，并进行适量运动增强体质。
              </p>
            </div>
          )}
          {bmi >= 24 && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                您的体重偏重，建议控制饮食，增加有氧运动，保持健康的生活方式。
              </p>
            </div>
          )}
          {bmi >= 18.5 && bmi < 24 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                您的体重在正常范围内，请继续保持健康的饮食和运动习惯！
              </p>
            </div>
          )}
        </div>

        {/* 说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">关于 BMI:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• BMI (Body Mass Index) 身体质量指数 = 体重(kg) / 身高²(m²)</li>
            <li>• BMI 是评估体重与健康关系的常用指标</li>
            <li>• 本计算器采用中国成人 BMI 标准</li>
            <li>• 结果仅供参考，具体请咨询专业医生</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
