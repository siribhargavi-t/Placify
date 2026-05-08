import React from 'react'

const StudentProfile = () => (
  <div className="bg-white rounded-lg shadow p-8 max-w-xl mx-auto">
    <h2 className="text-2xl font-bold text-blue-700 mb-4">Student Profile</h2>
    <div className="space-y-2">
      <div>
        <span className="font-semibold text-blue-600">Name:</span> Student User
      </div>
      <div>
        <span className="font-semibold text-blue-600">Email:</span> student@placify.com
      </div>
      <div>
        <span className="font-semibold text-blue-600">Role:</span> Student
      </div>
      <div>
        <span className="font-semibold text-blue-600">Course:</span> B.Tech Computer Science
      </div>
    </div>
  </div>
)

export default StudentProfile