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
  const [activeTab, setActiveTab] = useState('KYC_Agent');
  
  // Use a Ref to track if we've already fetched for this specific ID
  const fetchedIdRef = useRef(null);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     // 1. Only fetch if the modal is open
  //     // 2. Only fetch if we have an ID
  //     // 3. Only fetch if we haven't already fetched for THIS specific ID
  //     if (!isOpen || !appData?.id || fetchedIdRef.current === appData.id) return;

  //     setLoading(true);
  //     fetchedIdRef.current = appData.id; // Mark this ID as "in-flight" or "fetched"

  //     try {
  //       const response1 = await fetch("https://iwbe2d6db7.execute-api.us-west-2.amazonaws.com/dev/verify", {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ "ApplicantID": appData.id }),
  //       });

  //       if (!response1.ok) {
  //         throw new Error(`API Error ${response1.status}`);
  //       }

  //       const data1 = await response1.json();
  //       setApiData(data1);
  //     } catch (error) {
  //       console.error("Fetch operation failed:", error.message);
  //       fetchedIdRef.current = null; // Reset on error so user can retry
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();

  //   // Reset when modal closes so it can refresh next time it opens for a new applicant
  //   if (!isOpen) {
  //     setApiData(null);
  //     fetchedIdRef.current = null;
  //   }
  // }, [isOpen, appData?.id]);




  useEffect(() => {
    const fetchData = async () => {
      // 1. Only fetch if the modal is open
      // 2. Only fetch if we have an ID
      // 3. Only fetch if we haven't already fetched for THIS specific ID
      if (!isOpen || !appData?.id || fetchedIdRef.current === appData.id) return;

      setLoading(true);
      fetchedIdRef.current = appData.id;

      try {
        const payload = JSON.stringify({ "ApplicantID": appData.id });

        // Triggering both APIs simultaneously
        const [responseVerify, responseConsolidated] = await Promise.all([
          fetch("https://iwbe2d6db7.execute-api.us-west-2.amazonaws.com/dev/verify", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
          }),
          fetch("https://indk5ueh3f.execute-api.us-west-2.amazonaws.com/DEX_APPNO/consolidated-report", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
          })
        ]);

        if (!responseVerify.ok || !responseConsolidated.ok) {
          throw new Error(`API Error: Verify(${responseVerify.status}) or Consolidated(${responseConsolidated.status})`);
        }

        const dataVerify = await responseVerify.json();
        const dataConsolidated = await responseConsolidated.json();

        // Update your state here
        // If you need to store data from both APIs, you might want to merge them 
        // or create a separate state variable for consolidatedData.
        setApiData({ ...dataVerify, consolidated: dataConsolidated });

      } catch (error) {
        console.error("Fetch operation failed:", error.message);
        fetchedIdRef.current = null; 
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
  const kycReport = apiData?.["KYC Agent"];
  const dexReport = apiData?.consolidated?.dex_report;
  const logs = activeTab === 'DelegationAgent' ? dexReport?.Live_Logs : apiData?.["Live Logs"];
  const explainableAI = activeTab === 'DelegationAgent' ? dexReport?.XAI_Reasoning?.join(' ') : apiData?.["XAI reasoning"];

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
                        <div className={`report-value ${dexReport?.risk_level === 'LOW' ? 'status-review' : 'status-fraud'}`}>
                          {dexReport?.risk_level || "N/A"}
                        </div>
                      </div>
                      <div className="report-row">
                        <div className="report-label">Confidence Score</div>
                        <div className="report-value">{dexReport?.confidence_score}</div>
                      </div>
                      <div className="report-row">
                        <div className="report-label">Session ID</div>
                        <div className="report-value">{dexReport?.session_id}</div>
                      </div>
                      <div className="report-row">
                        <div className="report-label">Latency</div>
                        <div className="report-value">{dexReport?.latency_sec} sec</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Default KYC / Address View */}
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
                          <div className="report-label">Reason</div>
                          <div className="report-value">{kycReport?.summary}</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
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
      activeAgent={activeTab}
      agentName={activeAgent.name}
      agentIcon={activeAgent.icon}
    />
    </>
  );
};

export default ApplicationReviewModal;