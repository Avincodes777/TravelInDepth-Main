import React, { useState } from 'react';
import * as plannerApi from '../../api/plannerApi';

/* ─── Styles ────────────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

.atp-section {
  position: relative;
  padding: 100px 0 120px;
  background: linear-gradient(160deg,#1a0a00 0%,#2D1B00 40%,#3d2000 70%,#1a0a00 100%);
  overflow: hidden;
  font-family: 'DM Sans',sans-serif;
}
.atp-section::before {
  content:'';position:absolute;inset:0;
  background:
    radial-gradient(ellipse 60% 50% at 20% 50%,rgba(255,107,26,.12) 0%,transparent 70%),
    radial-gradient(ellipse 50% 60% at 80% 30%,rgba(139,26,26,.15) 0%,transparent 70%);
  pointer-events:none;
}
.atp-orb {
  position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;
  animation:atp-drift 12s ease-in-out infinite alternate;
}
.atp-orb-1{width:400px;height:400px;background:rgba(255,107,26,.08);top:-100px;left:-80px;}
.atp-orb-2{width:300px;height:300px;background:rgba(245,166,35,.07);bottom:-60px;right:10%;animation-delay:-5s;}
.atp-orb-3{width:200px;height:200px;background:rgba(139,26,26,.1);top:40%;right:20%;animation-delay:-9s;}
@keyframes atp-drift{from{transform:translate(0,0) scale(1);}to{transform:translate(30px,-40px) scale(1.1);}}

.atp-wrap{max-width:1100px;margin:0 auto;padding:0 24px;position:relative;z-index:2;}

.atp-hdr{text-align:center;margin-bottom:56px;}
.atp-eyebrow{
  display:inline-flex;align-items:center;gap:10px;
  font-size:11px;font-weight:600;letter-spacing:.3em;text-transform:uppercase;
  color:#F5A623;margin-bottom:18px;
}
.atp-eyebrow::before,.atp-eyebrow::after{content:'';display:block;width:30px;height:1px;}
.atp-eyebrow::before{background:linear-gradient(90deg,transparent,#F5A623);}
.atp-eyebrow::after{background:linear-gradient(90deg,#F5A623,transparent);}
.atp-h2{
  font-family:'Playfair Display',serif;
  font-size:clamp(32px,5vw,52px);font-weight:700;color:#FDF6EC;line-height:1.15;margin:0 0 16px;
}
.atp-h2 em{font-style:italic;color:#FF6B1A;}
.atp-sub{font-size:16px;color:rgba(253,246,236,.6);max-width:500px;margin:0 auto;line-height:1.7;}

/* ── LOCKED ── */
.atp-locked-wrapper{position:relative;border-radius:28px;overflow:hidden;}
.atp-locked-blur{filter:blur(6px);pointer-events:none;user-select:none;opacity:.45;}
.atp-mock-card{
  background:rgba(253,246,236,.04);border:1px solid rgba(245,166,35,.15);
  border-radius:28px;padding:40px 48px;
}
.atp-mock-row{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px;}
.atp-mock-field{height:52px;background:rgba(253,246,236,.06);border-radius:12px;border:1px solid rgba(245,166,35,.1);}
.atp-mock-row2{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:24px;}
.atp-mock-chip{height:40px;background:rgba(255,107,26,.08);border-radius:99px;border:1px solid rgba(255,107,26,.15);}
.atp-mock-btn{height:56px;background:linear-gradient(135deg,rgba(255,107,26,.3),rgba(139,26,26,.3));border-radius:14px;width:220px;margin:0 auto;}

