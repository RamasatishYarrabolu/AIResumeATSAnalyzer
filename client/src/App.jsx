import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
  const response = await fetch(`${API}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

function Auth({ mode, onAuth }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const navigate = useNavigate(); const registering = mode === 'register';
  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try { const data = await request(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(form) }); localStorage.setItem('token', data.token); onAuth(true); navigate('/'); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <main className="auth-page"><Link to="/" className="brand"><span className="brand-mark">C</span> clearmatch</Link><section className="auth-card"><div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div><h1>{registering ? 'Create your account' : 'Welcome back'}</h1><p className="muted">{registering ? 'Make every application count.' : 'Pick up where you left off.'}</p>
    <form onSubmit={submit}>{registering && <label>Full name<input required autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jordan Lee" /></label>}<label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label><label>Password<input required type="password" minLength={registering ? 8 : undefined} autoComplete={registering ? 'new-password' : 'current-password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={registering ? 'At least 8 characters' : 'Your password'} /></label>
    {error && <p className="error">{error}</p>}<button className="button primary wide" disabled={busy}>{busy ? 'Please wait…' : registering ? 'Create account' : 'Sign in'} <span>→</span></button></form><p className="auth-switch">{registering ? 'Already have an account?' : 'New to ClearMatch?'} <Link to={registering ? '/login' : '/register'}>{registering ? 'Sign in' : 'Create account'}</Link></p></section><p className="auth-foot">Your resume stays yours. We use it only to generate your analysis.</p></main>;
}

function Dashboard({ onLogout }) {
  const [file, setFile] = useState(null); const [job, setJob] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [result, setResult] = useState(null); const [history, setHistory] = useState([]);
  async function loadHistory() { try { const data = await request('/resume'); setHistory(data.resumes || []); } catch (e) { setError(e.message); } }
  useEffect(() => { loadHistory(); }, []);
  async function analyze(e) {
    e.preventDefault(); setError(''); setResult(null); setBusy(true);
    try {
      const form = new FormData(); form.append('resume', file);
      const uploaded = await request('/resume/upload', { method: 'POST', body: form });
      const data = await request('/resume/analyze', { method: 'POST', body: JSON.stringify({ resumeText: uploaded.text, fileName: uploaded.fileName, jobDescription: job }) });
      setResult(data.analysis); await loadHistory();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  const report = result?.suggestions || {};
  return <div className="app-shell"><header className="topbar"><Link className="brand" to="/"><span className="brand-mark">C</span> clearmatch</Link><nav><a href="#how">How it works</a><a href="#history">Your analyses</a><button className="avatar" title="Sign out" onClick={onLogout}>↗</button></nav></header>
    <main><section className="hero"><div className="eyebrow"><span className="sparkle">✳</span> YOUR CAREER, IN FOCUS</div><h1>Make your resume<br /><em>impossible to miss.</em></h1><p>See how your experience lines up with the role you want. Get a clear score and thoughtful ways to make your resume stronger.</p><div className="hero-note"><span className="note-icon">✦</span><span><b>A little more clarity.</b> A lot more confidence in every application.</span></div></section>
    <section className="workspace"><div className="section-heading"><div><div className="eyebrow">LET’S GET STARTED</div><h2>Your next opportunity</h2></div><span className="step-pill"><i></i> Two simple steps</span></div>
      <form onSubmit={analyze} className="analyze-grid"><div className="panel upload-panel"><div className="panel-top"><span className="step-number">01</span><div><h3>Add your resume</h3><p>We’ll take a close look at what makes you, you.</p></div></div><label className={`dropzone ${file ? 'has-file' : ''}`}><input type="file" accept="application/pdf,.pdf" onChange={e => { setFile(e.target.files?.[0] || null); setError(''); }} /><span className="upload-icon">↑</span><b>{file ? file.name : 'Drop your PDF here'}</b><span>{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · Ready to analyze` : 'or click to browse · PDF up to 5 MB'}</span>{file && <span className="change-file">Choose a different file</span>}</label><div className="privacy"><span>◈</span> Private and secure. Only you can see your results.</div></div>
      <div className="panel job-panel"><div className="panel-top"><span className="step-number">02</span><div><h3>Tell us about the role</h3><p>Paste the job description you have in mind.</p></div></div><label className="sr-only" htmlFor="job-description">Job description</label><textarea id="job-description" required minLength={20} value={job} onChange={e => setJob(e.target.value)} placeholder={'Paste the job description here…\n\nInclude responsibilities, qualifications, and skills. The more detail you share, the more useful your match will be.'} /><div className="field-foot"><span>Your details stay private</span><span>{job.length} characters</span></div></div>
      {error && <p className="error form-error">{error}</p>}<div className="submit-row"><span>Usually takes less than 30 seconds</span><button className="button primary" disabled={busy || !file || job.trim().length < 20}>{busy ? <><span className="spinner"></span> Reading your resume…</> : <>See my match <span>→</span></>}</button></div></form>
    </section>
    {result && <section className="results" aria-live="polite"><div className="result-heading"><div><div className="eyebrow">YOUR MATCH REPORT</div><h2>A clearer picture of your fit.</h2></div><button className="button subtle" onClick={() => window.print()}>Print report ↗</button></div><div className="result-grid"><div className="score-card"><div className="score-ring" style={{ '--score': `${result.score}%` }}><div><strong>{result.score}</strong><span>out of 100</span></div></div><h3>Keyword alignment</h3><p>A simple look at the skills and terms shared between your resume and this role.</p></div><div className="keyword-card"><div className="keyword-column"><h3><span className="dot green"></span> Already coming through <small>{result.matchedKeywords?.length || 0}</small></h3><div className="chips">{result.matchedKeywords?.length ? result.matchedKeywords.map(k => <span className="chip matched" key={k}>{k}</span>) : <span className="muted">No keyword matches found yet.</span>}</div></div><div className="keyword-column"><h3><span className="dot amber"></span> Worth highlighting <small>{result.missingKeywords?.length || 0}</small></h3><div className="chips">{result.missingKeywords?.slice(0, 20).map(k => <span className="chip missing" key={k}>{k}</span>)}</div></div></div></div><div className="suggestion-card"><div className="suggestion-icon">✦</div><div><div className="eyebrow">A FEW THOUGHTFUL NEXT STEPS</div><p className="summary">{report.summary || 'Review the matched and missing keywords above to guide your next edit.'}</p>{report.recommendations?.length > 0 && <ul>{report.recommendations.map((tip, i) => <li key={i}>{tip}</li>)}</ul>}{report.bulletImprovements?.length > 0 && <div className="improvements"><h3>Bullet point ideas</h3>{report.bulletImprovements.map((item, i) => <div className="improvement" key={i}><p><b>Original</b> {item.original}</p><p><b>Try</b> {item.improved}</p></div>)}</div>}</div></div></section>}
    <section className="how" id="how"><div className="eyebrow">SIMPLE BY DESIGN</div><h2>Useful insight, without<br />the guesswork.</h2><div className="how-grid"><article><span>01</span><h3>Share what you have</h3><p>Upload your resume and the description of a role you’re excited about.</p></article><article><span>02</span><h3>See the overlap</h3><p>Get an at-a-glance view of matching skills and details you could surface.</p></article><article><span>03</span><h3>Make it your own</h3><p>Use practical suggestions as a starting point. Your experience leads.</p></article></div></section>
    <section className="history" id="history"><div className="section-heading"><div><div className="eyebrow">KEEP YOUR MOMENTUM</div><h2>Recent analyses</h2></div></div>{history.length ? <div className="history-list">{history.map(item => <article key={item._id} className="history-item"><span className="history-file">▤</span><div><b>{item.fileName}</b><span>{new Date(item.createdAt).toLocaleDateString()} · {item.matchedKeywords?.length || 0} keywords matched</span></div><span className="history-score">{item.score}%</span></article>)}</div> : <p className="empty-history">Your past reports will appear here after your first analysis.</p>}</section></main><footer><Link className="brand" to="/"><span className="brand-mark">C</span> clearmatch</Link><span>A more considered next step.</span></footer></div>;
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(Boolean(localStorage.getItem('token')));
  function logout() { localStorage.removeItem('token'); setAuthenticated(false); }
  return <Routes><Route path="/login" element={authenticated ? <Navigate to="/" replace /> : <Auth mode="login" onAuth={setAuthenticated} />} /><Route path="/register" element={authenticated ? <Navigate to="/" replace /> : <Auth mode="register" onAuth={setAuthenticated} />} /><Route path="*" element={authenticated ? <Dashboard onLogout={logout} /> : <Navigate to="/login" replace />} /></Routes>;
}
