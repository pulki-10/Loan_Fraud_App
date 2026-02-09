import React, { useState, useEffect, useRef } from 'react';
import DynamicAgentIcon from '../assets/agentIcons/dynamic-agent.png';
import DelegationAgentIcon from '../assets/agentIcons/delegation-agent.png';
import GraphAgentIcon from '../assets/agentIcons/graph agent.png';
import BehaviouralAgentIcon from '../assets/agentIcons/behavioural-agent.png';
import KYCIcon from '../assets/agentIcons/kyc-agent.png';
import CrossIcon from '../assets/agentIcons/cross.png'

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
const ProcessStreamModal = ({ isOpen, onClose, applicantId, logs, explainableAI ,agentName, agentIcon}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay secondary-overlay">
      <div className="stream-modal-content">
        <div className="stream-header">
          <span>Process Stream for Applicant ID : {applicantId}</span>
          <button className="stream-close-x" onClick={onClose}>
             <div >
    <img src={CrossIcon} alt="x"  /> 
  </div>
          </button>
        </div>
        
        <div className="stream-body">
          <div className="stream-field">
            <span className="stream-label">Running</span>
            {/* <span className="stream-value">
              <img src={KYCIcon} alt="" className="agent-icon-small" /> KYC_Agent
  </span> */}
  <span className="stream-value">
         
              <img src={agentIcon} alt="" className="agent-icon-small" /> {agentName}
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

          {/* <div className="stream-field logs-section">
            <span className="stream-label">Commentary Logs</span>
            <div className="logs-container">
              {logs?.map((log, index) => (
                <div key={index} className="log-entry">{log}</div>
              ))}
            </div>
          </div>

           <div className="stream-field logs-section">
            <span className="stream-label"> Explainable AI</span>
             <div className="logs-container">
                 {explainableAI || "No reasoning available."}
              </div>
          </div> */}
          <div className="stream-field logs-section">
  <span className="stream-label">Commentary Logs</span>
  <div className="logs-container">
    {logs?.map((log, index) => (
      <div key={index} className="log-entry">{log}</div>
    ))}
  </div>
</div>

{/* Updated XAI Section */}
{/* <div className="stream-field logs-section">
  <span className="stream-label">Explainable AI</span>
  <div className="logs-container">
    <div className="log-entry xai-content">
      {explainableAI || "No reasoning available."}
    </div>
  </div>
</div> */}
<div className="stream-field logs-section">
  <span className="stream-label">Explainable AI</span>
  <div className="logs-container">
    <div className="log-entry xai-content">
      {Array.isArray(explainableAI) ? (
        explainableAI.map((line, idx) => (
          <div key={idx} style={{ marginBottom: '4px' }}>{line}</div>
        ))
      ) : (
        explainableAI || "No reasoning available."
      )}
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
  const [activeTab, setActiveTab] = useState('KYC_Agent');
  
  const fetchedIdRef = useRef(null);

  useEffect(() => {
  const fetchData = async () => {
    if (!isOpen || !appData?.id || fetchedIdRef.current === appData.id) return;

    setLoading(true);
    fetchedIdRef.current = appData.id;

    const payload = JSON.stringify({ "ApplicantID": appData.id });

    try {
      // Use allSettled so one failure doesn't stop the others
      const results = await Promise.allSettled([
        fetch("https://iwbe2d6db7.execute-api.us-west-2.amazonaws.com/dev/verify", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        }),
        fetch("https://indk5ueh3f.execute-api.us-west-2.amazonaws.com/DEX_APPNO/consolidated-report", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        }),
        fetch('https://4ydeedvof2.execute-api.us-west-2.amazonaws.com/prod/bagent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        })
      ]);

      let combinedData = {};

      // 1. Process Verify API (The one returning the array)
      if (results[0].status === "fulfilled" && results[0].value.ok) {
        const data = await results[0].value.json();
        const mainData = Array.isArray(data) ? data[0] : data;
        combinedData = { ...combinedData, ...mainData };
        // console.log("Verify Data Loaded:", mainData);
      } else {
        console.error("Verify API failed or was rejected");
      }

      // 2. Process Consolidated API
      if (results[1].status === "fulfilled" && results[1].value.ok) {
        const data = await results[1].value.json();
        combinedData.consolidated = data;
        console.log("Consolidated Data Loaded:", data);
      } else {
        console.warn("Consolidated API failed - UI will show N/A for those fields");
      }

      // 3. Process Behavioral API
      if (results[2].status === "fulfilled" && results[2].value.ok) {
        const data = await results[2].value.json();
        combinedData.behavioral = data;
      }

      setApiData(combinedData);

    } catch (error) {
      console.error("Critical error in fetchData:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();

  if (!isOpen) {
    setApiData(null);
    fetchedIdRef.current = null;
  }
}, [isOpen, appData?.id]);

  if (!isOpen) return null;

  const addressReport = apiData?.["Address Agent"];
  // console.log("Address Report:", addressReport);
  // console.log("API Data:", apiData);
  const kycReport = apiData?.["KYC Agent"];
  // console.log("KYC Report:", kycReport);
const dexReport = apiData?.consolidated;
 const rawLogs = activeTab === 'DelegationAgent' ? dexReport?.intelligence?.live_logs : apiData?.["Live Logs"];
const logs = rawLogs?.map(log => log.replace(/^\u2022\s*/, ''));
const explainableAI = activeTab === 'DelegationAgent' 
  ? dexReport?.intelligence?.xai_summary 
  : apiData?.["XAI reasoning"];

  const getActiveAgentInfo = () => {
  switch (activeTab) {
    case 'DelegationAgent':
      return { name: 'DEX_Agent', icon: DelegationAgentIcon };
    case 'KYC_Agent':
    default:
      return { name: 'KYC_Agent', icon: KYCIcon };
  }
};

const activeAgent = getActiveAgentInfo();

  return (
    <>
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <span>Application Review</span>
          <button className="stream-close-x" onClick={onClose}>
             <div >
    <img src={CrossIcon} alt="x"  /> 
  </div>
          </button>
        </div>
        
       <div className="modal-container">
          <aside className="modal-sidebar">
            <div className={`sidebar-nav-item ${activeTab === 'Dynamic' ? 'active' : ''}`} onClick={() => setActiveTab('Dynamic')}>
              <img src={DynamicAgentIcon} alt="" className="agent-icon-small" /> Dynamic Orch. Agent
            </div>
            {/* CLICK HANDLER ADDED HERE */}
            <div className={`sidebar-nav-item ${activeTab === 'DelegationAgent' ? 'active' : ''}`} onClick={() => setActiveTab('DelegationAgent')}>
              <img src={DelegationAgentIcon} alt="" className="agent-icon-small" /> Delegation Agent
            </div>
            <div className={`sidebar-nav-item ${activeTab === 'Graph' ? 'active' : ''}`} onClick={() => setActiveTab('Graph')}>
              <img src={GraphAgentIcon} alt="" className="agent-icon-small" /> Graph Agent
            </div>
            <div className={`sidebar-nav-item ${activeTab === 'Behavioural' ? 'active' : ''}`} onClick={() => setActiveTab('Behavioural')}>
              <img src={BehaviouralAgentIcon} alt="" className="agent-icon-small" /> Behavioural Agent
            </div>
            <div className={`sidebar-nav-item ${activeTab === 'KYC_Agent' ? 'active' : ''}`} onClick={() => setActiveTab('KYC_Agent')}>
              <img src={KYCIcon} alt="" className="agent-icon-small" /> KYC_Agent
            </div>
          </aside>

          <main className="modal-main">
            {loading ? (
                <>
                  <ReportSkeleton />
                  <ReportSkeleton />
                </>
              ) : (
              <>
                {/* CONDITIONAL RENDERING BASED ON ACTIVE TAB */}
                {activeTab === 'DelegationAgent' ? (
                  <div className="report-card">
                    <h2 className="report-title">Delegation Agent Report (DEX)</h2>
                    <div className="report-table">
                      <div className="report-row">
                        <div className="report-label">Risk Level</div>
                    <div className={`report-value ${dexReport?.risk_assessment?.level === 'SAFE' ? 'status-review' : 'status-fraud'}`}>
          {dexReport?.risk_assessment?.level || "N/A"}
        </div>
                      </div>
                    <div className="report-row">
        <div className="report-label">Risk Score</div>
        <div className="report-value">{dexReport?.risk_assessment?.score || "0.0"}</div>
      </div>
      <div className="report-row">
        <div className="report-label">Applicant ID</div>
        <div className="report-value">{dexReport?.meta?.applicant_id}</div>
      </div>
      {/* <div className="report-row">
        <div className="report-label">Session ID</div>
        <div className="report-value" style={{ fontSize: '10px' }}>{dexReport?.meta?.session_id}</div>
      </div> */}
      <div className="report-row">
        <div className="report-label">Status</div>
        <div className="report-value">{dexReport?.meta?.status}</div>
      </div>
      {dexReport?.risk_assessment?.flags?.length > 0 && (
        <div className="report-row">
          <div className="report-label">Flags</div>
          <div className="report-value">{dexReport.risk_assessment.flags.join(', ')}</div>
        </div>
      )}
                    </div>
                  </div>
                ) :activeTab === 'Behavioural' ? (
        /* 2. BEHAVIOURAL AGENT VIEW */
        <div className="report-card">
          <h2 className="report-title">Behavioral Agent Report</h2>
          <div className="report-table">
            <div className="report-row">
              <div className="report-label">Applicant ID</div>
              <div className="report-value">{apiData?.behavioral?.ApplicantID || "N/A"}</div>
            </div>
            <div className="report-row">
              <div className="report-label">Risk Score</div>
              <div className={`report-value ${parseFloat(apiData?.behavioral?.riskScore) > 0.5 ? 'status-fraud' : 'status-review'}`}>
                {apiData?.behavioral?.riskScore || "N/A"}
              </div>
            </div>
            <div className="report-row">
              <div className="report-label">Flags</div>
              <div className="report-value">
                {apiData?.behavioral?.flags?.length > 0 
                  ? apiData.behavioral.flags.join(', ') 
                  : "None"}
              </div>
            </div>
            <div className="report-row">
              <div className="report-label">Reasoning</div>
              <div className="report-value">{apiData?.behavioral?.reasoning || "N/A"}</div>
            </div>
          </div>
        </div>
      ) :
                 (
                  <>
                    {/* Default KYC / Address View */}
                    <div className="report-card">
                      <h2 className="report-title">Address Verification Report</h2>
                           <div className="report-row">
                          <div className="report-label">Application ID</div>
                          <div className="report-value">{addressReport?.application_ID || appData?.id}</div>
                        </div>
                      <div className="report-table">
                        {addressReport?.error && (
      <div className="report-row error-row">
        <div className="report-label">Agent Error</div>
        <div className="report-value status-fraud">{addressReport.error}</div>
      </div>
    )}
                        {addressReport?.verification_status && (
      <div className="report-row">
        <div className="report-label">Verification Status</div>
        <div className={`report-value ${addressReport.verification_status === 'Rejected' ? 'status-fraud' : 'status-review'}`}>
          {addressReport.verification_status}
        </div>
      </div>
    )}
                   
                          {addressReport?.["2fa_check"] && (
      <div className="report-row">
        <div className="report-label">2FA Check</div>
        <div className="report-value">{addressReport["2fa_check"]}</div>
      </div>
    )}
                       {addressReport?.summary && (
      <div className="report-row">
        <div className="report-label">Summary</div>
        <div className="report-value">{addressReport.summary}</div>
      </div>
    )}
                      </div>
                    </div>

                    <div className="report-card">
                      <h2 className="report-title">KYC Agent Report</h2>
                      <div className="report-table">
                        <div className="report-row">
                          <div className="report-label">Risk Status</div>
                          <div className="report-value status-fraud">{kycReport?.status}</div>
                        </div>
                        {/* <div className="report-row">
                          <div className="report-label">Reason</div>
                          <div className="report-value">{kycReport?.summary}</div>
                        </div> */}
                        <div className="report-row">
      <div className="report-label">Risk Level</div>
      <div className="report-value">{kycReport?.risk_level}</div>
    </div>
                      </div>
                    </div>

                     <div className="report-card">
                      <h2 className="report-title">Final Verdict</h2>
                      <div className="report-table">
                     {apiData?.Status && (
      <div className="report-row">
        <div className="report-label">Status</div>
        <div className={`report-value ${apiData.Status === 'Rejected' ? 'status-fraud' : 'status-review'}`}>
          {apiData.Status}
        </div>
      </div>
    )}
                     {apiData?.Score !== undefined && (
      <div className="report-row">
        <div className="report-label">Score</div>
        <div className="report-value">{apiData.Score}</div>
      </div>
    )}
                        <div className="report-row">
      <div className="report-label">Risk Level</div>
      <div className="report-value">{kycReport?.risk_level}</div>
    </div>
      {apiData?.summary && (
      <div className="report-row">
        <div className="report-label">Final Summary</div>
        <div className="report-value">{apiData.summary}</div>
      </div>
    )}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* <div className="process-stream" onClick={() => setIsStreamOpen(true)}>
                Click to View Process Stream
            </div> */}
            {activeTab !== 'Behavioural' && (
  <div className="process-stream" onClick={() => setIsStreamOpen(true)}>
    Click to View Process Stream
  </div>
)}

            {apiData?.Status !== 'Approved' && kycReport?.status !== 'Approved' && (
    <div className='action-buttons'>
      <button className='btn approve-btn'>Approve</button>
      {/* <button className='btn reject-btn'>Reject</button> */}
    </div>
  )}
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
      activeAgent={activeTab}
      agentName={activeAgent.name}
      agentIcon={activeAgent.icon}
    />
    </>
  );
};

export default ApplicationReviewModal;