/**
 * @file AIAuditPanel.js
 * @description The AI Transparency & Reasoning Matrix.
 * This component fetches and displays the underlying logic, confidence scores, 
 * and individual engine votes (e.g., OpenAI, Anthropic, Gemini) for a specific report.
 * It is crucial for "Human-in-the-Loop" validation and algorithmic auditing.
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

// --- UNIVERSAL SVG ICON MAPPING ---
const SVGIcons = {
  Bot: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>,
  Alert: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  Server: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>,
  Activity: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
};

const AIAuditPanel = ({ report }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetches the detailed voting history for this specific report.
   * This pulls from the `voting_logs` table, isolating individual LLM responses.
   */
  useEffect(() => {
    const fetchVotingLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('voting_logs')
          .select('*')
          .eq('report_id', report.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setLogs(data || []);
      } catch (err) {
        console.error("Error fetching AI logs:", err.message);
      } finally {
        setLoading(false);
      }
    };

    if (report?.id) {
      fetchVotingLogs();
    }
  }, [report.id]);

  // Separate the system-level meta-notes (Consensus) from the raw text body
  // to maintain the hierarchical design of the audit matrix.
  const systemNotes = report.ai_reasoning 
    ? report.ai_reasoning.split('\n').filter(line => line.startsWith('[SYSTEM')) 
    : [];

  const hasFailures = report.routing_metadata?.failures > 0;

  return (
    <div style={{ 
      backgroundColor: '#0f172a', 
      border: '1px solid #334155', 
      borderRadius: '8px', 
      padding: '20px', 
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#e2e8f0',
      marginTop: '10px',
      boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
    }}>
      
      {/* MATRIX HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#a855f7', marginBottom: '15px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
          {SVGIcons.Bot} CiviWatch AI Routing Matrix
        </span>
        <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
          Overall Confidence: <strong style={{ color: '#38bdf8' }}>{report.ai_confidence ? (report.ai_confidence * 100).toFixed(0) : 0}%</strong>
        </span>
      </div>

      {loading ? (
        <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', border: '2px solid rgba(56,189,248,0.3)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 1s linear infinite' }}><style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style></div>
          Loading AI engine logs...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* 1. SYSTEM DECISIONS (Consensus & Routing Overrides) */}
          {systemNotes.length > 0 && (
            <div style={{ color: '#10b981', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {systemNotes.map((note, index) => {
                const isOverall = note.includes('[SYSTEM OVERRIDE]') || note.includes('[SYSTEM OVERALL]');
                return (
                  <span key={`sys-${index}`} style={{ display: 'flex', gap: '8px', color: isOverall ? '#d946ef' : '#2dd4bf', fontWeight: isOverall ? 'bold' : 'normal' }}>
                    <span style={{ marginTop: '2px' }}>{SVGIcons.Activity}</span>
                    <span>{note}</span>
                  </span>
                );
              })}
            </div>
          )}

          {/* 2. RAW VOTING DETAILS (Individual Engine Outputs) */}
          {logs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              {logs.map((log) => (
                <div key={log.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', paddingLeft: '10px' }}>
                  <span style={{ color: '#94a3b8', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                    {SVGIcons.Server} [{log.engine_name}]
                  </span>
                  <span style={{ color: '#cbd5e1', lineHeight: '1.4' }}>
                    {log.raw_vote?.reasoning || "No detailed reasoning provided by engine."}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 3. SURVIVOR MODE ALERT (Hardware/API Failures) */}
          {hasFailures && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontStyle: 'italic', marginTop: '10px', borderTop: '1px dashed #334155', paddingTop: '10px', backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: '10px', borderRadius: '6px' }}>
              {SVGIcons.Alert}
              <span>
                *(System Alert: {report.routing_metadata.failures} provider(s) failed during analysis. Decision synthesized based on surviving nodes).*
              </span>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default AIAuditPanel;