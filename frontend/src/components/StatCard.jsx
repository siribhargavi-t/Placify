import React from 'react'

const StatCard = ({ title, count, color = 'blue' }) => {
  const colorClasses = {
    blue: 'border-blue-500 text-blue-700',
    green: 'border-green-500 text-green-700',
    yellow: 'border-yellow-400 text-yellow-700',
    red: 'border-red-500 text-red-600',
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border-t-4 transition-transform hover:-translate-y-1 hover:shadow-xl
        ${colorClasses[color] || colorClasses.blue}
      `}
    >
      <div className={`text-4xl font-bold mb-1 ${colorClasses[color] || colorClasses.blue}`}>{count}</div>
      <div className="text-gray-500 font-medium text-lg text-center">{title}</div>
    </div>
  )
}

export default StatCard