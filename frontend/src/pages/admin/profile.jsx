import React from 'react'

const AdminProfile = () => (
  <div className="bg-white rounded-lg shadow p-8 max-w-xl mx-auto">
    <h2 className="text-2xl font-bold text-blue-700 mb-4">Admin Profile</h2>
    <div className="space-y-2">
      <div>
        <span className="font-semibold text-blue-600">Name:</span> Admin User
      </div>
      <div>
        <span className="font-semibold text-blue-600">Email:</span> admin@placify.com
      </div>
      <div>
        <span className="font-semibold text-blue-600">Role:</span> Administrator
      </div>
    </div>
  </div>
)

export default AdminProfile