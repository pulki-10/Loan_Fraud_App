import React, { useState, useEffect, useRef } from 'react';

//  Component for the Shimmer Effect
const ReportSkeleton = () => (
  <div className="report-card" style={{ border: '1px solid #eee' }}>
    {/* Mimic the Title */}
    <div className="skeleton-box skeleton-title"></div>
    
    <div className="report-table">
      {[1, 2, 3].map((i) => (
        <div className="report-row" key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f9f9f9' }}>
          <div className="skeleton-box skeleton-row-label"></div>
          <div className="skeleton-box skeleton-row-value"></div>
        </div>
      ))}
    </div>
  </div>
);

// Component for the Process Stream Popup
const ProcessStreamModal = ({ isOpen, onClose, applicantId, logs, explainableAI }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay secondary-overlay">
      <div className="stream-modal-content">
        <div className="stream-header">
          <span>Process Stream for Applicant ID : {applicantId}</span>
          <button className="stream-close-x" onClick={onClose}>&times;</button>
        </div>
        
        <div className="stream-body">
          <div className="stream-field">
            <span className="stream-label">Running</span>
            <span className="stream-value">
              <span className="shield-icon">🛡️</span> KYC_Agent
            </span>
          </div>

          <div className="stream-field">
            <span className="stream-label">Progress</span>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: '100%' }}></div>
              <span className="progress-text">100%</span>
            </div>
          </div>

          <div className="stream-field">
            <span className="stream-label">Status</span>
            <span className="stream-value status-completed">Completed</span>
          </div>

          <div className="stream-field logs-section">
            <span className="stream-label">Commentary Logs</span>
            <div className="logs-container">
              {logs?.map((log, index) => (
                <div key={index} className="log-entry">{log}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="stream-field xai-section">
              <span className="stream-label">
                Explainable AI
              </span>
              <div className="xai-container">
                 {explainableAI || "No reasoning available."}
              </div>
            </div>
          </div>
       
        </div>
      </div>
    </div>
  );
};

const ApplicationReviewModal = ({ isOpen, onClose, appData }) => {
  const [isStreamOpen, setIsStreamOpen] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Use a Ref to track if we've already fetched for this specific ID
  const fetchedIdRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Only fetch if the modal is open
      // 2. Only fetch if we have an ID
      // 3. Only fetch if we haven't already fetched for THIS specific ID
      if (!isOpen || !appData?.id || fetchedIdRef.current === appData.id) return;

      setLoading(true);
      fetchedIdRef.current = appData.id; // Mark this ID as "in-flight" or "fetched"

      try {
        const response1 = await fetch("https://iwbe2d6db7.execute-api.us-west-2.amazonaws.com/dev/verify", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ "ApplicantID": appData.id }),
        });

        if (!response1.ok) {
          throw new Error(`API Error ${response1.status}`);
        }

        const data1 = await response1.json();
        setApiData(data1);
      } catch (error) {
        console.error("Fetch operation failed:", error.message);
        fetchedIdRef.current = null; // Reset on error so user can retry
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Reset when modal closes so it can refresh next time it opens for a new applicant
    if (!isOpen) {
      setApiData(null);
      fetchedIdRef.current = null;
    }
  }, [isOpen, appData?.id]);

  if (!isOpen) return null;

  const addressReport = apiData?.["Address Agent"];
  const kycReport = apiData?.["KYC Agent"];
  const logs = apiData?.["Live Logs"];
  console.log("apiData:", apiData);
  const explainableAI = apiData?.["XAI reasoning"];
  console.log("ExplainableAI:", explainableAI);

  return (
    <>
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <span>Application Review</span>
          <button className="close-x" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-container">
          <aside className="modal-sidebar">
            <div className="sidebar-nav-item">📄 Dynamic Orch. Agent</div>
            <div className="sidebar-nav-item">📊 Delegation Agent</div>
            <div className="sidebar-nav-item">📈 Graph Agent</div>
            <div className="sidebar-nav-item">📉 Behavioural Agent</div>
            <div className="sidebar-nav-item active">🛡️ KYC_Agent</div>
          </aside>

          <main className="modal-main">
            {loading ? (
                <>
                  {/* Show two skeletons while loading to mimic the 2 report cards */}
                  <ReportSkeleton />
                  <ReportSkeleton />
                </>
              ) : (
              <>
                <div className="report-card">
                  <h2 className="report-title">Address Verification Report</h2>
                  <div className="report-table">
                    <div className="report-row">
                      <div className="report-label">Verification Status</div>
                      <div className={`report-value ${addressReport?.verification_status === 'Rejected' ? 'status-fraud' : 'status-review'}`}>
                        {addressReport?.verification_status || "Pending"}
                      </div>
                    </div>
                    <div className="report-row">
                      <div className="report-label">Application ID</div>
                      <div className="report-value">{addressReport?.application_ID || appData?.id}</div>
                    </div>
                    <div className="report-row">
                      <div className="report-label">2FA Check</div>
                      <div className="report-value">{addressReport?.["2fa_check"] || "N/A"}</div>
                    </div>
                    <div className="report-row">
                      <div className="report-label">Summary</div>
                      <div className="report-value">{addressReport?.summary}</div>
                    </div>
                  </div>
                </div>

                <div className="report-card">
                  <h2 className="report-title">KYC Agent Report</h2>
                  <div className="report-table">
                    <div className="report-row">
                      <div className="report-label">Risk Status</div>
                      <div className="report-value status-fraud">{kycReport?.status}</div>
                    </div>
                     <div className="report-row">
                      <div className="report-label">Risk Level</div>
                      <div className="report-value status-fraud">{kycReport?.risk_level}</div>
                    </div>
                    
                    <div className="report-row">
                      <div className="report-label">Reason</div>
                      <div className="report-value">{kycReport?.summary}</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="process-stream" onClick={() => setIsStreamOpen(true)}>
                Click to View Process Stream
            </div>

            <div className='action-buttons'>
              <button className='btn approve-btn'>Approve</button>
              <button className='btn reject-btn'>Reject</button>
            </div>
          </main>
        </div>
      </div>
    </div>

    <ProcessStreamModal 
      isOpen={isStreamOpen} 
      onClose={() => setIsStreamOpen(false)} 
      applicantId={appData?.id}
      logs={logs}
      explainableAI={explainableAI}
    />
    </>
  );
};

export default ApplicationReviewModal;