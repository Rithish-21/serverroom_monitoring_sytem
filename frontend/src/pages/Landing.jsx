import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import {
  Thermometer,
  Droplets,
  Wind,
  Flame,
  Zap,
  Shield,
  Activity,
  Server,
  ArrowRight
} from 'lucide-react';

const LandingHero3D = lazy(() =>
  import('../components/three/LandingHero3D.jsx').then((m) => ({ default: m.LandingHero3D }))
);

export const Landing = () => {
  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', color: '#fff', position: 'relative' }}>
      {/* Navigation Header */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 48px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #0284c7, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px var(--primary-glow)' }}>
            <Server size={22} color="#fff" />
          </div>
          <div>
            <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '0.04em' }}>SENTINEL<span style={{ color: 'var(--primary)' }}>CORE</span></span>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>MISSION CRITICAL MONITORING</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px' }}>
          <Link to="/user/login" className="btn btn-secondary">User Portal</Link>
          <Link to="/admin/login" className="btn btn-primary">Admin Portal</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ position: 'relative', height: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px', overflow: 'hidden' }}>
        <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: '#070a13' }} />}>
          <LandingHero3D />
        </Suspense>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '850px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', marginBottom: '20px' }}>
            <Activity size={14} color="var(--primary)" />
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary)', letterSpacing: '0.05em' }}>NEXT-GEN 3D DIGITAL TWIN TELEMETRY</span>
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: '800', lineHeight: '1.1', marginBottom: '20px' }}>
            Next-Gen Server Room <br />
            <span style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Environment Monitoring
            </span>
          </h1>

          <p style={{ fontSize: '17px', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '680px', margin: '0 auto 36px' }}>
            High-precision 3D digital twin surveillance for enterprise datacenters. Real-time temperature, humidity, airflow, leak detection, and predictive thermal runaway alerts.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/admin/login" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '15px' }}>
              Admin Access <ArrowRight size={16} />
            </Link>
            <Link to="/user/login" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '15px' }}>
              Operator Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Key Environmental Features Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px' }}>Critical Parameter Monitoring</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Continuous sensor acquisition adhering to ASHRAE thermal guidelines for datacenters.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {[
            { icon: Thermometer, title: 'Temperature', desc: 'Rack intake & exhaust thermal gradient tracking with predictive slope warnings.', color: '#38bdf8' },
            { icon: Droplets, title: 'Relative Humidity', desc: 'Electrostatic discharge and condensation prevention between 40% - 60% RH.', color: '#06b6d4' },
            { icon: Wind, title: 'Airflow & Pressure', desc: 'Under-floor plenum air velocity monitoring and CRAC delivery verification.', color: '#10b981' },
            { icon: Zap, title: 'Power & PUE', desc: 'Real-time rack PDU load measurements and energy efficiency metrics.', color: '#f59e0b' },
            { icon: Flame, title: 'Smoke & Leakage', desc: 'Optical ceiling ionization and under-floor water leak ribbon detection.', color: '#ef4444' }
          ].map((item, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <item.icon size={22} color={item.color} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>{item.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', marginBottom: '8px' }}>How SentinelCore Works</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>End-to-end resilient architecture from IoT edge probes to predictive telemetry twin.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[
            { step: '01', title: 'Edge Telemetry', desc: 'Calibrated sensors gather thermal and environmental data every 3 seconds.' },
            { step: '02', title: 'Real-Time Stream', desc: 'Low-latency Socket.IO gateway transmits metrics directly to the active 3D twin.' },
            { step: '03', title: 'Predictive Engine', desc: 'Rate-of-change analytics detect heat rises minutes before threshold breach.' },
            { step: '04', title: 'Actionable Alerts', desc: 'Instantaneous multi-channel dispatch with live incident acknowledgment.' }
          ].map((step, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{step.step}</span>
              <h4 style={{ fontSize: '15px', fontWeight: '700', margin: '8px 0 6px' }}>{step.title}</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '40px 24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
        <p>© 2026 SentinelCore Server Room Environment Monitoring System. All rights reserved.</p>
      </footer>
    </div>
  );
};
