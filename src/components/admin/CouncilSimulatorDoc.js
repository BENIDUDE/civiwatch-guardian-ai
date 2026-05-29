import React, { useState, useEffect } from 'react';

const CouncilSimulatorDoc = ({ isEn = true }) => {
  // Smooth scroll for TOC links
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = 'auto'; };
  }, []);

  // --- TOC DATA (UPDATED ORDER) ---
  const tocItems = [
    { id: 'sec-simulations', label: '1. Interactive Demonstrations' },
    { id: 'sec-flowchart', label: '2. Complete System Flowchart' },
    { id: 'sec-dual-engine', label: '3. Dual-Engine Architecture' },
    { id: 'sec-workflow', label: '4. Phase-by-Phase Workflow' },
    { id: 'sec-taxonomy', label: '5. Core Status Taxonomy' },
    { id: 'sec-hitl', label: '6. Human-in-the-Loop & Resolution' },
  ];

  // --- WATERFALL SIMULATION STATE ---
  const [waterfallNodes, setWaterfallNodes] = useState([
    { name: 'GitHub Models (GPT-4o-mini)', online: true },
    { name: 'Groq Llama 3 Vision', online: true },
    { name: 'Google Gemini 1.5 Flash', online: true },
    { name: 'OpenRouter Llama 3 Vision', online: true },
    { name: 'Hugging Face (Llama 3 Vision)', online: true }
  ]);
  const [waterfallResult, setWaterfallResult] = useState(null);
  const [isSimulatingWaterfall, setIsSimulatingWaterfall] = useState(false);

  // --- COUNCIL SIMULATION STATE ---
  const [category, setCategory] = useState('Disinformation');
  const [failureRate, setFailureRate] = useState(0); 
  const [isSimulatingCouncil, setIsSimulatingCouncil] = useState(false);
  const [results, setResults] = useState(null);

  const providers = [
    'GitHub Models (GPT-4o-mini)', 
    'Groq Llama 3 Vision', 
    'Google Gemini 1.5 Flash', 
    'OpenRouter Llama 3 Vision', 
    'Hugging Face (Llama 3 Vision)'
  ];

  const categories = {
    'Incitement': { minConf: 0.90, reqUnanimity: true, ratio: 0.6 },
    'Terrorism': { minConf: 0.95, reqUnanimity: true, ratio: 0.6 },
    'Antisemitism': { minConf: 0.80, reqUnanimity: false, ratio: 0.5 },
    'Disinformation': { minConf: 0.75, reqUnanimity: false, ratio: 0.5 },
    'Default': { minConf: 0.70, reqUnanimity: false, ratio: 0.5 }
  };

  // --- WATERFALL LOGIC ---
  const toggleNode = (index) => {
    const newNodes = [...waterfallNodes];
    newNodes[index].online = !newNodes[index].online;
    setWaterfallNodes(newNodes);
  };

  const runWaterfall = () => {
    setIsSimulatingWaterfall(true);
    setWaterfallResult(null);
    
    let currentStep = 0;
    const logs = [];
    
    const processNext = () => {
      if (currentStep >= waterfallNodes.length) {
         logs.push({ name: 'System', status: 'FAILURE', message: 'All Providers Failed. Routed to Manual Human Review.' });
         setWaterfallResult([...logs]);
         setIsSimulatingWaterfall(false);
         return;
      }
      
      const node = waterfallNodes[currentStep];
      if (!node.online) {
         logs.push({ name: node.name, status: 'TIMEOUT', message: 'Endpoint unreachable. Falling back...' });
         setWaterfallResult([...logs]);
         currentStep++;
         setTimeout(processNext, 600);
      } else {
         logs.push({ name: node.name, status: 'SUCCESS', message: 'Data extracted and tags generated successfully.' });
         setWaterfallResult([...logs]);
         setIsSimulatingWaterfall(false);
      }
    };
    
    setTimeout(processNext, 400);
  };

  // --- COUNCIL LOGIC ---
  const runSimulation = () => {
    setIsSimulatingCouncil(true);
    setResults(null);

    setTimeout(() => {
      const numFails = (failureRate / 100) * 5;
      const shuffled = [...providers].sort(() => 0.5 - Math.random());
      const failedProviders = shuffled.slice(0, numFails);
      const successfulProviders = shuffled.slice(numFails);

      const simResults = [];
      let matchCount = 0;
      let rejectCount = 0;
      let totalMatchConf = 0;

      providers.forEach(provider => {
        if (failedProviders.includes(provider)) {
          simResults.push({ name: provider, status: 'TIMEOUT', vote: null, conf: 0 });
        } else {
          const isMatch = Math.random() > 0.2;
          const conf = (Math.random() * (0.99 - 0.65) + 0.65).toFixed(2);
          
          simResults.push({ 
            name: provider, 
            status: 'SUCCESS', 
            vote: isMatch ? 'Match' : 'Reject', 
            conf: parseFloat(conf) 
          });

          if (isMatch) {
            matchCount++;
            totalMatchConf += parseFloat(conf);
          } else {
            rejectCount++;
          }
        }
      });

      const rule = categories[category];
      const activeCount = successfulProviders.length;
      const requiredVotes = Math.max(1, Math.ceil(activeCount * rule.ratio));
      const avgMatchConf = matchCount > 0 ? (totalMatchConf / matchCount) : 0;

      let verdict = 'Manual Review Required';
      let reason = 'Council split or thresholds not met.';

      if (activeCount === 0) {
        verdict = 'Manual Review Required';
        reason = 'All models failed.';
      } else if (rule.reqUnanimity && rejectCount > 0) {
        verdict = 'Manual Review Required';
        reason = 'Category requires unanimity, but council disagreed.';
      } else if (matchCount >= requiredVotes && avgMatchConf >= rule.minConf) {
        verdict = 'AI Verified';
        reason = `Consensus reached (${matchCount}/${activeCount}) with ${(avgMatchConf*100).toFixed(0)}% avg confidence.`;
      } else if (matchCount >= requiredVotes && avgMatchConf < rule.minConf) {
        verdict = 'Manual Review Required';
        reason = `Votes reached (${matchCount}/${activeCount}), but confidence ${(avgMatchConf*100).toFixed(0)}% < target ${(rule.minConf*100).toFixed(0)}%.`;
      } else if (rejectCount >= requiredVotes) {
        verdict = 'AI Rejected';
        reason = 'Majority voted safe/reject.';
      }

      setResults({
        details: simResults,
        verdict,
        reason,
        activeCount,
        requiredVotes,
        avgMatchConf,
        targetConf: rule.minConf
      });

      setIsSimulatingCouncil(false);
    }, 800);
  };

  // --- STYLING HELPERS ---
  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '14px', backgroundColor: '#020617', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' };
  const thStyle = { textAlign: 'left', padding: '15px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderBottom: '1px solid #334155', fontWeight: 'bold' };
  const tdStyle = { padding: '15px', borderBottom: '1px solid #1e293b', color: '#cbd5e1', verticalAlign: 'top' };
  const preStyle = { backgroundColor: '#020617', padding: '20px', borderRadius: '8px', border: '1px solid #334155', overflowX: 'auto', color: '#38bdf8', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6', marginBottom: '30px', whiteSpace: 'pre-wrap' };
  const h2Style = { color: '#38bdf8', fontSize: '22px', borderBottom: '1px solid #334155', paddingBottom: '10px', marginTop: '40px', marginBottom: '20px', scrollMarginTop: '180px' };
  const h3Style = { color: '#f8fafc', fontSize: '18px', marginTop: '30px', marginBottom: '15px' };

  return (
    <div style={{ display: 'flex', gap: '40px', maxWidth: '1400px', margin: '0 auto', paddingTop: '160px', paddingBottom: '60px', paddingLeft: '20px', paddingRight: '20px', boxSizing: 'border-box' }}>
      
      <style>{`
        @media (max-width: 1000px) {
          .toc-sidebar { display: none !important; }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* --- STICKY TOC SIDEBAR --- */}
      <div className="toc-sidebar" style={{ width: '280px', flexShrink: 0 }}>
        <div style={{ position: 'sticky', top: '160px', backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: '25px', borderRadius: '16px', border: '1px solid #334155', backdropFilter: 'blur(10px)' }}>
          <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 20px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Table of Contents
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tocItems.map(item => (
              <li key={item.id}>
                <a 
                  href={`#${item.id}`} 
                  onClick={(e) => {
                    e.preventDefault(); 
                    const element = document.getElementById(item.id);
                    if (element) {
                      const yOffset = -120; // Accounts for fixed header
                      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                  style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', transition: 'all 0.2s', display: 'block', cursor: 'pointer' }} 
                  onMouseOver={e => { e.target.style.color = '#38bdf8'; e.target.style.transform = 'translateX(5px)'; }} 
                  onMouseOut={e => { e.target.style.color = '#94a3b8'; e.target.style.transform = 'translateX(0)'; }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div style={{ flex: 1, minWidth: 0, backgroundColor: '#0f172a', padding: '40px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', lineHeight: '1.7', color: '#f8fafc' }}>
        
        <h1 style={{ fontSize: '32px', color: '#fff', textAlign: 'center', marginBottom: '10px' }}>
          CiviWatch Guardian AI
        </h1>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '18px', marginBottom: '50px' }}>
          End-to-End Triage & Resolution Architecture
        </p>

        {/* --- 1. INTERACTIVE SIMULATIONS --- */}
        <h2 id="sec-simulations" style={{ ...h2Style, marginTop: '20px' }}>1. Interactive Demonstrations</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '30px' }}>
          To understand how CiviWatch achieves high availability and accuracy, interact with the two core AI pipelines below before reading the technical specifications.
        </p>

        {/* WATERFALL SIMULATOR */}
        <div style={{ backgroundColor: 'rgba(30,41,59,0.5)', padding: '20px', borderRadius: '12px', marginBottom: '40px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#10b981', margin: '0 0 10px 0', fontSize: '18px' }}>Simulation A: Tagging Auto-Fill Waterfall</h3>
          <p style={{ color: '#cbd5e1', margin: '0 0 20px 0', lineHeight: '1.6', fontSize: '14px' }}>
            When an Operator submits an image, we need data extracted instantly. Toggle individual API nodes on or off below to simulate network outages. Watch how the system sequentially cascades through the fallback models until it successfully extracts the data, or exhausts all options.
          </p>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {waterfallNodes.map((node, idx) => (
              <button 
                key={node.name}
                onClick={() => toggleNode(idx)}
                style={{ 
                  padding: '10px 16px', borderRadius: '8px', border: `1px solid ${node.online ? '#10b981' : '#ef4444'}`,
                  backgroundColor: node.online ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: node.online ? '#10b981' : '#ef4444', fontWeight: 'bold', cursor: 'pointer',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                {node.online ? '🟢' : '🔴'} {node.name}
              </button>
            ))}
          </div>

          <button 
            onClick={runWaterfall} disabled={isSimulatingWaterfall}
            style={{ padding: '12px 24px', backgroundColor: '#10b981', color: '#0f172a', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: isSimulatingWaterfall ? 'wait' : 'pointer', transition: 'all 0.2s' }}
          >
            {isSimulatingWaterfall ? 'Processing...' : 'Run Tagging Request'}
          </button>
          
          {waterfallResult && (
            <div style={{ marginTop: '20px', backgroundColor: '#020617', padding: '20px', borderRadius: '8px', border: '1px solid #334155', fontFamily: 'monospace' }}>
              <div style={{ color: '#94a3b8', marginBottom: '10px', fontSize: '12px' }}>TERMINAL OUTPUT:</div>
              {waterfallResult.map((log, idx) => (
                <div key={idx} style={{ marginBottom: '8px', fontSize: '14px', display: 'flex', gap: '10px', animation: 'fadeIn 0.3s ease' }}>
                  <span style={{ color: log.status === 'SUCCESS' ? '#10b981' : log.status === 'FAILURE' ? '#ef4444' : '#f59e0b', fontWeight: 'bold', width: '90px' }}>
                    [{log.status}]
                  </span>
                  <span style={{ color: '#cbd5e1', width: '220px' }}>{log.name}:</span>
                  <span style={{ color: log.status === 'FAILURE' ? '#ef4444' : '#94a3b8' }}>{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COUNCIL SIMULATOR */}
        <div style={{ backgroundColor: 'rgba(30,41,59,0.5)', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#a855f7', margin: '0 0 10px 0', fontSize: '18px' }}>Simulation B: High-Integrity Council Voting</h3>
          <p style={{ color: '#cbd5e1', margin: '0 0 20px 0', lineHeight: '1.6', fontSize: '14px' }}>
            {isEn ? 'When automatically verifying severe threats, we query 5 external APIs simultaneously. If models time out, the math dynamically adjusts based ONLY on the surviving models. Use the slider below to force random API failures and observe how the consensus adapts.' : 'מכיוון שאנו מתשאלים 5 ממשקי API חיצוניים במקביל, עלינו להיערך לקריסות. אם מודלים נכשלים, המתמטיקה מתאימה את עצמה דינמית על בסיס המודלים ששרדו בלבד.'}
          </p>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap', backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8', fontWeight: 'bold' }}>Threat Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '8px', outline: 'none' }}>
                {Object.keys(categories).map(cat => <option key={cat} value={cat}>{cat} (Min Conf: {categories[cat].minConf*100}%)</option>)}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#94a3b8', fontWeight: 'bold' }}>
                <span>API Failure Rate</span>
                <span style={{ color: failureRate > 50 ? '#ef4444' : '#38bdf8' }}>{failureRate}% ({failureRate/20} models offline)</span>
              </label>
              <input 
                type="range" min="0" max="80" step="20" 
                value={failureRate} onChange={(e) => setFailureRate(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                onClick={runSimulation} disabled={isSimulatingCouncil}
                style={{ padding: '10px 24px', backgroundColor: '#38bdf8', color: '#0f172a', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: isSimulatingCouncil ? 'wait' : 'pointer', height: '42px', transition: 'background-color 0.2s' }}
                onMouseOver={(e) => !isSimulatingCouncil && (e.currentTarget.style.backgroundColor = '#7dd3fc')}
                onMouseOut={(e) => !isSimulatingCouncil && (e.currentTarget.style.backgroundColor = '#38bdf8')}
              >
                {isSimulatingCouncil ? 'Simulating...' : 'Run Consensus Vote'}
              </button>
            </div>
          </div>

          {results && (
            <div style={{ backgroundColor: '#020617', padding: '30px', borderRadius: '12px', border: '1px solid #334155', animation: 'fadeIn 0.5s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: '0 0 5px 0', fontSize: '28px', color: results.verdict === 'AI Verified' ? '#10b981' : results.verdict === 'AI Rejected' ? '#ef4444' : '#f59e0b' }}>
                    {results.verdict}
                  </h2>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>{results.reason}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Target Threshold</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>{(results.targetConf * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                {results.details.map((node, idx) => (
                  <div key={idx} style={{ 
                    backgroundColor: node.status === 'TIMEOUT' ? '#1e293b' : (node.vote === 'Match' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'),
                    border: `1px solid ${node.status === 'TIMEOUT' ? '#334155' : (node.vote === 'Match' ? '#10b981' : '#ef4444')}`,
                    padding: '15px', borderRadius: '8px', textAlign: 'center',
                    opacity: node.status === 'TIMEOUT' ? 0.5 : 1
                  }}>
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#f8fafc' }}>{node.name}</h5>
                    {node.status === 'TIMEOUT' ? (
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold' }}>TIMEOUT</span>
                    ) : (
                      <>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: node.vote === 'Match' ? '#10b981' : '#ef4444' }}>{node.vote}</div>
                        <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '5px' }}>Conf: {(node.conf * 100).toFixed(0)}%</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


        {/* --- 2. SYSTEM FLOWCHART --- */}
        <h2 id="sec-flowchart" style={h2Style}>2. Complete System Flowchart</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>The interactive pipeline diagram below maps the complete lifecycle of a report from initial Operator submission through AI Triaging, Moderator Review, and external Network Escalation.</p>
        
        <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '8px', height: '650px', width: '100%', overflow: 'hidden', marginBottom: '30px' }}>
          <iframe 
            src="https://mermaid.ai/d/c1d7a116-8cf7-4591-bf55-405008b51d07" 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            title="Interactive CiviWatch Flow"
          />
        </div>


        {/* --- 3. DUAL-ENGINE ARCHITECTURE --- */}
        <h2 id="sec-dual-engine" style={h2Style}>3. Dual-Engine Architecture</h2>
        <p style={{ color: '#cbd5e1' }}>
          The CiviWatch Guardian AI system leverages multiple free-tier Large Language Models (LLMs) with Vision capabilities to achieve high availability and zero operational cost. Because the system utilizes external endpoints, it must account for API rate limits, latency, and potential downtime. To solve this, two distinct flows were engineered based on the context of the user's action.
        </p>

        <h3 style={h3Style}>A. The Auto-Fill Waterfall (Speed & UI)</h3>
        <p style={{ color: '#cbd5e1' }}>
          When an operator pastes an image into the New Report tab, the goal is to extract text, identify platforms, and generate tags as quickly as possible. The operator relies on this data to submit the report; therefore, waiting for multiple models to reach a consensus would introduce unacceptable friction. The solution is a Sequential Waterfall. The system queries the fastest available provider. If that provider fails (due to rate limits or downtime), it instantly catches the error and queries the next provider in the chain.
        </p>

        <h3 style={h3Style}>B. High-Integrity AI Council (Accuracy & Consensus)</h3>
        <p style={{ color: '#cbd5e1' }}>
          When verifying the tags of a submitted report, relying on a single AI provider introduces unacceptable risk (hallucinations, bias, or false positives). The Parallel Voting Council queries all active providers simultaneously. It requires strict unanimity and specific confidence thresholds to take automated action. If an API is offline, the system dynamically calculates the consensus based ONLY on the engines that successfully returned a vote.
        </p>

        <h3 style={h3Style}>Dynamic Confidence Thresholds by Category</h3>
        <p style={{ color: '#cbd5e1' }}>
          Not all abuse types require the same level of scrutiny. The Council utilizes dynamic confidence thresholds, unanimity requirements, and voting ratios based on the severity of the tag. <strong>Default / Other</strong> acts as a universal catch-all: if a new tag is introduced without explicit rules mapped to it, the system gracefully falls back to a standard 70% confidence majority rule to ensure continuous operation without breaking the pipeline.
        </p>
        
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Min Conf.</th>
              <th style={thStyle}>Unanimity</th>
              <th style={thStyle}>Rationale</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={{...tdStyle, color: '#ef4444', fontWeight: 'bold'}}>Terrorism</td><td style={tdStyle}>95%</td><td style={tdStyle}>Yes</td><td style={tdStyle}>Extreme real-world implications; requires near-absolute certainty and 60% active node agreement.</td></tr>
            <tr><td style={{...tdStyle, color: '#ef4444', fontWeight: 'bold'}}>Incitement</td><td style={tdStyle}>90%</td><td style={tdStyle}>Yes</td><td style={tdStyle}>High severity; strict consensus needed to avoid suppressing valid political speech.</td></tr>
            <tr><td style={{...tdStyle, color: '#f59e0b', fontWeight: 'bold'}}>Antisemitism</td><td style={tdStyle}>80%</td><td style={tdStyle}>No</td><td style={tdStyle}>Often relies on dog-whistles. Allows majority rule (50%) to catch nuanced hate speech.</td></tr>
            <tr><td style={{...tdStyle, color: '#10b981', fontWeight: 'bold'}}>Disinformation</td><td style={tdStyle}>75%</td><td style={tdStyle}>No</td><td style={tdStyle}>Context-heavy; simple majority consensus (50%) is sufficient for verification.</td></tr>
            <tr><td style={{...tdStyle, color: '#94a3b8', fontWeight: 'bold'}}>Default / Other</td><td style={tdStyle}>70%</td><td style={tdStyle}>No</td><td style={tdStyle}>Universal catch-all. If an unknown tag is used, falls back to a 70% majority rule so the system never breaks.</td></tr>
          </tbody>
        </table>

        <table style={{...tableStyle, marginTop: '20px'}}>
          <thead>
            <tr>
              <th style={thStyle}>Feature</th>
              <th style={thStyle}>Auto-Fill Waterfall</th>
              <th style={thStyle}>Voting Council</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={{...tdStyle, color: '#fff', fontWeight: 'bold'}}>Execution Strategy</td><td style={tdStyle}>Sequential (One after another)</td><td style={tdStyle}>Parallel (All at once)</td></tr>
            <tr><td style={{...tdStyle, color: '#fff', fontWeight: 'bold'}}>Termination Condition</td><td style={tdStyle}>Stops at first successful response</td><td style={tdStyle}>Waits for all responses or timeouts</td></tr>
            <tr><td style={{...tdStyle, color: '#fff', fontWeight: 'bold'}}>Primary Goal</td><td style={tdStyle}>Minimize UI wait time</td><td style={tdStyle}>Maximize moderation accuracy</td></tr>
            <tr><td style={{...tdStyle, color: '#fff', fontWeight: 'bold'}}>Failure Tolerance</td><td style={tdStyle}>High (4 backups available)</td><td style={tdStyle}>High (Calculates via remaining active nodes)</td></tr>
          </tbody>
        </table>


        {/* --- 4. PHASE-BY-PHASE WORKFLOW --- */}
        <h2 id="sec-workflow" style={h2Style}>4. Phase-by-Phase Workflow Logic</h2>
        
        <h3 style={h3Style}>Phase 1: Ingestion, Edge Cases & Pre-Processing</h3>
        <p style={{ color: '#cbd5e1' }}>Before any report enters the triage queue, it must clear the initial structural and priority gates.</p>
        <ul style={{ color: '#cbd5e1' }}>
          <li><strong style={{ color: '#fff' }}>Deduplication Filter:</strong> The system scans the database against the provided source_url. If an active match is found, the new submission is intercepted. It is marked as Merged / Duplicate.</li>
          <li><strong style={{ color: '#fff' }}>Immediate Threat (Urgent Bypass):</strong> If an Operator identifies a direct physical threat, the report is flagged as Urgent. This explicitly bypasses AI processing and standard queues.</li>
        </ul>

        <h3 style={h3Style}>Phase 2: Triage & The AI Council</h3>
        <ul style={{ color: '#cbd5e1' }}>
          <li><strong style={{ color: '#fff' }}>Human Routing:</strong> Status changes directly to Pending Review for Moderator assessment.</li>
          <li><strong style={{ color: '#fff' }}>AI Routing:</strong> Status changes to Processing. If the multi-model AI Council returns a "Split Vote" (disagreement), the report falls back to Pending Review for a human tie-breaker. If Unanimous, it passes to QA.</li>
        </ul>

        <h3 style={h3Style}>Phase 3: The Moderator Loop</h3>
        <p style={{ color: '#cbd5e1' }}>Moderators possess three distinct resolution paths when handling a report in Pending Review:</p>
        <ul style={{ color: '#cbd5e1' }}>
          <li><strong style={{ color: '#fff' }}>Approve & Escalate:</strong> The report is valid and pushed forward to Escalated.</li>
          <li><strong style={{ color: '#fff' }}>Reject & Close:</strong> The content does not violate policy. The ticket is marked Closed (Internal Reject).</li>
          <li><strong style={{ color: '#fff' }}>Ask for Fix (Needs Revision):</strong> The core report is valid, but the execution is flawed. The Moderator returns it to the Operator.</li>
        </ul>

        <h3 style={h3Style}>Phase 4: Network Escalation & Appeals</h3>
        <p style={{ color: '#cbd5e1' }}>Once a report reaches Escalated, the payload is transmitted to the respective Social Network. The system monitors for the network's final decision.</p>
        <ul style={{ color: '#cbd5e1' }}>
          <li><strong style={{ color: '#fff' }}>Accepted:</strong> Status shifts to Resolved (Removed).</li>
          <li><strong style={{ color: '#fff' }}>Rejected:</strong> The system prompts the Admin to file an appeal. If appealed, the status becomes Appealed.</li>
        </ul>


        {/* --- 5. TAXONOMY --- */}
        <h2 id="sec-taxonomy" style={h2Style}>5. Core Status Taxonomy</h2>
        <p style={{ color: '#cbd5e1' }}>The system utilizes strict state management. Every report must exist in one of the following actionable states:</p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Status State</th>
              <th style={thStyle}>Definition & Required Action</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={{...tdStyle, fontWeight: 'bold', color: '#fff'}}>New</td><td style={tdStyle}>Initial ingestion; pending pre-processing (deduplication/urgency checks).</td></tr>
            <tr><td style={{...tdStyle, fontWeight: 'bold', color: '#38bdf8'}}>Processing</td><td style={tdStyle}>Actively being evaluated by the AI Council.</td></tr>
            <tr><td style={{...tdStyle, fontWeight: 'bold', color: '#f59e0b'}}>Pending Review</td><td style={tdStyle}>Sitting in the Moderator's queue awaiting manual human triage.</td></tr>
            <tr><td style={{...tdStyle, fontWeight: 'bold', color: '#ef4444'}}>Needs Revision</td><td style={tdStyle}>Bounced back to the Operator's active queue for required corrections.</td></tr>
            <tr><td style={{...tdStyle, fontWeight: 'bold', color: '#10b981'}}>Escalated</td><td style={tdStyle}>Submitted to the external Social Network; awaiting response.</td></tr>
            <tr><td style={{...tdStyle, fontWeight: 'bold', color: '#ef4444'}}>Escalated - Critical</td><td style={tdStyle}>Urgent physical threat bypassing all standard queues.</td></tr>
            <tr><td style={{...tdStyle, fontWeight: 'bold', color: '#8b5cf6'}}>Appealed</td><td style={tdStyle}>Network rejected the initial claim; CiviWatch filed an appeal.</td></tr>
          </tbody>
        </table>


        {/* --- 6. HITL & RESOLUTION --- */}
        <h2 id="sec-hitl" style={h2Style}>6. Human-in-the-Loop & Resolution</h2>
        
        <h3 style={h3Style}>Operator Feedback Loops & QA</h3>
        <p style={{ color: '#cbd5e1' }}>While the system leverages AI to accelerate processing, humans remain the final arbiters. Moderators return flawed reports to Operators with specific requests for revision to improve future quality. Furthermore, even when the AI Council votes unanimously to approve a report, a randomized percentage is actively routed back to human Moderators for a manual quality assurance check to prevent algorithmic drift.</p>

        <h3 style={h3Style}>The Stakeholder Waterfall</h3>
        <p style={{ color: '#cbd5e1' }}>When a report ultimately fails (Resolved - Network Rejected), the failure must be analyzed to prevent repetition. The ticket is flagged to the Global Admin, who decides if the network's rejection criteria represents a new policy shift. If so, they push the notification down to the Moderator, who subsequently shares the learning with the initiating Operator.</p>
        
        <h3 style={h3Style}>90-Day Archive (GDPR / Privacy Compliance)</h3>
        <p style={{ color: '#cbd5e1' }}>To protect personal data and maintain a clean database, all "End State" reports are subject to a strict data retention policy. A background cron job identifies any resolved ticket older than 90 days. All associated media, screenshots, and Personally Identifiable Information (PII) are permanently purged. Only sanitized metadata is retained for long-term analytics.</p>

      </div>
    </div>
  );
};

export default CouncilSimulatorDoc;