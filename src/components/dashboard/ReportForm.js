/**
 * @file ReportForm.js
 * @description The Primary Intelligence Ingestion Engine.
 * This is a highly complex, AI-assisted form used by Operators to manually ingest threats 
 * into the CiviWatch system. It features a multi-phase asynchronous workflow designed to 
 * minimize manual data entry and filter out benign content before it reaches the database.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

// Universal SVG Icon Mapping
const SVGIcons = {
  Trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Camera: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>,
  Bot: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>,
  User: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  Alert: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  CheckCircle: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
  X: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Sparkles: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path></svg>
};

// --- INLINE AI PROXY CALLER (Replaces aiVotingService.js for form UI) ---
const callLightweightAI = async (prompt, base64Image) => {
  try {
    const { data: providers } = await supabase.from('ai_providers').select('*').eq('is_active', true).order('priority', { ascending: true }).limit(1);
    const provider = providers && providers.length > 0 ? providers[0] : { provider_type: 'github', current_model: 'gpt-4o' };
    
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: { provider: provider.provider_type.toLowerCase(), prompt, base64Image, model: provider.current_model }
    });
    
    if (error) throw error;
    const text = data?.response || data;
    const match = text?.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : JSON.parse(text);
  } catch (err) {
    console.error("UI AI Call Failed:", err);
    throw err;
  }
};

const ReportForm = ({ userProfile, isEn, triggerToast }) => {
  const [routing, setRouting] = useState(''); 
  const [routingError, setRoutingError] = useState(false);
  const [platform, setPlatform] = useState('');
  const [platformError, setPlatformError] = useState(false);
  const [link, setLink] = useState('');
  const [language, setLanguage] = useState(isEn ? 'en' : 'he');
  const [isUrgent, setIsUrgent] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [context, setContext] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  const [scanningStatus, setScanningStatus] = useState('');
  const isAnalyzing = scanningStatus !== '';

  const [showScopeWarning, setShowScopeWarning] = useState(false);
  const [scopeWarningReason, setScopeWarningReason] = useState('');
  const [bypassScopeWarning, setBypassScopeWarning] = useState(false);

  const fileInputRef = useRef(null);

  const handleResetForm = () => {
    setRouting('');
    setRoutingError(false);
    setPlatform('');
    setPlatformError(false);
    setLink('');
    setLanguage(isEn ? 'en' : 'he');
    setIsUrgent(false);
    setTags([]);
    setTagInput('');
    setContext('');
    setImagePreview(null);
    setImageFile(null);
    setImageError(false);
    setShowScopeWarning(false);
    setScopeWarningReason('');
    setBypassScopeWarning(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    if (triggerToast) triggerToast(isEn ? 'Form cleared.' : 'הטופס נוקה.', 'success');
  };

  const analyzeImageWithAI = useCallback(async (base64String) => {
    setScanningStatus(isEn ? 'Initializing AI Scan...' : 'מאתחל סריקת AI...');
    try {
      const prompt = `
        Analyze this screenshot of digital content. Return a valid JSON object:
        - "platform": One of: "x", "facebook", "instagram", "tiktok", "telegram", "youtube", "linkedin", "reddit", "discord", "truth social", "vk", or "other".
        - "link": Full URL if visible in the browser address bar, else "".
        - "language": One of: "he", "en", "ar", "ru", or "other".
        - "tags": Array of 1-3 string tags: Antisemitism, Hate Speech, Harassment, Terrorism, Violence / Cruelty, Pornography, Nudity, Fake News, Troll, or Other.
        - "context": A short 1-sentence summary.
        - "routing": Choose "ai" if it's a clear violation, or "human" if ambiguous.
      `;
      
      const aiData = await callLightweightAI(prompt, base64String);

      if (aiData.platform) { setPlatform(aiData.platform); setPlatformError(false); }
      if (aiData.link) setLink(aiData.link);
      if (aiData.language) setLanguage(aiData.language);
      if (aiData.tags) setTags(aiData.tags);
      if (aiData.context) setContext(aiData.context);
      if (aiData.routing) { setRouting(aiData.routing); setRoutingError(false); }

      if (triggerToast) triggerToast(isEn ? `Scanned successfully.` : `נסרק בהצלחה.`, 'success');
    } catch (error) {
      if (triggerToast) triggerToast(isEn ? `Auto-fill unavailable.` : `השלמה אוטומטית לא זמינה.`, 'error');
    } finally {
      setScanningStatus('');
    }
  }, [isEn, triggerToast]);

  const processFile = useCallback((file) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file); 
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        setImagePreview(base64String);
        setImageError(false);
        analyzeImageWithAI(base64String);
      };
      reader.readAsDataURL(file);
    }
  }, [analyzeImageWithAI]);

  const handleFileChange = (e) => processFile(e.target.files[0]);
  
  const handleDrop = (e) => { 
    e.preventDefault(); 
    processFile(e.dataTransfer.files[0]); 
  };
  
  const removeImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImagePreview(null);
    setImageFile(null); 
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowScopeWarning(false);
    setBypassScopeWarning(false);
  };

  useEffect(() => {
    const handlePaste = (e) => {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (let index in items) {
        const item = items[index];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          processFile(item.getAsFile());
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFile]);

  const addTag = (tagToAdd) => {
    const cleanTag = tagToAdd.trim().replace(/^#/, '');
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleFormKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault(); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userProfile?.id || !userProfile?.organization_id) {
      if (triggerToast) triggerToast(isEn ? "Authentication Error: Missing User or Organization ID." : "שגיאת הזדהות: חסר מזהה משתמש או ארגון.", 'error');
      return;
    }

    let isValid = true;
    if (!routing) { setRoutingError(true); isValid = false; }
    if (!imagePreview || !imageFile) { setImageError(true); isValid = false; }
    if (!platform) { setPlatformError(true); isValid = false; }

    if (!isValid) return;

    if (!isUrgent && !bypassScopeWarning) {
      setIsSubmitting(true);
      setUploadStatus(isEn ? 'Verifying Mission Scope...' : 'מוודא התאמה למשימה...');
      try {
        const prompt = `
          You are a rapid pre-ingestion security scanner. CiviWatch ONLY tracks threats like: Hate Speech, Antisemitism, Terrorism, Harassment, Violence, Cruelty, Pornography, Nudity, Fake News, and Trolls.
          Context provided: "${context}"
          Tags provided: "${tags.join(', ')}"
          Analyze this image. Is it related to these threats? Return JSON: { "is_in_scope": boolean, "reasoning": "1 sentence" }
        `;
        const scopeCheck = await callLightweightAI(prompt, imagePreview);
        
        if (scopeCheck && !scopeCheck.is_in_scope) {
          setScopeWarningReason(scopeCheck.reasoning);
          setShowScopeWarning(true);
          setIsSubmitting(false);
          setUploadStatus('');
          return; 
        }
      } catch (err) {
        console.warn("Scope Gatekeeper failed, bypassing.", err);
      }
    }

    setIsSubmitting(true);
    setShowScopeWarning(false);
    
    try {
      setUploadStatus(isEn ? 'Uploading evidence...' : 'מעלה ראיות...');
      let imageUrl = null;
      
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${userProfile.organization_id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('evidence')
        .upload(fileName, imageFile, { cacheControl: '3600', upsert: false });

      if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

      const { data: publicUrlData } = supabase.storage.from('evidence').getPublicUrl(fileName);
      imageUrl = publicUrlData.publicUrl;
      
      setUploadStatus(isEn ? 'Creating ticket...' : 'יוצר כרטיס...');

      // Changed back to 'Pending' to satisfy DB Check Constraint
      let initialStatus = 'Pending';
      if (isUrgent || routing === 'human') {
        initialStatus = 'Pending Review'; 
      }

      const submitterName = userProfile?.display_name || userProfile?.email?.split('@')[0] || 'System Operator';
      const bypassWarningString = bypassScopeWarning ? (isEn ? ' [SYSTEM: Operator bypassed AI out-of-scope warning]' : ' [מערכת: המפעיל עקף את אזהרת החריגה של ה-AI]') : '';

      const initialNote = {
        timestamp: new Date().toISOString(),
        actor: submitterName, 
        action: isEn ? 'Report Submitted' : 'דיווח הוגש',
        note: (isEn ? `Initial Routing: ${routing.toUpperCase()}. Language: ${language}. Tags: ${tags.join(', ')}` : `ניתוב התחלתי: ${routing.toUpperCase()}. שפה: ${language}. תגיות: ${tags.join(', ')}`) + bypassWarningString
      };

      const initialRoutingMetadata = {
        overall_status: initialStatus === 'Pending' && routing === 'ai' ? 'Pending Server AI Analysis...' : initialStatus,
        validated_tags: [],
        rejected_tags: [],
        provider_results: [],
        tag_consensus: tags.map(tag => ({ tag, ratio: "0/0", status: "Pending" })),
        failures: 0,
        survivor_mode: false,
        routing_note: bypassScopeWarning ? (isEn ? "ROUTING OVERRIDE: Operator bypassed AI Gatekeeper" : "מעקף מערכת: המפעיל עקף אזהרת AI") : ""
      };

      const payload = {
        content: context || (isEn ? `Flagged content on ${platform}` : `תוכן פוגעני מ-${platform}`),
        source_url: link,
        platform: platform,
        language: language,
        tags: tags,
        routing: routing,
        status: initialStatus,
        ai_vote_status: 'Pending', 
        priority_tag: isUrgent,
        image_url: imageUrl,
        submission_source: 'dashboard',
        additional_info: [initialNote],
        submitted_by: userProfile.id,
        organization_id: userProfile.organization_id,
        routing_metadata: initialRoutingMetadata 
      };

      const { error: insertError } = await supabase.from('reports').insert([payload]);

      if (insertError) throw insertError;

      if (routing === 'ai') {
        if (triggerToast) triggerToast(isEn ? `Success. AI is analyzing in the background.` : `הצלחה. מועצת ה-AI מנתחת ברקע.`, 'success');
      } else {
        if (triggerToast) triggerToast(isEn ? `Report submitted to Human Review.` : `הדיווח נשלח לבדיקת מנהל.`, 'success');
      }
      
      handleResetForm();
      
    } catch (error) {
      console.error("Submission Error:", error);
      if (triggerToast) triggerToast(isEn ? `Failed to submit: ${error.message}` : `שגיאה בשליחה: ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
      setUploadStatus('');
    }
  };

  const inputBaseStyle = {
    width: '100%', padding: '12px 16px', backgroundColor: '#0f172a',
    border: '1px solid #334155', borderRadius: '12px', color: '#ffffff',
    fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.3s',
  };

  const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' };

  const predefinedTags = isEn 
    ? ['Antisemitism', 'Hate Speech', 'Harassment', 'Terrorism', 'Violence / Cruelty', 'Pornography', 'Nudity', 'Fake News', 'Troll', 'Other']
    : ['אנטישמיות', 'שנאה', 'הטרדה', 'טרור', 'אלימות ואכזריות', 'פורנוגרפיה', 'עירום', 'פייק_ניוז', 'טרול', 'אחר'];

  const isSubmitDisabled = isAnalyzing || isSubmitting;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'relative' }}>
      {showScopeWarning && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, backgroundColor: 'rgba(2, 6, 23, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '24px', padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #ef4444', borderRadius: '16px', padding: '30px', maxWidth: '500px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ color: '#ef4444', marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
              {SVGIcons.Alert}
            </div>
            <h3 style={{ color: '#ffffff', fontSize: '1.5rem', margin: '0 0 15px 0' }}>{isEn ? 'Wait, is this relevant?' : 'רגע, האם התוכן רלוונטי?'}</h3>
            <p style={{ color: '#cbd5e1', lineHeight: '1.6', marginBottom: '20px' }}>
              {isEn 
                ? 'The AI scanned this image and flagged it as BENIGN. Submitting irrelevant content clogs the moderation queue.' 
                : 'מערכת ה-AI סרקה את התמונה וזיהתה אותה כתוכן תקין לחלוטין. שליחת תוכן לא רלוונטי גורמת לעומס.'}
            </p>
            {scopeWarningReason && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #ef4444', padding: '10px', color: '#f87171', fontSize: '0.85rem', textAlign: 'left', direction: 'ltr', marginBottom: '25px', fontFamily: 'monospace' }}>
                {scopeWarningReason}
              </div>
            )}
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button type="button" onClick={() => setShowScopeWarning(false)} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                {isEn ? 'Cancel Submission' : 'בטל שליחה'}
              </button>
              <button type="button" onClick={(e) => { setBypassScopeWarning(true); handleSubmit(e); }} style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                {isEn ? 'Submit Anyway' : 'שלח בכל זאת'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '672px', width: '100%', backgroundColor: 'rgba(22, 27, 34, 0.85)', border: '1px solid #30363d', borderRadius: '24px', padding: window.innerWidth < 600 ? '24px' : '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', position: 'relative' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginTop: 0 }}>
              {isEn ? 'Submit Internal Report' : 'הזנת דיווח פנימי'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0, lineHeight: '1.6' }}>
              {isEn 
                ? 'Submit new flagged content into your organization\'s triage queue. AI will assist in categorizing the data.' 
                : 'הזן תוכן פוגעני חדש לתור הטיפול של הארגון לבדיקת המערכת. ה-AI יסייע בסיווג התוכן.'}
            </p>
          </div>
          
          <button 
            type="button" 
            onClick={handleResetForm}
            title={isEn ? "Clear Form" : "נקה טופס"}
            style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', transition: 'all 0.2s', flexShrink: 0 }}
            onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'; e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)'; }}
          >
            {SVGIcons.Trash} <span style={{ display: window.innerWidth < 600 ? 'none' : 'inline' }}>{isEn ? 'Reset' : 'נקה'}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div>
            <label style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isEn ? 'Evidence / Screenshot (Required)' : 'צילום מסך או ראיות (חובה)'}
                {isAnalyzing && <span style={{ fontSize: '0.75rem', color: '#38bdf8', animation: 'pulse 1.5s infinite', display: 'flex', alignItems: 'center', gap: '4px' }}>{SVGIcons.Sparkles} {scanningStatus}</span>}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#60a5fa', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>Ctrl+V</span>
            </label>
            
            <div 
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#3b82f6'; }}
              onDragLeave={(e) => { e.currentTarget.style.borderColor = imageError ? '#ef4444' : '#475569'; }}
              onDrop={handleDrop}
              style={{ border: imageError ? '2px dashed #ef4444' : (isAnalyzing ? '2px solid #38bdf8' : '2px dashed #475569'), backgroundColor: '#0f172a', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', cursor: 'pointer', position: 'relative', height: '192px', boxSizing: 'border-box', transition: 'all 0.3s' }}
            >
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 20 }} />
              
              {!imagePreview ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                  <div style={{ marginBottom: '12px' }}>{SVGIcons.Camera}</div>
                  <span style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: '500' }}>
                    {isEn ? 'Click, drag, or paste image here' : 'לחץ, גרור תמונה, או הדבק לכאן'}
                  </span>
                </div>
              ) : (
                <div style={{ position: 'absolute', inset: 0, zIndex: 30, backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', overflow: 'hidden', opacity: isAnalyzing ? 0.5 : 1 }}>
                  <img src={imagePreview} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', padding: '8px', boxSizing: 'border-box' }} />
                  {!isAnalyzing && !isSubmitting && (
                    <button type="button" onClick={removeImage} style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(30, 41, 59, 0.9)', color: '#ffffff', fontSize: '0.75rem', padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', zIndex: 40 }}>
                      {isEn ? 'Remove' : 'הסר תמונה'}
                    </button>
                  )}
                </div>
              )}
              {isAnalyzing && (
                <div style={{ position: 'absolute', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '30px', height: '30px', border: '3px solid rgba(56, 189, 248, 0.3)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}
            </div>
            {imageError && <p style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '8px', marginBottom: 0 }}>{isEn ? 'Screenshot is required.' : 'חובה לצרף צילום מסך או הוכחה ויזואלית.'}</p>}
          </div>

          <div style={{ padding: '4px', borderRadius: '16px', border: routingError ? '1px solid #ef4444' : '1px solid transparent', backgroundColor: routingError ? 'rgba(239, 68, 68, 0.1)' : 'transparent', transition: 'all 0.3s' }}>
            <label style={labelStyle}>{isEn ? 'Report Routing (Required)' : 'ניתוב הדיווח (חובה)'}</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div onClick={() => { setRouting('ai'); setRoutingError(false); }} style={{ border: routing === 'ai' ? '1px solid #3b82f6' : '1px solid #334155', backgroundColor: routing === 'ai' ? 'rgba(59, 130, 246, 0.1)' : '#1e293b', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s', height: '100%', boxSizing: 'border-box', opacity: isUrgent ? 0.5 : 1 }}>
                <div style={{ color: '#3b82f6', marginBottom: '8px' }}>{SVGIcons.Bot}</div>
                <h3 style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>{isEn ? 'Automatic AI Analysis' : 'ניתוח AI אוטומטי'}</h3>
              </div>
              <div onClick={() => { setRouting('human'); setRoutingError(false); }} style={{ border: routing === 'human' ? '1px solid #3b82f6' : '1px solid #334155', backgroundColor: routing === 'human' ? 'rgba(59, 130, 246, 0.1)' : '#1e293b', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s', height: '100%', boxSizing: 'border-box', opacity: isUrgent ? 0.5 : 1 }}>
                <div style={{ color: '#3b82f6', marginBottom: '8px' }}>{SVGIcons.User}</div>
                <h3 style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>{isEn ? 'Human Manager Review' : 'בדיקת מנהל קהילה'}</h3>
              </div>
            </div>
            {routingError && <p style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '8px', marginBottom: 0 }}>{isEn ? 'Please select a routing option.' : 'חובה לבחור את יעד הדיווח (AI או מנהל קהילה).'}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? '1fr 2fr 1fr' : '1fr', gap: '20px' }}>
            
            <div style={{ padding: '2px', borderRadius: '14px', border: platformError ? '1px solid #ef4444' : '1px solid transparent', backgroundColor: platformError ? 'rgba(239, 68, 68, 0.1)' : 'transparent', transition: 'all 0.3s' }}>
              <label style={labelStyle}>{isEn ? 'Platform (Required)' : 'פלטפורמה (חובה)'}</label>
              <select 
                value={platform} 
                onChange={(e) => { setPlatform(e.target.value); setPlatformError(false); }} 
                style={{ ...inputBaseStyle, border: platformError ? '1px solid #ef4444' : '1px solid #334155' }}
              >
                <option value="" disabled>{isEn ? 'Select Platform' : 'בחר פלטפורמה'}</option>
                <option value="x">X (Twitter)</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="telegram">Telegram</option>
                <option value="youtube">YouTube</option>
                <option value="linkedin">LinkedIn</option>
                <option value="reddit">Discord</option>
                <option value="truth social">Truth Social</option>
                <option value="vk">VK</option>
                <option value="other">Other</option>
              </select>
              {platformError && <p style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '4px', marginBottom: 0 }}>{isEn ? 'Platform selection is required.' : 'חובה לבחור פלטפורמה.'}</p>}
            </div>

            <div>
              <label style={labelStyle}>{isEn ? 'URL' : 'קישור'}</label>
              <input 
                type="url" 
                placeholder="https://..." 
                value={link} 
                onChange={(e) => setLink(e.target.value)} 
                style={{...inputBaseStyle, direction: 'ltr', textAlign: 'left', border: '1px solid #334155'}} 
              />
            </div>

            <div>
              <label style={labelStyle}>{isEn ? 'Language' : 'שפת התוכן'}</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} style={inputBaseStyle}>
                <option value="he">{isEn ? 'Hebrew' : 'עברית'}</option>
                <option value="en">{isEn ? 'English' : 'אנגלית'}</option>
                <option value="ar">{isEn ? 'Arabic' : 'ערבית'}</option>
                <option value="ru">{isEn ? 'Russian' : 'רוסית'}</option>
                <option value="other">{isEn ? 'Other' : 'אחר'}</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.2)' : 'rgba(127, 29, 29, 0.1)', border: isUrgent ? '1px solid #ef4444' : '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', transition: 'all 0.3s' }}>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#f87171', margin: '0 0 2px 0' }}>
                {isEn ? 'Immediate Threat / High Priority' : 'סכנה מיידית / דחיפות גבוהה'}
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                {isUrgent 
                  ? (isEn ? 'This will bypass normal queues and alert admins directly.' : 'מפעיל התראת חירום ועוקף את התור הרגיל.')
                  : (isEn ? 'Tag as critical for immediate SLA response.' : 'סמן כקריטי לקבלת מענה SLA מיידי ללא דיחוי.')}
              </p>
            </div>
            <div onClick={() => setIsUrgent(!isUrgent)} style={{ width: '40px', height: '20px', backgroundColor: isUrgent ? '#ef4444' : '#475569', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s', flexShrink: 0 }}>
              <div style={{ width: '16px', height: '16px', backgroundColor: '#ffffff', borderRadius: '50%', position: 'absolute', top: '2px', left: isUrgent ? '22px' : '2px', transition: 'left 0.2s' }}></div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>{isEn ? 'Issue Category (Tags)' : 'סיווג הבעיה (תגיות)'}</label>
            <div style={{ ...inputBaseStyle, display: 'flex', flexWrap: 'wrap', gap: '8px', cursor: 'text' }} onClick={() => document.getElementById('tag-input').focus()}>
              {tags.map((tag, idx) => (
                <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.875rem' }}>
                  #{tag}
                  <span style={{ cursor: 'pointer', color: '#60a5fa', display: 'flex', alignItems: 'center' }} onClick={() => removeTag(idx)}>{SVGIcons.X}</span>
                </span>
              ))}
              <input 
                id="tag-input"
                type="text" 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length === 0 ? (isEn ? "Type and press Enter" : "הקלד מילה והקש Enter") : ""}
                style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', color: '#ffffff', flex: '1', minWidth: '150px' }}
              />
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
              {predefinedTags.map(tag => (
                <button 
                  key={tag} type="button" onClick={() => addTag(tag)}
                  style={{ fontSize: '0.75rem', backgroundColor: '#1e293b', color: '#cbd5e1', padding: '6px 12px', borderRadius: '20px', border: '1px solid #334155', cursor: 'pointer', transition: 'border-color 0.2s' }}
                  onMouseOver={(e) => e.target.style.borderColor = '#60a5fa'} onMouseOut={(e) => e.target.style.borderColor = '#334155'}
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <textarea 
              rows="3" 
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={isEn ? "Additional context (Optional)" : "פרטים נוספים או רקע הקשרי (אופציונלי)"}
              style={{ ...inputBaseStyle, resize: 'none' }}
            ></textarea>
          </div>

          <div style={{ paddingTop: '16px' }}>
            <button type="submit" disabled={isSubmitDisabled} style={{ width: '100%', backgroundColor: isUrgent ? '#ef4444' : '#1f6feb', color: '#ffffff', fontWeight: 'bold', padding: '16px', borderRadius: '12px', fontSize: '1.125rem', border: 'none', cursor: isSubmitDisabled ? 'not-allowed' : 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', transition: 'all 0.3s', marginBottom: '16px', opacity: isSubmitDisabled ? 0.6 : 1 }}>
              {isSubmitting ? uploadStatus || (isEn ? 'Logging...' : 'שולח דיווח...') : (isUrgent ? (isEn ? 'Submit CRITICAL Alert' : 'שליחת התראת חירום') : (isEn ? 'Submit Internal Report' : 'שליחת דיווח פנימי'))}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span style={{ color: '#10b981' }}>{SVGIcons.CheckCircle}</span>
              {isEn ? 'Internal Report: Action logged under your operator ID.' : 'דיווח פנימי: הפעולה מתועדת תחת מזהה המפעיל שלך.'}
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ReportForm;