.atp-lock-overlay{
  position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:rgba(45,27,0,.6);backdrop-filter:blur(2px);
  border-radius:28px;border:1px solid rgba(245,166,35,.2);padding:40px 24px;z-index:10;
}
.atp-lock-icon{
  width:72px;height:72px;background:linear-gradient(135deg,#FF6B1A,#8B1A1A);
  border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:28px;margin-bottom:24px;
  box-shadow:0 0 40px rgba(255,107,26,.35);
  animation:atp-pulse 3s ease-in-out infinite;
}
@keyframes atp-pulse{0%,100%{box-shadow:0 0 40px rgba(255,107,26,.35);}50%{box-shadow:0 0 70px rgba(255,107,26,.6);}}
.atp-lock-title{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:#FDF6EC;margin-bottom:10px;text-align:center;}
.atp-lock-text{font-size:15px;color:rgba(253,246,236,.65);text-align:center;max-width:380px;line-height:1.65;margin-bottom:32px;}
.atp-lock-btns{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;}
.atp-btn-login{
  padding:14px 36px;background:linear-gradient(135deg,#FF6B1A,#cc4f00);
  color:#fff;border:none;border-radius:99px;font-size:14px;font-weight:600;
  letter-spacing:.05em;cursor:pointer;transition:all .3s;
  box-shadow:0 8px 30px rgba(255,107,26,.4);
}
.atp-btn-login:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(255,107,26,.55);}
.atp-btn-signup{
  padding:14px 36px;background:transparent;color:#FDF6EC;
  border:1px solid rgba(253,246,236,.3);border-radius:99px;
  font-size:14px;font-weight:600;letter-spacing:.05em;cursor:pointer;transition:all .3s;
}
.atp-btn-signup:hover{background:rgba(253,246,236,.08);border-color:rgba(253,246,236,.5);transform:translateY(-2px);}
.atp-perks{display:flex;gap:20px;justify-content:center;margin-top:20px;flex-wrap:wrap;}
.atp-perk{display:flex;align-items:center;gap:6px;font-size:12px;color:rgba(245,166,35,.8);}

/* ── UNLOCKED CARD ── */
.atp-card{
  background:rgba(253,246,236,.04);border:1px solid rgba(245,166,35,.18);
  border-radius:28px;padding:48px 52px;backdrop-filter:blur(20px);
  box-shadow:0 40px 80px rgba(0,0,0,.4),inset 0 1px 0 rgba(245,166,35,.1);
}
.atp-greeting{
  display:flex;align-items:center;gap:14px;margin-bottom:36px;
  padding-bottom:28px;border-bottom:1px solid rgba(245,166,35,.12);
}
.atp-avatar{
  width:48px;height:48px;background:linear-gradient(135deg,#FF6B1A,#8B1A1A);
  border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;
}
.atp-gname{font-family:'Playfair Display',serif;font-size:17px;color:#FDF6EC;font-weight:600;}
.atp-gsub{font-size:13px;color:rgba(245,166,35,.8);margin-top:2px;}
.atp-badge{
  font-size:11px;color:rgba(253,246,236,.5);letter-spacing:.15em;text-transform:uppercase;
  background:rgba(253,246,236,.05);padding:6px 14px;border-radius:99px;border:1px solid rgba(253,246,236,.1);
}
.atp-label{
  font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;
  color:rgba(245,166,35,.8);margin-bottom:12px;display:block;
}
.atp-dest-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin-bottom:24px;}
.atp-dest-chip{
  padding:10px 16px;background:rgba(253,246,236,.05);border:1px solid rgba(253,246,236,.1);
  border-radius:10px;color:rgba(253,246,236,.7);font-size:13px;cursor:pointer;
  transition:all .25s;text-align:center;display:flex;align-items:center;justify-content:center;gap:6px;
}
.atp-dest-chip:hover{background:rgba(255,107,26,.12);border-color:rgba(255,107,26,.3);color:#FDF6EC;transform:translateY(-1px);}
.atp-dest-chip.sel{background:rgba(255,107,26,.2);border-color:#FF6B1A;color:#FF6B1A;font-weight:600;}

/* ── MULTI-CITY QUEUE ── */
.atp-queue-box{
  background:rgba(253,246,236,.03);border:1px solid rgba(245,166,35,.15);
  border-radius:20px;padding:22px 24px;margin-bottom:32px;
}
.atp-queue-header{
  display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;
}
.atp-queue-title{
  font-family:'Playfair Display',serif;font-size:16px;font-weight:600;color:#FDF6EC;
  display:flex;align-items:center;gap:8px;
}
.atp-add-city-btn{
  background:rgba(255,107,26,.12);border:1px solid rgba(255,107,26,.3);
  color:#FFB347;padding:6px 14px;border-radius:99px;font-size:12px;font-weight:600;
  cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:5px;
}
.atp-add-city-btn:hover{
  background:rgba(255,107,26,.25);border-color:#FF6B1A;color:#fff;transform:translateY(-1px);
}
.atp-queue-list{display:flex;flex-direction:column;gap:10px;}
.atp-queue-item{
  display:flex;align-items:center;justify-content:space-between;
  background:rgba(253,246,236,.05);border:1px solid rgba(245,166,35,.12);
  border-radius:14px;padding:12px 16px;gap:14px;flex-wrap:wrap;transition:all .2s;
}
.atp-queue-item:hover{
  background:rgba(253,246,236,.08);border-color:rgba(255,107,26,.25);
}
.atp-queue-left{display:flex;align-items:center;gap:12px;}
.atp-queue-order{
  width:26px;height:26px;border-radius:50%;background:rgba(255,107,26,.2);
  color:#FF6B1A;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;
}
.atp-queue-cityname{
  font-family:'Playfair Display',serif;font-size:16px;font-weight:600;color:#FDF6EC;
}
.atp-queue-right{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.atp-days-control{display:flex;align-items:center;gap:6px;font-size:13px;color:rgba(253,246,236,.75);}
.atp-days-input{
  width:52px;padding:5px 8px;background:rgba(45,27,0,.7);border:1px solid rgba(245,166,35,.25);
  border-radius:8px;color:#FFB347;font-weight:700;text-align:center;font-size:13px;outline:none;
}
.atp-days-input:focus{border-color:#FF6B1A;}
.atp-reorder-btn{
  background:transparent;border:1px solid rgba(253,246,236,.12);color:rgba(253,246,236,.6);
  width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;
  cursor:pointer;font-size:12px;transition:all .2s;
}
.atp-reorder-btn:hover:not(:disabled){
  background:rgba(255,107,26,.15);border-color:#FF6B1A;color:#FDF6EC;
}
.atp-reorder-btn:disabled{opacity:.2;cursor:not-allowed;}
.atp-remove-city-btn{
  background:transparent;border:none;color:rgba(255,150,150,.6);
  cursor:pointer;padding:6px;border-radius:6px;transition:all .2s;font-size:14px;
}
.atp-remove-city-btn:hover{color:#ff6666;background:rgba(139,26,26,.2);}
.atp-route-preview{
  margin-top:14px;padding-top:14px;border-top:1px dashed rgba(245,166,35,.15);
  font-size:13px;color:rgba(245,166,35,.85);display:flex;align-items:center;gap:8px;flex-wrap:wrap;
}

.atp-row2{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px;}
.atp-slider-val{font-family:'Playfair Display',serif;font-size:22px;color:#FF6B1A;font-weight:700;margin-bottom:8px;}
.atp-slider{
  -webkit-appearance:none;appearance:none;width:100%;height:4px;
  background:linear-gradient(90deg,#FF6B1A var(--pct,40%),rgba(253,246,236,.1) var(--pct,40%));
  border-radius:99px;outline:none;cursor:pointer;
}
.atp-slider::-webkit-slider-thumb{
  -webkit-appearance:none;width:22px;height:22px;
  background:linear-gradient(135deg,#FF6B1A,#F5A623);
  border-radius:50%;box-shadow:0 4px 16px rgba(255,107,26,.5);cursor:pointer;transition:transform .15s;
}
.atp-slider::-webkit-slider-thumb:hover{transform:scale(1.2);}
.atp-slider-labs{display:flex;justify-content:space-between;margin-top:8px;font-size:11px;color:rgba(253,246,236,.4);}
.atp-select{
  width:100%;padding:14px 18px;background:rgba(253,246,236,.05);
  border:1px solid rgba(253,246,236,.12);border-radius:12px;
  color:#FDF6EC;font-size:14px;font-family:'DM Sans',sans-serif;
  cursor:pointer;outline:none;-webkit-appearance:none;appearance:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23F5A623' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 16px center;transition:border-color .2s;
}
.atp-select option{background:#2D1B00;}
.atp-select:focus{border-color:rgba(255,107,26,.5);}
.atp-interests{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:36px;}
.atp-int-chip{
  padding:8px 18px;background:rgba(253,246,236,.04);border:1px solid rgba(253,246,236,.1);
  border-radius:99px;color:rgba(253,246,236,.65);font-size:13px;cursor:pointer;
  transition:all .25s;display:flex;align-items:center;gap:6px;
}
.atp-int-chip:hover{background:rgba(255,107,26,.1);border-color:rgba(255,107,26,.35);color:#FDF6EC;}
.atp-int-chip.sel{background:linear-gradient(135deg,rgba(255,107,26,.25),rgba(139,26,26,.25));border-color:#FF6B1A;color:#FF6B1A;font-weight:600;}

.atp-gen-btn{
  width:100%;padding:18px 40px;
  background:linear-gradient(135deg,#FF6B1A 0%,#cc4f00 50%,#8B1A1A 100%);
  border:none;border-radius:16px;color:#fff;font-size:16px;font-weight:700;
  letter-spacing:.08em;text-transform:uppercase;cursor:pointer;
  transition:all .35s;box-shadow:0 12px 40px rgba(255,107,26,.4);
  display:flex;align-items:center;justify-content:center;gap:12px;position:relative;overflow:hidden;
}
.atp-gen-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.15),transparent);opacity:0;transition:opacity .3s;}
.atp-gen-btn:hover::before{opacity:1;}
.atp-gen-btn:hover{transform:translateY(-3px);box-shadow:0 20px 60px rgba(255,107,26,.55);}
.atp-gen-btn:active{transform:translateY(-1px);}
.atp-gen-btn.loading{pointer-events:none;opacity:.8;}
.atp-spinner{width:20px;height:20px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:atp-spin .7s linear infinite;}
@keyframes atp-spin{to{transform:rotate(360deg);}}

.atp-result{margin-top:36px;border-top:1px solid rgba(245,166,35,.15);padding-top:36px;animation:atp-fadein .6s ease both;}
@keyframes atp-fadein{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
.atp-res-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px;}
.atp-res-title{font-family:'Playfair Display',serif;font-size:22px;color:#FDF6EC;font-weight:700;}
.atp-res-tags{display:flex;gap:10px;flex-wrap:wrap;}
.atp-res-tag{padding:5px 14px;background:rgba(245,166,35,.12);border:1px solid rgba(245,166,35,.25);border-radius:99px;font-size:12px;color:#F5A623;font-weight:500;}

.atp-day-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px;}
.atp-day-tab{
  min-width:36px;height:36px;padding:0 10px;border-radius:99px;display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;
  background:rgba(253,246,236,.05);border:1px solid rgba(253,246,236,.12);color:rgba(253,246,236,.6);
}
.atp-day-tab:hover{border-color:rgba(255,107,26,.4);color:#FDF6EC;}
.atp-day-tab.active{background:linear-gradient(135deg,#FF6B1A,#8B1A1A);border-color:transparent;color:#fff;}

/* Multi-city Tab Groups */
.atp-city-tab-cluster{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:24px;}
.atp-city-group{
  display:inline-flex;align-items:center;gap:6px;
  background:rgba(253,246,236,.03);border:1px solid rgba(245,166,35,.15);
  border-radius:99px;padding:4px 10px 4px 14px;
}
.atp-city-group-label{
  font-family:'Playfair Display',serif;font-size:13px;font-weight:700;color:#F5A623;
  margin-right:4px;white-space:nowrap;
}
.atp-city-group-divider{
  color:rgba(253,246,236,.2);font-size:16px;font-weight:300;user-select:none;
}
.atp-day-tab-pill{
  width:28px;height:28px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;
  background:rgba(253,246,236,.06);border:1px solid rgba(253,246,236,.12);color:rgba(253,246,236,.7);
}
.atp-day-tab-pill:hover{border-color:rgba(255,107,26,.4);color:#FDF6EC;transform:translateY(-1px);}
.atp-day-tab-pill.active{background:linear-gradient(135deg,#FF6B1A,#8B1A1A);border-color:transparent;color:#fff;box-shadow:0 3px 10px rgba(255,107,26,.4);}

.atp-itin{
  background:rgba(253,246,236,.03);border:1px solid rgba(245,166,35,.1);
  border-radius:16px;padding:28px 32px;font-size:14px;color:rgba(253,246,236,.85);line-height:1.85;
}
.atp-day-title{font-family:'Playfair Display',serif;color:#FF6B1A;font-size:18px;font-weight:600;margin:0 0 18px;}
.atp-day-block{display:flex;gap:16px;margin-bottom:14px;}
.atp-day-block-label{width:96px;flex-shrink:0;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:rgba(245,166,35,.7);padding-top:2px;}
.atp-day-tip{margin-top:18px;padding:14px 18px;background:rgba(255,107,26,.08);border:1px solid rgba(255,107,26,.2);border-radius:10px;font-size:13px;color:rgba(253,246,236,.75);}
.atp-day-tip b{color:#F5A623;}

.atp-res-actions{display:flex;gap:12px;margin-top:20px;flex-wrap:wrap;}
.atp-act-btn{
  padding:10px 24px;border-radius:10px;font-size:13px;font-weight:600;
  cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:7px;
  border:none;
}
.atp-act-btn.pri{background:linear-gradient(135deg,#FF6B1A,#8B1A1A);color:#fff;box-shadow:0 6px 20px rgba(255,107,26,.3);}
.atp-act-btn.sec{background:transparent;color:rgba(253,246,236,.7);border:1px solid rgba(253,246,236,.15);}
.atp-act-btn:hover{transform:translateY(-2px);}
.atp-act-btn:disabled{opacity:.5;pointer-events:none;transform:none;}
.atp-error{background:rgba(139,26,26,.2);border:1px solid rgba(139,26,26,.4);border-radius:12px;padding:16px 20px;color:#ff9999;font-size:14px;margin-top:16px;}
.atp-saved-note{font-size:12px;color:#F5A623;margin-top:10px;}

@media(max-width:768px){
  .atp-card,.atp-mock-card{padding:28px 20px;}
  .atp-row2{grid-template-columns:1fr;}
  .atp-mock-row{grid-template-columns:repeat(2,1fr);}
  .atp-mock-row2{grid-template-columns:repeat(3,1fr);}
  .atp-lock-btns{flex-direction:column;align-items:stretch;text-align:center;}
}
`;

/* ─── Data ─────────────────────────────────────────────────────────────────── */
const DESTINATIONS = [
  { e:'🏔️', n:'Ladakh' },{ e:'🌴', n:'Kerala' },{ e:'🏰', n:'Rajasthan' },
  { e:'🌊', n:'Goa' },{ e:'⛰️', n:'Himachal' },{ e:'🕌', n:'Varanasi' },
  { e:'🐯', n:'Jim Corbett' },{ e:'🌺', n:'Meghalaya' },{ e:'🏛️', n:'Hampi' },{ e:'🎭', n:'Kolkata' },
  { e:'🛕', n:'Jaipur' },{ e:'🌅', n:'Udaipur' },{ e:'🏜️', n:'Jodhpur' },{ e:'⛵', n:'Rishikesh' },
];

const INTERESTS = [
  { e:'🏛️', l:'Heritage' },{ e:'🍛', l:'Food & Cuisine' },{ e:'🧘', l:'Wellness' },
  { e:'🦁', l:'Wildlife' },{ e:'🏄', l:'Adventure' },{ e:'📸', l:'Photography' },
  { e:'🎭', l:'Culture' },{ e:'🌿', l:'Eco Travel' },{ e:'🛕', l:'Spirituality' },{ e:'🎨', l:'Arts & Craft' },
];

/* ─── Locked ──────────────────────────────────────────────────────────────── */
function LockedPlanner({ onLogin }) {
  return (
    <div className="atp-locked-wrapper">
      <div className="atp-locked-blur atp-mock-card">
        <div className="atp-mock-row">{[0,1,2].map(i=><div key={i} className="atp-mock-field"/>)}</div>
        <div className="atp-mock-row">{[0,1,2].map(i=><div key={i} className="atp-mock-field"/>)}</div>
        <div className="atp-mock-row2">{[0,1,2,3,4].map(i=><div key={i} className="atp-mock-chip"/>)}</div>
        <div style={{display:'flex',justifyContent:'center'}}><div className="atp-mock-btn"/></div>
      </div>
      <div className="atp-lock-overlay">
        <div className="atp-lock-icon">🔒</div>
        <h3 className="atp-lock-title">Unlock AI Trip Planning</h3>
        <p className="atp-lock-text">
          Sign in to unlock personalized AI trip planning — tailored itineraries, local insights,
          budget breakdowns, and sustainable travel tips crafted just for you.
        </p>
        <div className="atp-lock-btns">
          <button className="atp-btn-login" onClick={onLogin}>Sign In/Log In to Unlock</button>
        </div>
        <div className="atp-perks">
          {['Day-wise itineraries','Multi-city routes','Local food picks','Budget breakdown'].map(p=>(
            <span key={p} className="atp-perk">✦ {p}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Unlocked ────────────────────────────────────────────────────────────── */
function UnlockedPlanner({ userName = 'Traveller' }) {
  // Ordered city queue: Array of { id, name, emoji, days }
  const [cityQueue, setCityQueue] = useState([
    { id: 1, name: 'Rajasthan', emoji: '🏰', days: 4 },
  ]);
  const [budget, setBudget] = useState('mid-range');
  const [style, setStyle]   = useState('cultural');
  const [interests, setInterests] = useState(['Heritage','Food & Cuisine']);
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);   // { destination, days: [...] }
  const [activeDay, setActiveDay] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [regenDay, setRegenDay] = useState(null);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const [error, setError] = useState(null);

  const totalTripDays = cityQueue.reduce((acc, c) => acc + (Number(c.days) || 1), 0);

  const toggleInterest = l => setInterests(p => p.includes(l) ? p.filter(i=>i!==l) : [...p,l]);

  // When clicking a destination chip:
  // If queue has only 1 item, replace it; if queue already has cities, either add or toggle
  const handleSelectChip = (d) => {
    setCityQueue((prev) => {
      const existsIndex = prev.findIndex((c) => c.name.toLowerCase() === d.n.toLowerCase());
      if (existsIndex >= 0) {
        // If already in queue and more than 1 city, remove it
        if (prev.length > 1) {
          return prev.filter((_, idx) => idx !== existsIndex);
        }
        return prev;
      }
      // If only 1 city and user clicks another chip, add it as next stop
      return [...prev, { id: Date.now() + Math.random(), name: d.n, emoji: d.e, days: 3 }];
    });
  };

  const handleAddCity = (cityName = 'Jaipur', emoji = '📍') => {
    setCityQueue((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), name: cityName, emoji, days: 3 },
    ]);
  };

  const handleCityDaysChange = (id, newDays) => {
    const val = Math.min(14, Math.max(1, parseInt(newDays, 10) || 1));
    setCityQueue((prev) =>
      prev.map((c) => (c.id === id ? { ...c, days: val } : c))
    );
  };

  const handleMoveCity = (index, direction) => {
    setCityQueue((prev) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(targetIndex, 0, moved);
      return copy;
    });
  };

  const handleRemoveCity = (id) => {
    setCityQueue((prev) => {
      if (prev.length <= 1) return prev; // keep at least 1 city
      return prev.filter((c) => c.id !== id);
    });
  };

  const generate = async () => {
    setLoading(true); setError(null); setItinerary(null); setSaveState('idle'); setIsEditing(false);
    try {
      let data;
      if (cityQueue.length > 1) {
        const multiPayload = {
          cities: cityQueue.map(c => ({ destination: c.name, days: c.days })),
          budget,
          interests: interests.join(', '),
          travelStyle: style,
        };
        data = await plannerApi.generateMultiCityItinerary(multiPayload);
      } else {
        const singlePayload = {
          destination: cityQueue[0]?.name || 'Rajasthan',
          days: cityQueue[0]?.days || 7,
          budget,
          interests: interests.join(', '),
          travelStyle: style,
        };
        data = await plannerApi.generateItinerary(singlePayload);
      }

      setItinerary(data);
      setActiveDay(1);
    } catch (err) {
      setError(err.message || 'Unable to generate itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const regenerateDay = async (dayNumber) => {
    setRegenDay(dayNumber);
    try {
      const targetDayObj = itinerary?.days?.find(d => d.day === dayNumber);
      const newDay = await plannerApi.regenerateDay({
        destination: itinerary.destination,
        city: targetDayObj?.city || undefined,
        dayNumber,
        totalDays: itinerary.days.length,
      });
      setItinerary(prev => ({
        ...prev,
        days: prev.days.map(d => d.day === dayNumber ? newDay : d),
      }));
    } catch (err) {
      setError(err.message || 'Could not regenerate that day. Please try again.');
    } finally {
      setRegenDay(null);
    }
  };

  const handleDayFieldChange = (dayNumber, field, value) => {
    setItinerary(prev => ({
      ...prev,
      days: prev.days.map(d => d.day === dayNumber ? { ...d, [field]: value } : d),
    }));
  };

  const saveItinerary = async () => {
    setSaveState('saving');
    try {
      await plannerApi.saveItinerary(itinerary);
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  };

  const current = itinerary?.days?.find(d => d.day === activeDay);

  return (
    <div className="atp-card">
      <div className="atp-greeting">
        <div className="atp-avatar">✦</div>
        <div style={{flex:1}}>
          <div className="atp-gname">Welcome back, {userName}</div>
          <div className="atp-gsub">Your multi-city AI travel companion is ready</div>
        </div>
        <div className="atp-badge">
          {cityQueue.length > 1 ? `${cityQueue.length} Cities Route` : 'AI Planner'}
        </div>
      </div>

      {/* Destination Quick-Picks */}
      <label className="atp-label">
        Select Destinations (Click to add to your route)
      </label>
      <div className="atp-dest-grid">
        {DESTINATIONS.map(d => {
          const inQueue = cityQueue.some(c => c.name.toLowerCase() === d.n.toLowerCase());
          return (
            <div
              key={d.n}
              className={`atp-dest-chip${inQueue ? ' sel' : ''}`}
              onClick={() => handleSelectChip(d)}
            >
              {d.e} {d.n} {inQueue && <span style={{fontSize:10, opacity:0.8}}>✓</span>}
            </div>
          );
        })}
      </div>

      {/* Multi-City Ordered Queue */}
      <div className="atp-queue-box">
        <div className="atp-queue-header">
          <div className="atp-queue-title">
            <span>🗺️ Ordered City Itinerary</span>
            <span style={{fontSize:12, fontWeight:400, color:'rgba(253,246,236,0.6)'}}>
              ({totalTripDays} Total Days)
            </span>
          </div>
          <button
            type="button"
            className="atp-add-city-btn"
            onClick={() => handleAddCity('Udaipur', '🌅')}
          >
            + Add Another City
          </button>
        </div>

        <div className="atp-queue-list">
          {cityQueue.map((c, idx) => (
            <div key={c.id || idx} className="atp-queue-item">
              <div className="atp-queue-left">
                <span className="atp-queue-order">{idx + 1}</span>
                <span style={{fontSize:18}}>{c.emoji || '📍'}</span>
                <div>
                  <div className="atp-queue-cityname">{c.name}</div>
                  <div style={{fontSize:11, color:'rgba(245,166,35,0.7)'}}>Stop #{idx + 1}</div>
                </div>
              </div>

              <div className="atp-queue-right">
                <div className="atp-days-control">
                  <span>Days:</span>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={c.days}
                    onChange={(e) => handleCityDaysChange(c.id, e.target.value)}
                    className="atp-days-input"
                  />
                </div>

                <div style={{display:'flex', gap:4}}>
                  <button
                    type="button"
                    title="Move stop earlier"
                    className="atp-reorder-btn"
                    disabled={idx === 0}
                    onClick={() => handleMoveCity(idx, -1)}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    title="Move stop later"
                    className="atp-reorder-btn"
                    disabled={idx === cityQueue.length - 1}
                    onClick={() => handleMoveCity(idx, 1)}
                  >
                    ▼
                  </button>
                </div>

                {cityQueue.length > 1 && (
                  <button
                    type="button"
                    title="Remove city from route"
                    className="atp-remove-city-btn"
                    onClick={() => handleRemoveCity(c.id)}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {cityQueue.length > 1 && (
          <div className="atp-route-preview">
            <span style={{fontWeight:600, color:'#FFB347'}}>Route Trail:</span>
            {cityQueue.map((c, i) => (
              <React.Fragment key={c.id || i}>
                <span>{c.name} ({c.days}d)</span>
                {i < cityQueue.length - 1 && <span style={{color:'rgba(255,107,26,0.8)'}}>➔</span>}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Budget & Style */}
      <div className="atp-row2">
        <div>
          <label className="atp-label">Budget Tier</label>
          <select className="atp-select" value={budget} onChange={e=>setBudget(e.target.value)}>
            <option value="budget">Budget (₹2k–4k/day)</option>
            <option value="mid-range">Mid-Range (₹5k–10k/day)</option>
            <option value="luxury">Luxury (₹15k–30k/day)</option>
            <option value="ultra-luxury">Ultra-Luxury (₹30k+/day)</option>
          </select>
        </div>
        <div>
          <label className="atp-label">Travel Style</label>
          <select className="atp-select" value={style} onChange={e=>setStyle(e.target.value)}>
            {['Cultural Immersion','Adventure & Trekking','Luxury & Wellness','Family-Friendly',
              'Solo Explorer','Romantic Getaway','Spiritual Journey','Photography Expedition'].map(s=>(
              <option key={s} value={s.toLowerCase().split(' ')[0]}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Interests */}
      <label className="atp-label">Your Interests</label>
      <div className="atp-interests">
        {INTERESTS.map(({e,l})=>(
          <div key={l} className={`atp-int-chip${interests.includes(l)?' sel':''}`} onClick={()=>toggleInterest(l)}>
            {e} {l}
          </div>
        ))}
      </div>

      {/* Generate Action Button */}
      <button className={`atp-gen-btn${loading?' loading':''}`} onClick={generate} disabled={loading}>
        {loading ? (
          <><div className="atp-spinner"/>Crafting Your Multi-City Route…</>
        ) : (
          <>✦ Generate Full Plan ({totalTripDays} Days across {cityQueue.length} {cityQueue.length > 1 ? 'Cities' : 'City'})</>
        )}
      </button>

      {error && <div className="atp-error">⚠️ {error}</div>}

      {/* Results View */}
      {itinerary && current && (
        <div className="atp-result">
          <div className="atp-res-hdr">
            <div className="atp-res-title">
              Your {itinerary.days.length}-Day Expedition: {itinerary.destination}
            </div>
            <div className="atp-res-tags">
              {itinerary.isFallback && (
                <span className="atp-res-tag" style={{ background: 'rgba(255,107,26,0.15)', borderColor: 'rgba(255,107,26,0.35)', color: '#FFB347' }}>
                  ✦ Curated Route
                </span>
              )}
              <span className="atp-res-tag">✦ {budget}</span>
              <span className="atp-res-tag">📍 {itinerary.destination}</span>
            </div>
          </div>

          {/* Day Tabs - Multi-City vs Single-City */}
          {(() => {
            const uniqueCities = Array.from(new Set(itinerary.days.map(d => d.city).filter(Boolean)));
            const isMultiCity = (itinerary.cities && itinerary.cities.length > 1) || uniqueCities.length > 1 || (typeof itinerary.destination === 'string' && itinerary.destination.includes('→'));

            if (isMultiCity) {
              // Group consecutive days by city
              const cityGroups = [];
              itinerary.days.forEach(d => {
                const cityName = d.city || 'City';
                const last = cityGroups[cityGroups.length - 1];
                if (last && last.city === cityName) {
                  last.days.push(d);
                } else {
                  cityGroups.push({ city: cityName, days: [d] });
                }
              });

              return (
                <div className="atp-city-tab-cluster">
                  {cityGroups.map((group, gIdx) => (
                    <React.Fragment key={group.city + '-' + gIdx}>
                      <div className="atp-city-group">
                        <span className="atp-city-group-label">📍 {group.city}:</span>
                        <div style={{ display: 'inline-flex', gap: '5px' }}>
                          {group.days.map(d => (
                            <button
                              key={d.day}
                              type="button"
                              className={`atp-day-tab-pill${d.day === activeDay ? ' active' : ''}`}
                              onClick={() => setActiveDay(d.day)}
                              title={`Day ${d.day} (${group.city})`}
                            >
                              {d.day}
                            </button>
                          ))}
                        </div>
                      </div>
                      {gIdx < cityGroups.length - 1 && (
                        <span className="atp-city-group-divider">|</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              );
            }

            // Single city rendering path unchanged
            return (
              <div className="atp-day-tabs">
                {itinerary.days.map(d => (
                  <div
                    key={d.day}
                    className={`atp-day-tab${d.day === activeDay ? ' active' : ''}`}
                    onClick={() => setActiveDay(d.day)}
                  >
                    Day {d.day}
                  </div>
                ))}
              </div>
            );
          })()}

          <div className="atp-itin">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, flexWrap:'wrap', gap:10}}>
              {isEditing ? (
                <input
                  type="text"
                  value={current.title}
                  onChange={(e) => handleDayFieldChange(current.day, 'title', e.target.value)}
                  className="atp-select"
                  style={{maxWidth:'360px', fontWeight:600}}
                />
              ) : (
                <div>
                  <div style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
                    <h3 className="atp-day-title" style={{margin:0}}>
                      Day {current.day} — {current.title}
                    </h3>
                    {current.city && (
                      <span style={{
                        fontSize:12,
                        color:'#FFB347',
                        background:'rgba(255,107,26,0.15)',
                        border:'1px solid rgba(255,107,26,0.3)',
                        padding:'2px 10px',
                        borderRadius:99,
                        fontWeight:600,
                        display:'inline-flex',
                        alignItems:'center',
                        gap:4
                      }}>
                        📍 {current.city}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <button
                className="atp-act-btn sec"
                onClick={() => setIsEditing(!isEditing)}
                style={{padding:'6px 14px', fontSize:'12px'}}
              >
                {isEditing ? '✓ Done Editing' : '✏️ Edit Day'}
              </button>
            </div>

            <div className="atp-day-block">
              <div className="atp-day-block-label">Morning</div>
              {isEditing ? (
                <textarea
                  className="atp-select"
                  rows={2}
                  value={current.morning}
                  onChange={(e) => handleDayFieldChange(current.day, 'morning', e.target.value)}
                />
              ) : (
                <div>{current.morning}</div>
              )}
            </div>

            <div className="atp-day-block">
              <div className="atp-day-block-label">Afternoon</div>
              {isEditing ? (
                <textarea
                  className="atp-select"
                  rows={2}
                  value={current.afternoon}
                  onChange={(e) => handleDayFieldChange(current.day, 'afternoon', e.target.value)}
                />
              ) : (
                <div>{current.afternoon}</div>
              )}
            </div>

            <div className="atp-day-block">
              <div className="atp-day-block-label">Evening</div>
              {isEditing ? (
                <textarea
                  className="atp-select"
                  rows={2}
                  value={current.evening}
                  onChange={(e) => handleDayFieldChange(current.day, 'evening', e.target.value)}
                />
              ) : (
                <div>{current.evening}</div>
              )}
            </div>

            <div className="atp-day-block">
              <div className="atp-day-block-label">Meals</div>
              {isEditing ? (
                <input
                  type="text"
                  className="atp-select"
                  value={current.meals}
                  onChange={(e) => handleDayFieldChange(current.day, 'meals', e.target.value)}
                />
              ) : (
                <div>{current.meals}</div>
              )}
            </div>

            <div className="atp-day-block">
              <div className="atp-day-block-label">Budget</div>
              {isEditing ? (
                <input
                  type="text"
                  className="atp-select"
                  value={current.estimatedBudgetINR}
                  onChange={(e) => handleDayFieldChange(current.day, 'estimatedBudgetINR', e.target.value)}
                />
              ) : (
                <div>{current.estimatedBudgetINR}</div>
              )}
            </div>

            <div className="atp-day-tip">
              <b>Tip — </b>
              {isEditing ? (
                <input
                  type="text"
                  className="atp-select"
                  style={{marginTop:'6px'}}
                  value={current.tips}
                  onChange={(e) => handleDayFieldChange(current.day, 'tips', e.target.value)}
                />
              ) : (
                current.tips
              )}
            </div>
          </div>

          <div className="atp-res-actions">
            <button className="atp-act-btn pri" onClick={saveItinerary} disabled={saveState==='saving'}>
              📥 {saveState==='saving' ? 'Saving…' : saveState==='saved' ? 'Saved to Dashboard' : 'Save Itinerary'}
            </button>
            <button
              className="atp-act-btn sec"
              onClick={()=>regenerateDay(current.day)}
              disabled={regenDay===current.day}
            >
              🔄 {regenDay===current.day ? 'Regenerating…' : `Regenerate Day ${current.day}`}
            </button>
          </div>
          {saveState==='saved' && <div className="atp-saved-note">✓ Itinerary successfully saved! View it anytime in your dashboard.</div>}
          {saveState==='error' && <div className="atp-saved-note" style={{color:'#ff9999'}}>Couldn't save — please try again.</div>}
        </div>
      )}
    </div>
  );
}

/* ─── Export ──────────────────────────────────────────────────────────────── */
export default function AITripPlanner({ isLoggedIn = false, userName, onLoginRequest }) {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn);

  React.useEffect(() => {
    setLoggedIn(isLoggedIn);
  }, [isLoggedIn]);

  return (
    <>
      <style>{css}</style>
      <section id="ai-trip-planner" className="atp-section">
        <div className="atp-orb atp-orb-1"/><div className="atp-orb atp-orb-2"/><div className="atp-orb atp-orb-3"/>
        <div className="atp-wrap">
          <div className="atp-hdr">
            <div className="atp-eyebrow">AI-Powered Planning</div>
            <h2 className="atp-h2">Plan Your <em>Perfect</em> Journey<br/>Across India</h2>
            <p className="atp-sub">Our AI travel companion crafts deeply personal itineraries — built around your pace, taste, and curiosity.</p>
          </div>
          {loggedIn
            ? <UnlockedPlanner userName={userName}/>
            : <LockedPlanner onLogin={() => onLoginRequest ? onLoginRequest() : setLoggedIn(true)}/>}
        </div>
      </section>
    </>
  );
}