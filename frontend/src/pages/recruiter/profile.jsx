import React from 'react'

const RecruiterProfile = () => (
  <div className="bg-white rounded-lg shadow p-8 max-w-xl mx-auto">
    <h2 className="text-2xl font-bold text-blue-700 mb-4">Recruiter Profile</h2>
    <div className="space-y-2">
      <div>
        <span className="font-semibold text-blue-600">Name:</span> Recruiter User
      </div>
      <div>
        <span className="font-semibold text-blue-600">Email:</span> recruiter@placify.com
      </div>
      <div>
        <span className="font-semibold text-blue-600">Role:</span> Recruiter
      </div>
      <div>
        <span className="font-semibold text-blue-600">Company:</span> Placify Corp
      </div>
    </div>
  </div>
)

export default RecruiterProfile