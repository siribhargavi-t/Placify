import React, { useState } from 'react';
import { useAuth } from '../../services/AuthContext';

const eligibilityData = {
  cgpaRequired: 7.0,
  activeBacklogs: 0,
  maxBacklogsAllowed: 0,
  attendance: 92,
  attendanceRequired: 75,
};

const statusColors = {
  Eligible: 'bg-green-100 text-green-700 border-green-300',
  Warning: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Not Eligible': 'bg-red-100 text-red-700 border-red-300',
};

const statusDot = {
  Eligible: 'bg-green-500',
  Warning: 'bg-yellow-400',
  'Not Eligible': 'bg-red-500',
};

const StudentProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [msg, setMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resumeName, setResumeName] = useState(user?.resumeName || 'resume.pdf');

  const [profile, setProfile] = useState({
    fullName: user?.name || 'Student User',
    email: user?.email || 'student@placify.com',
    phone: user?.phone || '9876543210',
    department: user?.department || 'CSE',
    cgpa: user?.cgpa?.toString() || '7.8',
    skills: user?.skills || 'JavaScript, React, Python',
    graduationYear: user?.graduationYear || '2025',
    resumeUrl: user?.resumeUrl || '',
    resumeName: user?.resumeName || '',
    githubUrl: user?.githubUrl || '',
    linkedinUrl: user?.linkedinUrl || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file only.');
        return;
      }
      
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate progressive upload indicator
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64Url = event.target.result;
              setProfile(prevProfile => ({ 
                ...prevProfile, 
                resumeUrl: base64Url, 
                resumeName: file.name 
              }));
              setResumeName(file.name);
              setIsUploading(false);
            };
            reader.readAsDataURL(file);
            
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateUserProfile({
      phone: profile.phone,
      skills: profile.skills,
      resumeUrl: profile.resumeUrl,
      resumeName: profile.resumeName || resumeName,
      githubUrl: profile.githubUrl,
      linkedinUrl: profile.linkedinUrl,
      cgpa: parseFloat(profile.cgpa) || 7.5
    });
    setMsg('🎉 Profile updated successfully!');
    setIsEditing(false);
    setTimeout(() => setMsg(''), 4000);
  };

  // Eligibility logic from user cgpa
  const studentCgpa = parseFloat(profile.cgpa) || 0;
  const cgpaStatus =
    studentCgpa >= eligibilityData.cgpaRequired
      ? 'Eligible'
      : studentCgpa >= eligibilityData.cgpaRequired - 0.5
      ? 'Warning'
      : 'Not Eligible';

  const backlogStatus =
    eligibilityData.activeBacklogs <= eligibilityData.maxBacklogsAllowed
      ? 'Eligible'
      : 'Not Eligible';

  const attendanceStatus =
    eligibilityData.attendance >= eligibilityData.attendanceRequired
      ? 'Eligible'
      : 'Not Eligible';

  const overallStatus =
    cgpaStatus === 'Eligible' &&
    backlogStatus === 'Eligible' &&
    attendanceStatus === 'Eligible'
      ? 'Eligible'
      : [cgpaStatus, backlogStatus, attendanceStatus].includes('Not Eligible')
      ? 'Not Eligible'
      : 'Warning';

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 font-sans">
      {msg && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-center text-sm font-semibold">
          {msg}
        </div>
      )}

      {/* Verification Status Alert Banner */}
      {user && (
        <div className={`mb-6 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          user.verificationStatus === 'Verified'
            ? 'bg-green-50 border-green-200 text-green-800'
            : user.verificationStatus === 'Rejected'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <div className="space-y-1">
            <h4 className="text-sm font-bold flex items-center gap-1.5">
              {user.verificationStatus === 'Verified' ? (
                <><span>🟢</span> Academic Profile Verified</>
              ) : user.verificationStatus === 'Rejected' ? (
                <><span>🔴</span> Profile Verification Rejected</>
              ) : (
                <><span>🟡</span> Profile Pending Verification</>
              )}
            </h4>
            <p className="text-xs opacity-90">
              {user.verificationStatus === 'Verified' ? (
                'Your profile details have been successfully vetted and approved by the TPO. You are eligible to apply for matching active placement drives.'
              ) : user.verificationStatus === 'Rejected' ? (
                `Correction required: ${user.verificationRemarks || 'Please review your uploaded information.'}`
              ) : (
                'Your profile is awaiting verification by the Training & Placement Office. You cannot register/apply for active placement drives until verification is complete.'
              )}
            </p>
          </div>
          {user.verificationStatus !== 'Verified' && (
            <span className="text-[10px] uppercase font-extrabold tracking-wider bg-white/60 px-2 py-0.5 rounded border whitespace-nowrap self-end sm:self-center">
              Action Pending
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        {/* Left column: Photo and Eligibility */}
        <div className="flex flex-col items-center lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-8">
          <div className="w-28 h-28 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center font-bold text-4xl text-blue-700 shadow-inner mb-4">
            {profile.fullName[0]}
          </div>
          <h3 className="font-extrabold text-slate-800 text-lg text-center leading-tight mb-1">{profile.fullName}</h3>
          <p className="text-xs text-slate-400 font-mono mb-4">{profile.email}</p>

          {/* Eligibility Card */}
          <div className={`w-full border ${statusColors[overallStatus]} rounded-xl p-4 text-center mt-3`}>
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              <span className={`inline-block w-2 h-2 rounded-full ${statusDot[overallStatus]}`}></span>
              <span className="font-bold text-xs uppercase tracking-wider">Placement Status</span>
            </div>
            <div className="text-xl font-extrabold mb-3">{overallStatus}</div>
            <div className="grid grid-cols-1 gap-2 text-xs text-left pt-2 border-t border-slate-100/50">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">CGPA:</span>
                <span className="font-bold text-slate-800">{studentCgpa} <span className="text-[10px] text-slate-400 font-normal">(Req: {eligibilityData.cgpaRequired.toFixed(1)}+)</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Backlogs:</span>
                <span className="font-bold text-slate-800">{eligibilityData.activeBacklogs} Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Attendance:</span>
                <span className="font-bold text-slate-800">{eligibilityData.attendance}% <span className="text-[10px] text-slate-400 font-normal">(Req: {eligibilityData.attendanceRequired}%)</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Edit Form */}
        <form onSubmit={handleSave} className="flex-1 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-50">
            <h2 className="text-xl font-extrabold text-slate-800">Profile Details</h2>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-1.5 px-4 rounded-lg text-xs transition cursor-pointer border border-blue-100"
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-1.5 px-3 rounded-lg text-xs transition cursor-pointer border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded-lg text-xs transition cursor-pointer shadow-sm"
                >
                  Save Profile
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name (Read Only) */}
            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                value={profile.fullName}
                disabled
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 outline-none cursor-not-allowed font-medium"
              />
            </div>

            {/* Email (Read Only) */}
            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 outline-none cursor-not-allowed font-medium"
              />
            </div>

            {/* Phone (Editable) */}
            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                readOnly={!isEditing}
                placeholder="e.g. +91 9876543210"
                className={`w-full px-3.5 py-2 border rounded-lg text-sm transition outline-none ${
                  isEditing 
                    ? 'border-slate-350 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-slate-800' 
                    : 'border-slate-200 bg-slate-50 text-slate-500 cursor-default'
                }`}
                required
              />
            </div>

            {/* Department (Read Only) */}
            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Department</label>
              <input
                type="text"
                value={profile.department}
                disabled
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 outline-none cursor-not-allowed font-medium"
              />
            </div>

            {/* CGPA (Editable in edit mode) */}
            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                name="cgpa"
                value={profile.cgpa}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`w-full px-3.5 py-2 border rounded-lg text-sm transition outline-none ${
                  isEditing 
                    ? 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-slate-800' 
                    : 'border-slate-200 bg-slate-50 text-slate-500 cursor-default font-medium'
                }`}
                required
              />
            </div>

            {/* Graduation Year (Read Only) */}
            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Graduation Year</label>
              <input
                type="text"
                value={profile.graduationYear}
                disabled
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 outline-none cursor-not-allowed font-medium"
              />
            </div>

            {/* LinkedIn Profile */}
            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">LinkedIn Profile URL</label>
              <input
                type="url"
                name="linkedinUrl"
                value={profile.linkedinUrl}
                onChange={handleChange}
                readOnly={!isEditing}
                placeholder="e.g. https://linkedin.com/in/username"
                className={`w-full px-3.5 py-2 border rounded-lg text-sm transition outline-none ${
                  isEditing 
                    ? 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-slate-800' 
                    : 'border-slate-200 bg-slate-50 text-slate-500 cursor-default'
                }`}
              />
            </div>

            {/* GitHub Profile */}
            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">GitHub Profile URL</label>
              <input
                type="url"
                name="githubUrl"
                value={profile.githubUrl}
                onChange={handleChange}
                readOnly={!isEditing}
                placeholder="e.g. https://github.com/username"
                className={`w-full px-3.5 py-2 border rounded-lg text-sm transition outline-none ${
                  isEditing 
                    ? 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-slate-800' 
                    : 'border-slate-200 bg-slate-50 text-slate-500 cursor-default'
                }`}
              />
            </div>

            {/* Resume File Upload */}
            <div className="sm:col-span-2">
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Resume Upload (PDF Format Only)</label>
              
              {isEditing ? (
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-6 text-center transition bg-slate-50/50 hover:bg-white relative">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {isUploading ? (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-600">Uploading resume... {uploadProgress}%</div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-100" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="text-2xl select-none">📤</div>
                      <p className="text-xs font-semibold text-slate-700">
                        {profile.resumeUrl ? 'Click or Drag to replace your resume' : 'Drag & drop your Resume PDF, or click to browse'}
                      </p>
                      <p className="text-[10px] text-slate-400">PDF files up to 5MB</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl select-none">📄</div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-slate-800 text-xs truncate max-w-xs sm:max-w-md">
                        {profile.resumeUrl ? (profile.resumeName || resumeName || 'resume.pdf') : 'No resume uploaded yet'}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {profile.resumeUrl ? 'PDF Document' : 'Upload your resume in edit mode'}
                      </p>
                    </div>
                  </div>
                  {profile.resumeUrl && (
                    <div className="flex gap-2">
                      <a
                        href={profile.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition border border-slate-200 cursor-pointer"
                      >
                        Preview
                      </a>
                      <a
                        href={profile.resumeUrl}
                        download={profile.resumeName || resumeName || 'resume.pdf'}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Download
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="sm:col-span-2">
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Technical Skills</label>
              <textarea
                name="skills"
                rows={2}
                value={profile.skills}
                onChange={handleChange}
                readOnly={!isEditing}
                placeholder="e.g. Java, Python, React, Node.js, SQL"
                className={`w-full px-3.5 py-2 border rounded-lg text-sm transition outline-none ${
                  isEditing 
                    ? 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-slate-800' 
                    : 'border-slate-200 bg-slate-50 text-slate-500 cursor-default'
                }`}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;