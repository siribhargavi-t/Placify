import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const PlacementContext = createContext(null);

export const PlacementProvider = ({ children }) => {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  // Helper to fetch authorization headers
  const getHeaders = () => {
    const token = localStorage.getItem('placify-token');
    return token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };
  };

  // Load all dashboard placement data from Express
  const fetchData = async () => {
    try {
      const headers = getHeaders();
      
      // Fetch placement drives
      const resDrives = await fetch('/api/drives', { headers });
      if (resDrives.ok) {
        const dataDrives = await resDrives.json();
        setDrives(dataDrives);
      }

      // Fetch applications
      const resApps = await fetch('/api/applications', { headers });
      if (resApps.ok) {
        const dataApps = await resApps.json();
        setApplications(dataApps);
      }

      // Fetch notifications
      const resNotifs = await fetch('/api/notifications', { headers });
      if (resNotifs.ok) {
        const dataNotifs = await resNotifs.json();
        setNotifications(dataNotifs);
      }
    } catch (err) {
      console.error('Error fetching placement data:', err);
    }
  };

  // Sync state whenever logged-in user changes
  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setDrives([]);
      setApplications([]);
      setNotifications([]);
    }
  }, [user]);

  // Mark all notifications matching user role/email as read
  const markNotificationsAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read', {
        method: 'PUT',
        headers: getHeaders()
      });
      if (res.ok) {
        // Reload notifications list
        const resNotifs = await fetch('/api/notifications', { headers: getHeaders() });
        if (resNotifs.ok) {
          const dataNotifs = await resNotifs.json();
          setNotifications(dataNotifs);
        }
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  // Clear user notifications
  const clearNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        // Reload notifications list
        const resNotifs = await fetch('/api/notifications', { headers: getHeaders() });
        if (resNotifs.ok) {
          const dataNotifs = await resNotifs.json();
          setNotifications(dataNotifs);
        }
      }
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  // Student applies to a drive
  const applyToDrive = async (studentEmail, studentName, drive, studentCgpa = 8.2) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ driveId: drive.id || drive._id })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(`Successfully applied to ${drive.company}!`, 'success');
        fetchData();
        return { success: true };
      } else {
        showToast(data.message || 'Failed to apply.', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Error applying to drive:', err);
      showToast('Server connection failed.', 'error');
      return { success: false, message: 'Server connection failed.' };
    }
  };

  // Recruiter/TPO updates application status
  const updateApplicationStatus = async (appId, newStatus, feedback = '') => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus, feedback })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast('Application status updated successfully!', 'success');
        fetchData();
        
        // Mock email notification dispatch matching original
        setTimeout(() => {
          showToast(`📧 Mock email notification dispatched to ${data.application.studentEmail}!`, 'info');
        }, 1500);
      }
    } catch (err) {
      console.error('Error updating application status:', err);
      showToast('Failed to update status.', 'error');
    }
  };

  // Recruiter/TPO posts a drive
  const postDrive = async (driveData) => {
    try {
      const res = await fetch('/api/drives', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(driveData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(`Successfully posted drive for ${driveData.company}!`, 'success');
        fetchData();
      }
    } catch (err) {
      console.error('Error posting drive:', err);
      showToast('Failed to post drive.', 'error');
    }
  };

  // Recruiter/TPO edits a drive
  const editDrive = async (driveId, updatedDriveData) => {
    try {
      const res = await fetch(`/api/drives/${driveId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedDriveData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(`Successfully updated drive details for ${updatedDriveData.company}!`, 'success');
        fetchData();
      }
    } catch (err) {
      console.error('Error editing drive:', err);
      showToast('Failed to edit drive.', 'error');
    }
  };

  // Recruiter/TPO deletes a drive
  const deleteDrive = async (driveId) => {
    try {
      const res = await fetch(`/api/drives/${driveId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        showToast('Successfully deleted recruitment drive.', 'warning');
        fetchData();
      }
    } catch (err) {
      console.error('Error deleting drive:', err);
      showToast('Failed to delete drive.', 'error');
    }
  };

  return (
    <PlacementContext.Provider
      value={{
        drives,
        applications,
        applyToDrive,
        updateApplicationStatus,
        postDrive,
        deleteDrive,
        editDrive,
        toast,
        showToast,
        notifications,
        markNotificationsAsRead,
        clearNotifications
      }}
    >
      {children}
    </PlacementContext.Provider>
  );
};

export const usePlacement = () => {
  const context = useContext(PlacementContext);
  if (!context) {
    throw new Error('usePlacement must be used within a PlacementProvider');
  }
  return context;
};
