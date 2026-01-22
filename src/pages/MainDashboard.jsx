// import React, { useState, useEffect, useMemo } from 'react';
// import './Dashboard.css'; 
// import EyeReviewIcon from '../assets/eye-review.png';
// import Reload from '../assets/Reload.png';
// import ApplicationReviewModal from './ApplicationReviewModal';

// const ApplicationTable = ({ applications }) => {
//   const [apiError, setApiError] = useState(null);

//   // --- Modal State ---
//   const [showModal, setShowModal] = useState(false);
//   const [activeApp, setActiveApp] = useState(null);

//   const handleReviewClick = (app) => {
//     setActiveApp(app);
//     setShowModal(true); // Open the popup
//     handleStartClick(app.id); // Trigger the API
//   };

//   const handleStartClick = async (applicantId) => {
//     if (!applicantId) {
//       setApiError("Invalid Applicant ID.");
//       return;
//     }

//   };

//   return (
//     <div className="applications-table-container">
//       {apiError && <div className="error-banner" style={{ color: 'red', marginBottom: '10px' }}>{apiError}</div>}
//       <table className="dashboard-table">
//         <thead>
//           <tr className="thead-light">
//             <th>Application ID</th>
//             <th>Applicant</th>
//             <th>Loan Type</th>
//             <th>Amount</th>
//             <th>Credit Score</th>
//             <th>Risk Level</th>
//             <th>Status</th>
//             <th>Date</th>
//             <th>Review</th>
//           </tr>
//         </thead>
//         <tbody>
//           {applications.map((app, index) => (
//             <tr key={app.id || `app-${index}`}>
//               <td>{app.id || 'N/A'}</td>
//               <td>{app.applicant || 'Unknown'}</td>
//               <td>{app.loanType || 'N/A'}</td>
//               <td>
//                 {app.amount
//                   ? app.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
//                   : '$0'}
//               </td>
//               <td>{app.creditScore || '-'}</td>
//               <td>{app.riskLevel || 'Not Rated'}</td>

//               <td>
//                 <span className={`status-badge status-${(app.status || 'pending').toLowerCase().replace(' ', '-')}`}>
//                   {app.status || 'Pending'}
//                 </span>
//               </td>
//               <td>{app.date || 'N/A'}</td>
//               <td className="review-cell">
//                 <span className="review-icon">
//                   <img src={EyeReviewIcon} className='eye' alt="review" 
//                   onClick={() => handleReviewClick(app)} 
//         style={{ cursor: 'pointer' }}/>

//         {/* Render the Modal */}
//       <ApplicationReviewModal 
//         isOpen={showModal} 
//         onClose={() => setShowModal(false)} 
//         appData={activeApp}
//       />
//                 </span>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// const StatisticCard = ({ title, value, colorClass }) => (
//   <div className={`stat-card ${colorClass}`}>
//     <p className="stat-value">{value}</p>
//     <p className="stat-title">{title}</p>
//   </div>
// );

// const CheckboxDropdown = ({ label, options, selectedValues, onChange }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = React.useRef(null);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [dropdownRef]);

//   const handleCheckboxChange = (option) => {
//     const isSelected = selectedValues.includes(option);
//     let newSelected;
    
//     if (option === `All ${label}`) {
//       newSelected = [option]; // Reset to "All"
//     } else {
//       // Remove "All" if a specific option is picked
//       const filtered = selectedValues.filter(v => v !== `All ${label}`);
//       newSelected = isSelected 
//         ? filtered.filter(v => v !== option) 
//         : [...filtered, option];
      
//       // If nothing left, default back to "All"
//       if (newSelected.length === 0) newSelected = [`All ${label}`];
//     }
//     onChange(newSelected);
//   };

//   return (
//     <div className="custom-checkbox-dropdown" ref={dropdownRef}>
//       <div 
//         className={`dropdown-header ${selectedValues[0] !== `All ${label}` ? 'active-filter' : ''}`} 
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         {selectedValues.length > 1 ? `${label} (${selectedValues.length})` : selectedValues[0]}
//       </div>
      
//       {isOpen && (
//         <div className="dropdown-list">
//           {options.map((option) => (
//             <label key={option} className="dropdown-item">
//               <input
//                className="checkbox-box"
//                 type="checkbox"
//                 checked={selectedValues.includes(option)}
//                 onChange={() => handleCheckboxChange(option)}
//               />
//               <span className="checkbox-custom"></span>
//               {option}
//             </label>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };


// const Dashboard = () => {
//   // Change single strings to Arrays
//   const [applications, setApplications] = useState([]);
//   const [statusFilter, setStatusFilter] = useState(['All Status']);
//   const [riskFilter, setRiskFilter] = useState(['All Risk']);
//   const [loanFilter, setLoanFilter] = useState('All Loan');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch('https://xqbtl1s9l0.execute-api.us-west-2.amazonaws.com/prod/dashboard');
//         if (!response.ok) throw new Error('Failed to fetch');
//         const rawData = await response.json();
        
