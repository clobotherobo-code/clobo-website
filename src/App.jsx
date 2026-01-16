import React, { useState, useEffect } from 'react';
import { PrivyProvider, useLogin, useLogout, usePrivy } from '@privy-io/react-auth';
import { createClient } from '@supabase/supabase-js';
import { Connection, PublicKey } from '@solana/web3.js';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import './index.css';

// --- CONFIG SUPABASE ---
const SUPABASE_URL = 'https://kywzztizcxfuhekqpyas.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_lA2fw5O96kVM4tCe9IL9kA_02zKsxEZ'; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- CONFIG TOKEN & RPC ---
const CLOBO_TOKEN_MINT = 'EyB5wekEaN7HV2zdmfowCsezdtu7gbthzVD7b87Gpump'; 
const MIN_HOLDING = 500000; 
const SOLANA_RPC = 'https://mainnet.helius-rpc.com/?api-key=46e7ae99-744c-4da9-95dd-d7bb5cf40ad1'; 
const solanaConn = new Connection(SOLANA_RPC, 'confirmed');

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Silkscreen&family=Orbitron:wght@400&display=swap');
  
  @keyframes blobMove { 0% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0, 0) scale(1); } }
  @keyframes navBlurDown { from { opacity: 0; transform: translateY(-20px); filter: blur(15px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
  @keyframes mainBlurUp { from { opacity: 0; transform: translateY(40px); filter: blur(20px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
  @keyframes footerBlurIn { from { opacity: 0; filter: blur(15px); } to { opacity: 1; filter: blur(0); } }
  
  @keyframes pageIn {
    0% { opacity: 0; transform: translateY(10px) scale(0.98); filter: blur(10px) brightness(2); }
    50% { filter: blur(2px) brightness(1.2); }
    100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0) brightness(1); }
  }

  .page-transition {
    animation: pageIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  @keyframes overlayFade { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(8px); } }
  @keyframes modalReveal { 
    from { opacity: 0; transform: scale(0.9) translateY(30px); filter: blur(10px); } 
    to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); } 
  }

  @keyframes glitchAnim {
    0% { transform: translate(0); text-shadow: none; }
    20% { transform: translate(-2px, 2px); text-shadow: 2px 0 #72f0a1, -2px 0 #ff00c1; }
    40% { transform: translate(-2px, -2px); text-shadow: -2px 0 #72f0a1, 2px 0 #ff00c1; }
    60% { transform: translate(2px, 2px); text-shadow: 2px 0 #72f0a1, -2px 0 #ff00c1; }
    80% { transform: translate(2px, -2px); text-shadow: -2px 0 #72f0a1, 2px 0 #ff00c1; }
    100% { transform: translate(0); text-shadow: none; }
  }
  .glitch-hover:hover { animation: glitchAnim 0.2s linear infinite; }

  @keyframes artFloat {
    0% { transform: translateY(0px) rotate(0deg); filter: drop-shadow(0 0 10px rgba(114, 240, 161, 0.2)); }
    50% { transform: translateY(-15px) rotate(1deg); filter: drop-shadow(0 0 30px rgba(114, 240, 161, 0.5)); }
    100% { transform: translateY(0px) rotate(0deg); filter: drop-shadow(0 0 10px rgba(114, 240, 161, 0.2)); }
  }

  @keyframes logoPulse { 0% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 5px #72f0a1); } 50% { opacity: 0.3; transform: scale(0.95); filter: drop-shadow(0 0 20px #72f0a1); } 100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 5px #72f0a1); } }
  @keyframes moveGrid { 0% { transform: translateY(0); } 100% { transform: translateY(60px); } }
  
  .premium-btn { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  .premium-btn:hover { box-shadow: 0 0 25px rgba(114, 240, 161, 0.6); transform: translateY(-4px) scale(1.03); filter: brightness(1.2); }
  
  body { margin: 0; padding: 0; overflow-x: hidden; background-color: #060807; }
`;

function CloboApp() {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [showModal, setShowModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [caText, setCaText] = useState("CA: Copy");
  
  const { authenticated, user } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();

  const [claimedCount, setClaimedCount] = useState(0);
  const [canStatus, setCanStatus] = useState(Array(6).fill(false));
  const [hasUserClaimed, setHasUserClaimed] = useState(false);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const { data } = await supabase.from('Winner').select('*'); 
        if (data) {
          const newStatus = Array(6).fill(false);
          data.forEach(win => {
            newStatus[win.slot_index] = true;
            if (authenticated && user?.wallet?.address === win.wallet_address) {
              setHasUserClaimed(true);
            }
          });
          setCanStatus(newStatus);
          setClaimedCount(data.length);
        }
      } catch (e) { console.error("Database Error:", e); }
      finally { setTimeout(() => setLoading(false), 3800); }
    };
    fetchWinners();
  }, [authenticated, user]);

  const handleCopyCA = () => {
    navigator.clipboard.writeText(CLOBO_TOKEN_MINT);
    setCaText("Copied!");
    setTimeout(() => setCaText("CA: Copy"), 2000);
  };

  const handleCollect = async (index) => {
    if (!authenticated) { login(); return; }
    if (hasUserClaimed) { alert("Maximum 1 claim per wallet!"); return; }
    try {
      const walletPubKey = new PublicKey(user.wallet.address);
      const tokenAccounts = await solanaConn.getParsedTokenAccountsByOwner(walletPubKey, { mint: new PublicKey(CLOBO_TOKEN_MINT) });
      let realBalance = 0;
      if (tokenAccounts.value.length > 0) {
        realBalance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      }
      if (realBalance < MIN_HOLDING) { setShowErrorModal(true); return; }
      if (canStatus[index] || claimedCount >= 6) { alert("This slot is already full!"); return; }
      const { error } = await supabase.from('Winner').insert([{ wallet_address: user.wallet.address, slot_index: index }]);
      if (error) throw error;
      setCanStatus(prev => { const next = [...prev]; next[index] = true; return next; });
      setClaimedCount(prev => prev + 1); setHasUserClaimed(true); setShowModal(true);
    } catch (err) { alert("Blockchain verification error!"); }
  };

  const agencyFont = "'Agency FB', 'Yu Gothic UI Light', sans-serif";
  const styles = {
    container: { minHeight: '100vh', color: '#d1d1d1', display: 'flex', flexDirection: 'column', fontFamily: agencyFont, position: 'relative', backgroundColor: '#060807', overflowX: 'hidden' },
    bgAtmosphere: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 },
    blob1: { position: 'absolute', top: '10%', left: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(114, 240, 161, 0.15) 0%, transparent 70%)', borderRadius: '50%', animation: 'blobMove 10s infinite alternate', filter: 'blur(60px)' },
    blob2: { position: 'absolute', bottom: '10%', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(114, 240, 161, 0.1) 0%, transparent 70%)', borderRadius: '50%', animation: 'blobMove 15s infinite alternate-reverse', filter: 'blur(80px)' },
    scanlineOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.2) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))', backgroundSize: '100% 4px, 3px 100%', zIndex: 10, pointerEvents: 'none', opacity: 0.4 },
    vignette: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle, transparent 30%, rgba(0,0,0,0.8) 100%)', zIndex: 2, pointerEvents: 'none' },
    gridWrapper: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: 1 },
    gridBg: { position: 'absolute', top: '-100%', left: 0, right: 0, width: '100%', height: '300%', backgroundImage: `linear-gradient(to right, rgba(114, 240, 161, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(114, 240, 161, 0.08) 1px, transparent 1px)`, backgroundSize: '60px 60px', animation: 'moveGrid 5s linear infinite', maskImage: 'radial-gradient(circle, black, transparent 80%)' },
    navbar: { width: '100%', position: 'fixed', top: 0, zIndex: 100, display: 'flex', justifyContent: 'center', background: 'linear-gradient(to bottom, rgba(6, 8, 7, 0.95) 0%, rgba(6, 8, 7, 0.4) 70%, transparent 100%)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', padding: '10px 0', opacity: 0, animation: 'navBlurDown 1.2s ease-out forwards' },
    navContent: { width: '92%', maxWidth: '1300px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' },
    navLinks: { position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '40px', fontSize: '16px', letterSpacing: '1.5px' },
    main: { position: 'relative', zIndex: 5, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'center', padding: '120px 20px 300px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%', opacity: 0, animation: 'mainBlurUp 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) 0.5s forwards' },
    footer: { width: '100%', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, padding: '25px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(to top, rgba(6, 8, 7, 0.95) 0%, rgba(6, 8, 7, 0.4) 70%, transparent 100%)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', opacity: 0, animation: 'footerBlurIn 1s ease-out 1.5s forwards' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, animation: 'overlayFade 0.4s ease-out forwards' },
    modalBox: { backgroundColor: '#161d1b', width: '90%', maxWidth: '450px', padding: '40px 20px', borderRadius: '25px', border: '4px solid #72f0a1', textAlign: 'center', boxShadow: '0 0 50px rgba(114, 240, 161, 0.2)', animation: 'modalReveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }
  };

  const artImageStyle = { width: '100%', borderRadius: '20px', border: '2px solid rgba(114, 240, 161, 0.3)', backgroundColor: 'rgba(114, 240, 161, 0.05)' };

  if (loading) {
    return (
      <div style={{ height: '100vh', width: '100vw', backgroundColor: '#060807', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
        <style>{GLOBAL_CSS}</style>
        <img src="/Logo 1.png" alt="Loading..." style={{ width: '150px', animation: 'logoPulse 1.5s infinite ease-in-out' }} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{GLOBAL_CSS}</style>
      <div style={styles.bgAtmosphere}><div style={styles.blob1}></div><div style={styles.blob2}></div><div style={styles.vignette}></div><div style={styles.scanlineOverlay}></div></div>
      <div style={styles.gridWrapper}><div style={styles.gridBg}></div></div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <img src="/Logo 1.png" alt="Clobo" style={{ width: '80px', marginBottom: '20px' }} />
            <h2 style={{ color: '#72f0a1', fontSize: '48px', margin: '10px 0' }}>Gas Collected!</h2>
            <p style={{ color: 'white', fontSize: '20px' }}>0.05 Sol Reward Claimed!</p>
            <button className="premium-btn" style={{ backgroundColor: '#343e3c', color: 'white', border: 'none', padding: '12px 40px', borderRadius: '15px', fontSize: '24px', cursor: 'pointer', marginTop: '20px', fontFamily: agencyFont }} onClick={() => setShowModal(false)}>Continue</button>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <img src="/Logo 1.png" alt="Clobo" style={{ width: '80px', marginBottom: '20px' }} />
            <h1 className="glitch-hover" style={{ color: '#72f0a1', fontSize: '64px', fontFamily: "'Silkscreen'", margin: '10px 0', animation: 'logoPulse 2s infinite' }}>BEEP BOOP</h1>
            <p style={{ color: 'white', fontSize: '20px', marginBottom: '10px' }}>Insufficient Token Holding</p>
            <p style={{ color: '#a0a8a4', fontSize: '16px' }}>Requirement: 500,000 Tokens</p>
            <button className="premium-btn" style={{ backgroundColor: '#72f0a1', color: 'black', border: 'none', padding: '12px 40px', borderRadius: '15px', fontSize: '24px', cursor: 'pointer', marginTop: '20px', fontFamily: agencyFont, fontWeight: 'bold' }} onClick={() => setShowErrorModal(false)}>Close</button>
          </div>
        </div>
      )}

      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <img src="/Logo 1.png" className="glitch-hover" style={{height: '55px', cursor: 'pointer'}} alt="Logo" onClick={() => setCurrentPage('home')} />
          <div style={styles.navLinks}>
            <span style={{ cursor: 'pointer', color: currentPage === 'home' ? '#72f0a1' : '#efefef'}} onClick={() => setCurrentPage('home')}>Home</span>
            <span style={{ cursor: 'pointer', color: currentPage === 'fuel' ? '#72f0a1' : '#efefef'}} onClick={() => setCurrentPage('fuel')}>Fuel The Gas</span>
          </div>
          <button className="premium-btn" onClick={authenticated ? logout : login} style={{backgroundColor: authenticated ? '#72f0a1' : 'white', color: 'black', border: 'none', padding: '8px 22px', fontSize: '18px', cursor: 'pointer', fontFamily: agencyFont}}>{authenticated ? 'Disconnect' : 'Connect Wallet'}</button>
        </div>
      </nav>

      <main style={styles.main}>
        <div key={currentPage} className="page-transition">
          {currentPage === 'home' ? (
            <>
              <img src="/Nama Project.png" className="glitch-hover" alt="CLOBO" style={{width: '90%', maxWidth: '700px', marginTop: '-15px', animation: 'logoPulse 3s infinite'}} />
              <h2 className="glitch-hover" style={{ color: '#72f0a1', fontSize: '64px', fontFamily: "'Silkscreen'", margin: '0', lineHeight: '0.7', marginTop: '-85px', animation: 'logoPulse 3s infinite', letterSpacing: '6px' }}>BEEP BOOP BEEP BOOP</h2>
              <p style={{color: '#a0a8a4', fontSize: '18px', maxWidth: '950px', marginTop: '40px', lineHeight: '1.6', textAlign: 'center'}}>
                <span style={{color: '#72f0a1'}}>Clobo the Robo emerged from the ruins of a brutal market war,</span> a lone steel survivor carrying the last spark pill of hope into a ravaged digital world trapped in an unforgiving bear market, forged for battle but driven by purpose. Clobo now roams the fractured network repairing what was broken, reigniting confidence where fear once ruled, and reminding all who cross his path that even in the coldest cycles, resilience can spark a new dawn.
              </p>
              <div style={{display: 'flex', gap: '20px', marginTop: '30px', marginBottom: '40px'}}>
                <button className="premium-btn" onClick={handleCopyCA} style={{backgroundColor: '#72f0a1', color: '#0d1110', border: 'none', width: '190px', padding: '12px 0', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer', fontFamily: agencyFont}}>{caText}</button>
                <a href="https://pump.fun/" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none'}}><button className="premium-btn" style={{backgroundColor: '#72f0a1', color: '#0d1110', border: 'none', width: '190px', padding: '12px 0', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer', fontFamily: agencyFont}}>Buy Clobo</button></a>
              </div>
              <h2 className="glitch-hover" style={{ color: '#72f0a1', fontSize: '48px', fontFamily: "'Silkscreen'", margin: '20px 0 30px 0', letterSpacing: '4px' }}>CHARACTER SHEET</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', width: '100%', maxWidth: '800px', marginTop: '10px' }}>
                <div style={{ width: '100%', animation: 'artFloat 6s ease-in-out infinite' }}><img src="/Art.png" alt="Clobo Art 1" style={artImageStyle} /></div>
                <div style={{ width: '100%', animation: 'artFloat 6s ease-in-out infinite', animationDelay: '0.3s' }}><img src="/Art 2.png" alt="Clobo Art 2" style={artImageStyle} /></div>
                <div style={{ width: '100%', animation: 'artFloat 6s ease-in-out infinite', animationDelay: '0.6s' }}><img src="/Art 3.png" alt="Clobo Art 3" style={artImageStyle} /></div>
                <div style={{ width: '100%', animation: 'artFloat 6s ease-in-out infinite', animationDelay: '0.9s' }}><img src="/Art 4.png" alt="Clobo Art 4" style={artImageStyle} /></div>
              </div>
            </>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
              <h1 className="glitch-hover" style={{fontSize: '48px', margin: '0', color: 'white', fontWeight: 'bold'}}>Get A Gas</h1>
              <div style={{color: '#72f0a1', fontSize: '14px', marginBottom: '5px'}}>Round #1 Active</div>
              <div style={{fontFamily: "'Silkscreen'", fontSize: '24px', color: '#72f0a1', marginBottom: '30px'}}>{6 - claimedCount} / 6 Jerry Cans</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', maxWidth: '550px', width: '100%', marginBottom: '50px' }}>
                {canStatus.map((isClaimed, i) => (
                  <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <div style={{backgroundColor: '#1c2321', borderRadius: '15px', aspectRatio: '1/1', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #72f0a1', position: 'relative', borderColor: isClaimed ? '#444' : '#72f0a1'}}>
                      <img src="/Fuel.png" alt="Fuel" style={{width: '70px', opacity: isClaimed ? 0.2 : 1}} />
                    </div>
                    <button className="premium-btn" onClick={() => handleCollect(i)} disabled={isClaimed || hasUserClaimed} style={{backgroundColor: (isClaimed || hasUserClaimed) ? '#444' : '#72f0a1', color: '#0d1110', border: 'none', width: '100%', padding: '8px 0', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', borderRadius: '10px'}}>{isClaimed ? 'Sold Out' : (hasUserClaimed ? 'Participated' : 'Collect')}</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer style={styles.footer}>
        <div style={{display: 'flex', gap: '50px', fontSize: '16px'}}>
          <a href="https://x.com/Clobotherobo" target="_blank" rel="noopener noreferrer" style={{color: '#efefef', textDecoration: 'none', opacity: 0.6}}>Twitter</a>
          <a href="https://dexscreener.com/" target="_blank" rel="noopener noreferrer" style={{color: '#efefef', textDecoration: 'none', opacity: 0.6}}>Dexscreener</a>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <PrivyProvider
      appId="cmke399v0006zl20cczhcpu5d" // PASTIKAN ID INI YANG TERPASANG
      config={{ 
        loginMethods: ['wallet'],
        appearance: { theme: 'dark', accentColor: '#72f0a1', walletChainType: 'solana-only' },
        externalWallets: { solana: { connectors: toSolanaWalletConnectors({ shouldAutoConnect: false }) } }
      }}
    >
      <CloboApp />
    </PrivyProvider>
  );
}