import React, { useState } from 'react';
import { usePlacement } from '../../services/PlacementContext';
import { useAuth } from '../../services/AuthContext';

const statusStyles = {
  Open: 'bg-green-100 text-green-700 font-semibold',
  Closed: 'bg-red-100 text-red-600 font-semibold',
  Upcoming: 'bg-yellow-100 text-yellow-700 font-semibold',
};

const Jobs = () => {
  const { user } = useAuth();
  const { drives, applications, applyToDrive } = usePlacement();
  const [msg, setMsg] = useState({ text: '', type: '' });
  const checkCgpaEligible = (studentCgpa, reqCgpaStr) => {
    if (!studentCgpa || !reqCgpaStr) return true;
    const match = reqCgpaStr.match(/(\d+(\.\d+)?)/);
    if (!match) return true;
    const reqCgpa = parseFloat(match[1]);
    return parseFloat(studentCgpa) >= reqCgpa;
  };

  const checkDeptEligible = (studentDept, targetDeptsStr) => {
    if (!studentDept || !targetDeptsStr || targetDeptsStr.toLowerCase() === 'all') return true;
    
    // Helper to normalize department names/abbreviations for matching
    const normalize = (str) => {
      let n = str.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      if (n === 'computerscience' || n === 'computerscienceengineering' || n === 'computerscienceandengineering' || n === 'computerscience&engineering') return 'cse';
      if (n === 'informationtechnology') return 'it';
      if (n === 'electronics' || n === 'electronicsandcommunication' || n === 'electronicsandcommunicationengineering' || n === 'ece') return 'ece';
      if (n === 'electrical' || n === 'eee') return 'eee';
      return n;
    };

    const studentDeptNorm = normalize(studentDept);
    const depts = targetDeptsStr.split(',').map(d => normalize(d));

    return depts.includes(studentDeptNorm) || depts.includes('all');
  };

  const handleApply = async (drive) => {
    if (!user) return;
    
    if (!user.resumeUrl) {
      setMsg({ text: 'You must upload your resume before applying.', type: 'error' });
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
      return;
    }
    if (!user.phone || !user.skills) {
      setMsg({ text: 'You must complete your profile details (phone and skills) before applying.', type: 'error' });
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
      return;
    }

    const res = await applyToDrive(user.email, user.name, drive, user.cgpa);
    if (res.success) {
      setMsg({ text: `Successfully applied to ${drive.company}!`, type: 'success' });
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    } else {
      setMsg({ text: res.message || 'Failed to apply.', type: 'error' });
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    }
  };

  const hasApplied = (driveId) => {
    if (!user) return false;
    return applications.some(
      (app) => app.studentEmail === user.email && app.driveId === driveId
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <h1 className="text-4xl font-extrabold text-blue-900 mb-2 tracking-tight text-center">
        Placement Drives
      </h1>
      <p className="text-slate-500 text-center mb-8">Apply for open recruitment positions and view eligibility criteria.</p>

      {/* Dynamic Toast Message */}
      {msg.text && (
        <div className={`max-w-md mx-auto mb-6 p-3 rounded-lg text-center text-sm font-semibold border transition-all ${
          msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {drives.map((drive) => {
          const applied = hasApplied(drive.id);
          
          // Eligibility checking
          const isCgpaEligible = checkCgpaEligible(user?.cgpa, drive.cgpa);
          const isDeptEligible = checkDeptEligible(user?.department, drive.departments);
          const isEligible = isCgpaEligible && isDeptEligible;
          
          // Policy checks
          const isProfileVerified = user?.verificationStatus === 'Verified';
          const isResumeUploaded = !!user?.resumeUrl;
          const isProfileFilled = !!user?.phone && !!user?.skills;
          
          const activeApplicationsCount = applications.filter(
            app => app.studentEmail === user?.email && !['Selected', 'Rejected'].includes(app.status)
          ).length;
          const isLimitExceeded = activeApplicationsCount >= 3;

          const selectedApps = applications.filter(app => app.studentEmail === user?.email && app.status === 'Selected');
          const isPlaced = selectedApps.length > 0;
          
          let highestPackagePlaced = 0;
          if (isPlaced) {
            selectedApps.forEach(app => {
              const pkgVal = parseFloat(app.package.replace(/[^0-9.]/g, '')) || 0;
              if (pkgVal > highestPackagePlaced) {
                highestPackagePlaced = pkgVal;
              }
            });
          }
          
          const drivePkgVal = parseFloat(drive.package.replace(/[^0-9.]/g, '')) || 0;
          const isDreamUpgrade = isPlaced && drivePkgVal >= (highestPackagePlaced * 1.5);
          const isPolicyEligible = !isPlaced || isDreamUpgrade;
          
          const isButtonDisabled = 
            drive.status !== 'Open' || 
            applied || 
            !isEligible || 
            !isProfileVerified || 
            !isResumeUploaded ||
            !isProfileFilled ||
            (!applied && isLimitExceeded) || 
            (!applied && !isPolicyEligible);

          // Determine button label text
          let buttonLabel = 'Apply Now';
          if (applied) {
            buttonLabel = '✓ Applied';
          } else if (!isResumeUploaded) {
            buttonLabel = 'Resume Required';
          } else if (!isProfileFilled) {
            buttonLabel = 'Complete Profile';
          } else if (!isProfileVerified) {
            buttonLabel = user?.verificationStatus === 'Rejected' ? 'Verification Rejected' : 'Pending Verification';
          } else if (!isEligible) {
            buttonLabel = 'Ineligible';
          } else if (isPlaced && !isDreamUpgrade) {
            buttonLabel = 'Locked: Placed';
          } else if (isLimitExceeded) {
            buttonLabel = 'Limit Reached (Max 3)';
          } else if (drive.status !== 'Open') {
            buttonLabel = 'Closed';
          }

          return (
            <div
              key={drive.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md p-6 flex flex-col justify-between gap-4 border border-slate-100 relative overflow-hidden transition-all"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-slate-800">{drive.company}</div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs ${statusStyles[drive.status]}`}>
                    {drive.status}
                  </span>
                </div>
                <div className="text-base font-semibold text-slate-700">{drive.role}</div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    {drive.package}
                  </span>
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    {drive.location}
                  </span>
                  {user && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      !isProfileVerified
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : isEligible 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {!isProfileVerified
                        ? '🟡 Profile Unverified'
                        : isEligible 
                        ? '🟢 Eligible' 
                        : !isCgpaEligible 
                        ? '🔴 CGPA Ineligible' 
                        : '🔴 Dept Ineligible'}
                    </span>
                  )}
                  {isPlaced && isDreamUpgrade && (
                    <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-2.5 py-0.5 rounded-full text-xs font-extrabold shadow-sm flex items-center gap-0.5">
                      ⭐ Dream Upgrade (req: { (highestPackagePlaced * 1.5).toFixed(1) } LPA)
                    </span>
                  )}
                  {isPlaced && !isDreamUpgrade && (
                    <span className="bg-red-50 text-red-700 border border-red-100 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      🔒 Placed: Locked (req: { (highestPackagePlaced * 1.5).toFixed(1) }+ LPA)
                    </span>
                  )}
                  {!applied && isLimitExceeded && (
                    <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      ⚠️ Active Applications Limit Reached (Max 3)
                    </span>
                  )}
                </div>
                <div className="pt-2 text-xs text-slate-500 space-y-1">
                  <div>
                    <span className="font-bold text-slate-600">Eligibility CGPA:</span> {drive.cgpa}
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">Departments:</span> {drive.departments}
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">Deadline:</span> {drive.deadline}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleApply(drive)}
                className={`mt-4 w-full font-bold py-2.5 rounded-xl transition cursor-pointer text-sm shadow-sm
                  ${applied
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : !isResumeUploaded
                    ? 'bg-red-50 text-red-650 border border-red-200 cursor-not-allowed font-medium'
                    : !isProfileFilled
                    ? 'bg-amber-50 text-amber-600 border border-amber-200 cursor-not-allowed font-medium'
                    : !isProfileVerified
                    ? 'bg-amber-50 text-amber-600 border border-amber-200 cursor-not-allowed'
                    : !isEligible && user
                    ? 'bg-rose-50 text-rose-400 border border-rose-100 cursor-not-allowed'
                    : isPlaced && !isDreamUpgrade
                    ? 'bg-red-50 text-red-500 border border-red-155 cursor-not-allowed'
                    : isLimitExceeded
                    ? 'bg-amber-50 text-amber-550 border border-amber-150 cursor-not-allowed'
                    : drive.status === 'Open'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }
                `}
                disabled={isButtonDisabled}
              >
                {buttonLabel}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Jobs;