//         const normalizedData = rawData.map(app => ({
//           id: app.ApplicationID,
//           loanType: app.LoanType,
//           amount: parseFloat(app.Amount),
//           date: app.Date,
//           applicant: app.Applicant || 'Unknown',
//           status: app.Status || 'Pending',
//           creditScore: app.CreditScore || 'N/A',
//           riskLevel: app.RiskLevel || 'Pending Review'
//         }));
//         setApplications(normalizedData);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const filteredApplications = useMemo(() => {
//     return applications.filter(app => {
//       const statusMatch = statusFilter.includes('All Status') || statusFilter.includes(app.status);
//       const riskMatch = riskFilter.includes('All Risk') || riskFilter.includes(app.riskLevel);
//       const loanMatch = loanFilter === 'All Loan' || app.loanType.includes(loanFilter);
//       return statusMatch && riskMatch && loanMatch;
//     });
//   }, [applications, statusFilter, riskFilter, loanFilter]);

//   const totalApplications = applications.length;
//   const pendingApplications = applications.filter(app => app.status === 'Pending').length;
//   const approvedApplications = applications.filter(app => app.status === 'Approved').length;
//   const rejectedApplications = applications.filter(app => app.status === 'Rejected').length;

//   if (loading) return <div className="loading">Loading Dashboard...</div>;
//   if (error) return <div className="error">Error: {error}</div>;

//   // In the JSX return:
//   return (
//     <div className="dashboard-container-main">
//       <header className="dashboard-header">
//         <div className="header-text">
//             <h1>Loan Application Dashboard</h1>
//             <p>Monitor and manage all loan applications with AI-powered fraud detection</p>
//         </div>
//         <button className="refresh-btn" onClick={() => window.location.reload()}>
//             <img src={Reload} alt="Refresh" />
//         </button>
//       </header>

//       <section className="stats-grid">
//         <StatisticCard title="Total Applications" value={totalApplications} colorClass="total-card" />
//         <StatisticCard title="Pending" value={pendingApplications} colorClass="pending-card" />
//         <StatisticCard title="Approved" value={approvedApplications} colorClass="approved-card" />
//         <StatisticCard title="Rejected" value={rejectedApplications} colorClass="rejected-card" />
//       </section>

//       {/* --- NEW SECTION: HEADING AND FILTERS --- */}
//       <section className="table-controls-section">
//         <div className="table-header-info">
//             <h2>Total Applications</h2>
//             <p>Applications with medium or high risk are auto flagged for review</p>
//         </div>
//     <div className="filter-bar">
//       <CheckboxDropdown 
//         label="Status"
//         options={[ 'Pending', 'Approved', 'Rejected', 'Escalated']}
//         selectedValues={statusFilter}
//         onChange={setStatusFilter}
//       />

//       <CheckboxDropdown 
//         label="Risk"
//         options={['All Risk', 'Low', 'Medium', 'High', 'Critical']}
//         selectedValues={riskFilter}
//         onChange={setRiskFilter}
//       />

//            <select
//             className={loanFilter !== "All Loan" ? "active-filter" : ""}
//              value={loanFilter} onChange={(e) => setLoanFilter(e.target.value)}>
//                 <option>All Loan</option>
//                 <option>Personal</option>
//                 <option>Business</option>
//             </select>

//             <select >
//             <option>Last 7 Days</option>
//                 <option>Last 14 Days</option>
//                 <option>Last 30 Days</option>
//                 <option>Last 3 Months</option>
            
//             </select>
      
//         </div>
//       </section>

//       <ApplicationTable applications={filteredApplications} />
//     </div>
//   );
// };
// export default Dashboard;






















// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import './Dashboard.css'; 
// import EyeReviewIcon from '../assets/eye-review.png';
// import Reload from '../assets/Reload.png';
// import ApplicationReviewModal from './ApplicationReviewModal';

// const ApplicationTable = ({ applications }) => {
//   const [showModal, setShowModal] = useState(false);
//   const [activeApp, setActiveApp] = useState(null);

//   const handleReviewClick = (app) => {
//     setActiveApp(app);
//     setShowModal(true);
//   };

