const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Premium styling configurations based on application round status
const STATUS_THEMES = {
  'Selected': {
    color: '#047857',
    bg: '#ecfdf5',
    border: '#10b981',
    icon: '🎉',
    badge: 'Offer Extended'
  },
  'Rejected': {
    color: '#b91c1c',
    bg: '#fef2f2',
    border: '#f87171',
    icon: '⏳',
    badge: 'Application Ended'
  },
  'Aptitude Test': {
    color: '#b45309',
    bg: '#fffbeb',
    border: '#fbbf24',
    icon: '📝',
    badge: 'Aptitude Test Scheduled'
  },
  'Technical Interview': {
    color: '#4338ca',
    bg: '#eef2ff',
    border: '#818cf8',
    icon: '💻',
    badge: 'Technical Round Scheduled'
  },
  'HR Interview': {
    color: '#6d28d9',
    bg: '#faf5ff',
    border: '#c084fc',
    icon: '👤',
    badge: 'HR Interview Scheduled'
  },
  'Pending': {
    color: '#4b5563',
    bg: '#f9fafb',
    border: '#d1d5db',
    icon: '📥',
    badge: 'Review Pending'
  }
};

/**
 * Sends an email notification to the student when their placement application status changes.
 */
async function sendApplicationStatusEmail(studentEmail, studentName, company, role, status, feedback, packageAmount, origin) {
  const theme = STATUS_THEMES[status] || {
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#60a5fa',
    icon: '🔔',
    badge: status
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'Selected':
        return `🎉 <strong>Congratulations!</strong> We are thrilled to inform you that you have successfully cleared all selection rounds and have been officially <strong>Selected</strong> for the position of <strong>${role}</strong> at <strong>${company}</strong>! Your job offer is now being processed.`;
      case 'Rejected':
        return `Thank you for your time and efforts during the recruitment process for <strong>${company}</strong>. We regret to inform you that your application for the position of <strong>${role}</strong> has not been shortlisted to proceed further. We wish you the absolute best in your upcoming placement drives.`;
      case 'Aptitude Test':
        return `Congratulations! Your application has cleared the initial screening and you have been advanced to the <strong>Aptitude Test</strong> round for the <strong>${role}</strong> position at <strong>${company}</strong>. Please check the details below.`;
      case 'Technical Interview':
        return `Well done! You have advanced to the <strong>Technical Interview</strong> round for the position of <strong>${role}</strong> at <strong>${company}</strong>. Please prepare for your technical evaluation.`;
      case 'HR Interview':
        return `Great news! You have successfully cleared the technical evaluation rounds and are now advanced to the final <strong>HR Interview</strong> round for the position of <strong>${role}</strong> at <strong>${company}</strong>. Good luck!`;
      case 'Pending':
      default:
        return `Your job application for the position of <strong>${role}</strong> at <strong>${company}</strong> has been received and is currently under review by the placement team. We will keep you updated on the scheduling of the next rounds.`;
    }
  };

  const frontendOrigin = origin || 'http://localhost:5173';

  const remarksSection = feedback 
    ? `
      <div style="margin-top: 20px; padding: 15px; background-color: #f1f5f9; border-radius: 8px; border: 1px solid #e2e8f0;">
        <h4 style="margin: 0 0 8px 0; color: #475569; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">TPO Feedback / Instructions:</h4>
        <p style="margin: 0; color: #334155; font-size: 14px; font-style: italic;">"${feedback}"</p>
      </div>
    `
    : '';
  
  const mailOptions = {
    from: `"Placify Training & Placement" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: `[Placify Update] Application Round Update - ${company} (${role})`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 10px; margin: 0; width: 100%;">
        <table cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); border-collapse: separate; border: 1px solid #e2e8f0; width: 100%;">
          
          <!-- Gradient Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Placify</h1>
              <p style="color: #bfdbfe; margin: 5px 0 0 0; font-size: 14px; font-weight: 500;">Training & Placement Cell Portal</p>
            </td>
          </tr>
          
          <!-- Card Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.2px;">Dear ${studentName},</h2>
              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
                ${getStatusDescription()}
              </p>
              
              <!-- Opportunity Details Card -->
              <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; padding: 20px; margin-bottom: 25px;">
                <tr>
                  <td style="padding-bottom: 12px; width: 50%;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: bold; letter-spacing: 0.5px;">Company</span>
                    <strong style="font-size: 15px; color: #1e293b;">${company}</strong>
                  </td>
                  <td style="padding-bottom: 12px; width: 50%;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: bold; letter-spacing: 0.5px;">Role / Position</span>
                    <strong style="font-size: 15px; color: #1e293b;">${role}</strong>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span style="display: block; font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: bold; letter-spacing: 0.5px;">Annual Package</span>
                    <strong style="font-size: 15px; color: #1e293b;">${packageAmount || 'Competitive'}</strong>
                  </td>
                  <td>
                    <span style="display: block; font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: bold; letter-spacing: 0.5px;">Update Date</span>
                    <strong style="font-size: 15px; color: #1e293b;">${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                  </td>
                </tr>
              </table>
              
              <!-- Status Badge Card -->
              <div style="background-color: ${theme.bg}; border: 1px solid ${theme.border}; border-left: 5px solid ${theme.color}; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 24px; line-height: 1;">${theme.icon}</span>
                <div>
                  <span style="display: block; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">New Stage / Status</span>
                  <strong style="color: ${theme.color}; font-size: 16px; font-weight: bold;">${theme.badge}</strong>
                </div>
              </div>
              
              <!-- Remarks -->
              ${remarksSection}
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 25px 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: bold;">Training & Placement Cell,Placify</p>
              <p style="margin: 15px 0 0 0; font-size: 10px; color: #cbd5e1;">This is an automated transactional message. Please do not reply directly to this email.</p>
            </td>
          </tr>
        </table>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email dispatched to ${studentEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`Failed to dispatch email to ${studentEmail}:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendApplicationStatusEmail
};