//   return (
//     <div className="applications-table-container">
//       <table className="dashboard-table">
//         <thead>
//           <tr className="thead-light">
//             <th>Application ID</th>
//             <th>Applicant</th>
//             <th>Loan Type</th>
//             <th>Amount</th>
//             <th>Status</th>
//             <th>Review</th>
//           </tr>
//         </thead>
//         <tbody>
//           {applications.map((app) => (
//             <tr key={app.id}>
//               <td>{app.id}</td>
//               <td>{app.applicant}</td>
//               <td>{app.loanType}</td>
//               <td>${app.amount.toLocaleString()}</td>
//               <td>
//                 <span className={`status-badge status-${app.status.toLowerCase()}`}>
//                   {app.status}
//                 </span>
//               </td>
//               <td className="review-cell">
//                 <img 
//                   src={EyeReviewIcon} 
//                   className='eye' 
//                   alt="review" 
//                   onClick={() => handleReviewClick(app)} 
//                   style={{ cursor: 'pointer' }}
//                 />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* SINGLE INSTANCE OF MODAL OUTSIDE THE LOOP */}
//       <ApplicationReviewModal 
//         isOpen={showModal} 
//         onClose={() => setShowModal(false)} 
//         appData={activeApp}
//       />
//     </div>
//   );
// };

// // ... StatisticsCard and CheckboxDropdown components remain same as your previous version ...

// const Dashboard = () => {
//   const [applications, setApplications] = useState([]);
//   const [statusFilter, setStatusFilter] = useState(['All Status']);
//   const [riskFilter, setRiskFilter] = useState(['All Risk']);
//   const [loanFilter, setLoanFilter] = useState('All Loan');
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch('https://xqbtl1s9l0.execute-api.us-west-2.amazonaws.com/prod/dashboard');
//         const rawData = await response.json();
//         const normalizedData = rawData.map(app => ({
//           id: app.ApplicationID,
//           loanType: app.LoanType,
//           amount: parseFloat(app.Amount),
//           applicant: app.Applicant || 'Unknown',
//           status: app.Status || 'Pending',
//           riskLevel: app.RiskLevel || 'Low'
//         }));
//         setApplications(normalizedData);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const filteredApplications = useMemo(() => {
//     return applications.filter(app => {
//       const statusMatch = statusFilter.includes('All Status') || statusFilter.includes(app.status);
//       const riskMatch = riskFilter.includes('All Risk') || riskFilter.includes(app.riskLevel);
//       const loanMatch = loanFilter === 'All Loan' || app.loanType.includes(loanFilter);
//       return statusMatch && riskMatch && loanMatch;
//     });
//   }, [applications, statusFilter, riskFilter, loanFilter]);

//   if (loading) return <div>Loading...</div>;

//   return (
//     <div className="dashboard-container-main">
//       <header className="dashboard-header">
//         <h1>Loan Application Dashboard</h1>
//         <button onClick={() => window.location.reload()}><img src={Reload} alt="Reload" /></button>
//       </header>
//       {/* ... Filters and Stats Grid ... */}
//       <ApplicationTable applications={filteredApplications} />
//     </div>
//   );
// };

// export default Dashboard;



















import React, { useState, useEffect, useMemo, useRef } from 'react';
import './Dashboard.css'; 
import EyeReviewIcon from '../assets/eye-review.png';
import Reload from '../assets/Reload.png';
import ApplicationReviewModal from './ApplicationReviewModal';

const ApplicationTable = ({ applications }) => {
  const [showModal, setShowModal] = useState(false);
  const [activeApp, setActiveApp] = useState(null);

  const handleReviewClick = (app) => {
    setActiveApp(app);
    setShowModal(true);
  };

  return (
    <div className="applications-table-container">
      <table className="dashboard-table">
        <thead>
          <tr className="thead-light">
            <th>Application ID</th>
            <th>Applicant</th>
            <th>Loan Type</th>
            <th>Amount</th>
            <th>Credit Score</th>
            <th>Risk Level</th>
            <th>Status</th>
            <th>Date</th>
            <th>Review</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app, index) => (
            <tr key={app.id || `app-${index}`}>
              <td>{app.id || 'N/A'}</td>
              <td>{app.applicant || 'Unknown'}</td>
              <td>{app.loanType || 'N/A'}</td>
              <td>
                {app.amount
                  ? app.amount.toLocaleString('en-US', { 
                      style: 'currency', 
                      currency: 'USD', 
                      minimumFractionDigits: 0 
                    })
                  : '$0'}
              </td>
              <td>{app.creditScore || '-'}</td>
              <td>{app.riskLevel || 'Not Rated'}</td>
              <td>
                <span className={`status-badge status-${(app.status || 'pending').toLowerCase().replace(' ', '-')}`}>
                  {app.status || 'Pending'}
                </span>
              </td>
              <td>{app.date || 'N/A'}</td>
             <td className="review-cell">
  <span className="review-icon"> {/* Restored this wrapper */}
    <img 
      src={EyeReviewIcon} 
      className='eye' 
      alt="review" 
      onClick={() => handleReviewClick(app)} 
      style={{ cursor: 'pointer' }}
    />
  </span>
</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* FIXED: Modal moved outside the loop to prevent multiple API triggers */}
      <ApplicationReviewModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        appData={activeApp}
      />
    </div>
  );
};

const StatisticCard = ({ title, value, colorClass }) => (
  <div className={`stat-card ${colorClass}`}>
    <p className="stat-value">{value}</p>
    <p className="stat-title">{title}</p>
  </div>
);

const CheckboxDropdown = ({ label, options, selectedValues, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleCheckboxChange = (option) => {
    const isSelected = selectedValues.includes(option);
    let newSelected;
    
    if (option === `All ${label}`) {
      newSelected = [option];
    } else {
      const filtered = selectedValues.filter(v => v !== `All ${label}`);
      newSelected = isSelected 
        ? filtered.filter(v => v !== option) 
        : [...filtered, option];
      
      if (newSelected.length === 0) newSelected = [`All ${label}`];
    }
    onChange(newSelected);
  };

  return (
    <div className="custom-checkbox-dropdown" ref={dropdownRef}>
      <div 
        className={`dropdown-header ${selectedValues[0] !== `All ${label}` ? 'active-filter' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedValues.length > 1 ? `${label} (${selectedValues.length})` : selectedValues[0]}
      </div>
      
      {isOpen && (
        <div className="dropdown-list">
          {options.map((option) => (
            <label key={option} className="dropdown-item">
              <input
                className="checkbox-box"
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={() => handleCheckboxChange(option)}
              />
              <span className="checkbox-custom"></span>
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState(['All Status']);
  const [riskFilter, setRiskFilter] = useState(['All Risk']);
  const [loanFilter, setLoanFilter] = useState('All Loan');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://xqbtl1s9l0.execute-api.us-west-2.amazonaws.com/prod/dashboard');
        if (!response.ok) throw new Error('Failed to fetch');
        const rawData = await response.json();
        
        const normalizedData = rawData.map(app => ({
          id: app.ApplicationID,
          loanType: app.LoanType,
          amount: parseFloat(app.Amount),
          date: app.Date,
          applicant: app.Applicant || 'Unknown',
          status: app.Status || 'Pending',
          creditScore: app.CreditScore || 'N/A',
          riskLevel: app.RiskLevel || 'Pending Review'
        }));
        setApplications(normalizedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const statusMatch = statusFilter.includes('All Status') || statusFilter.includes(app.status);
      const riskMatch = riskFilter.includes('All Risk') || riskFilter.includes(app.riskLevel);
      const loanMatch = loanFilter === 'All Loan' || app.loanType.includes(loanFilter);
      return statusMatch && riskMatch && loanMatch;
    });
  }, [applications, statusFilter, riskFilter, loanFilter]);

  const stats = useMemo(() => ({
    total: applications.length,
    pending: applications.filter(app => app.status === 'Pending').length,
    approved: applications.filter(app => app.status === 'Approved').length,
    rejected: applications.filter(app => app.status === 'Rejected').length,
  }), [applications]);

  if (loading) return <div className="loading">Loading Dashboard...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard-container-main">
      <header className="dashboard-header">
        <div className="header-text">
            <h1>Loan Application Dashboard</h1>
            <p>Monitor and manage all loan applications with AI-powered fraud detection</p>
        </div>
        <button className="refresh-btn" onClick={() => window.location.reload()}>
            <img src={Reload} alt="Refresh" />
        </button>
      </header>

      <section className="stats-grid">
        <StatisticCard title="Total Applications" value={stats.total} colorClass="total-card" />
        <StatisticCard title="Pending" value={stats.pending} colorClass="pending-card" />
        <StatisticCard title="Approved" value={stats.approved} colorClass="approved-card" />
        <StatisticCard title="Rejected" value={stats.rejected} colorClass="rejected-card" />
      </section>

      <section className="table-controls-section">
        <div className="table-header-info">
            <h2>Total Applications</h2>
            <p>Applications with medium or high risk are auto flagged for review</p>
        </div>
        <div className="filter-bar">
          <CheckboxDropdown 
            label="Status"
            options={['Pending', 'Approved', 'Rejected', 'Escalated']}
            selectedValues={statusFilter}
            onChange={setStatusFilter}
          />
          <CheckboxDropdown 
            label="Risk"
            options={['Low', 'Medium', 'High', 'Critical']}
            selectedValues={riskFilter}
            onChange={setRiskFilter}
          />
          <select className={loanFilter !== "All Loan" ? "active-filter" : ""}
            value={loanFilter} onChange={(e) => setLoanFilter(e.target.value)}>
              <option>All Loan</option>
              <option>Personal</option>
              <option>Business</option>
          </select>
          <select>
            <option>Last 7 Days</option>
            <option>Last 14 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
      </section>

      <ApplicationTable applications={filteredApplications} />
    </div>
  );
};

export default Dashboard;