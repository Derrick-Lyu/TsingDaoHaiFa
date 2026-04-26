import type { ReactNode } from 'react'
import { MAJOR_MODELS, type MajorModelIcon } from '../../data/pages/majorDomainModelData'

type MajorDomainModelProps = {
  onPrompt: (text: string) => void
}


function renderMajorModelIcon(icon: MajorModelIcon): ReactNode {
  switch (icon) {
    case 'holdingNoControl':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="5" r="2.5" stroke="rgba(255,255,255,.9)" strokeWidth="1.2"></circle>
          <circle cx="3" cy="12" r="2" stroke="rgba(255,255,255,.9)" strokeWidth="1.2"></circle>
          <circle cx="13" cy="12" r="2" stroke="rgba(255,255,255,.9)" strokeWidth="1.2"></circle>
          <path d="M8 7.5v2M8 9.5l-4 1.5M8 9.5l4 1.5" stroke="rgba(255,255,255,.9)" strokeWidth="1.2" strokeLinecap="round"></path>
          <path d="M5.5 8.5L3 10M10.5 8.5L13 10" stroke="rgba(255,255,255,.5)" strokeWidth="1" strokeLinecap="round" strokeDasharray="1.5 1.5"></path>
        </svg>
      )
    case 'fakeControl':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="6" width="5" height="4" rx="1" stroke="rgba(255,255,255,.9)" strokeWidth="1.2"></rect>
          <rect x="9" y="3" width="5" height="4" rx="1" stroke="rgba(255,255,255,.4)" strokeWidth="1.2" strokeDasharray="2 1.5"></rect>
          <path d="M7 8h2M9 5h0" stroke="rgba(255,255,255,.9)" strokeWidth="1.2" strokeLinecap="round"></path>
          <circle cx="4.5" cy="12" r="1.5" stroke="rgba(255,255,255,.7)" strokeWidth="1.2"></circle>
          <path d="M4.5 10.5V8" stroke="rgba(255,255,255,.7)" strokeWidth="1.2" strokeLinecap="round"></path>
        </svg>
      )
    case 'multiLayer':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="2.5" r="1.5" stroke="rgba(255,255,255,.9)" strokeWidth="1.2"></circle>
          <circle cx="4" cy="7" r="1.5" stroke="rgba(255,255,255,.9)" strokeWidth="1.2"></circle>
          <circle cx="12" cy="7" r="1.5" stroke="rgba(255,255,255,.9)" strokeWidth="1.2"></circle>
          <circle cx="2" cy="12" r="1.5" stroke="rgba(255,255,255,.7)" strokeWidth="1.2"></circle>
          <circle cx="6" cy="12" r="1.5" stroke="rgba(255,255,255,.7)" strokeWidth="1.2"></circle>
          <circle cx="10" cy="12" r="1.5" stroke="rgba(255,255,255,.7)" strokeWidth="1.2"></circle>
          <path d="M8 4V5.5M4 8.5V10.5M12 8.5V10.5M8 4l-3.5 1.5M8 4l3.5 1.5" stroke="rgba(255,255,255,.6)" strokeWidth="1" strokeLinecap="round"></path>
        </svg>
      )
    case 'unrelatedDiversification':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="3" stroke="rgba(255,255,255,.9)" strokeWidth="1.2"></circle>
          <circle cx="2.5" cy="4" r="1.5" stroke="rgba(255,255,255,.6)" strokeWidth="1.2"></circle>
          <circle cx="13.5" cy="4" r="1.5" stroke="rgba(255,255,255,.6)" strokeWidth="1.2"></circle>
          <circle cx="2.5" cy="12" r="1.5" stroke="rgba(255,255,255,.6)" strokeWidth="1.2"></circle>
          <path d="M5.5 7L4 5.5M10.5 9L12 10.5M5 9L3.5 10.5" stroke="rgba(255,255,255,.5)" strokeWidth="1" strokeLinecap="round" strokeDasharray="1.5 1.5"></path>
          <path d="M5.5 8.5l-3 0" stroke="rgba(255,255,255,.4)" strokeWidth="1"></path>
        </svg>
      )
    case 'affiliationViolation':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1.5" y="2.5" width="13" height="9" rx="1.2" stroke="rgba(255,255,255,.9)" strokeWidth="1.2"></rect>
          <path d="M5 6.5h6M5 9h4" stroke="rgba(255,255,255,.7)" strokeWidth="1" strokeLinecap="round"></path>
          <circle cx="11.5" cy="9" r="1.5" fill="rgba(255,100,100,.8)"></circle>
          <path d="M8 11.5v2M6 13.5h4" stroke="rgba(255,255,255,.7)" strokeWidth="1.2" strokeLinecap="round"></path>
        </svg>
      )
    case 'rentSeeking':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="5" r="2.5" stroke="rgba(255,255,255,.9)" strokeWidth="1.2"></circle>
          <path d="M3 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="rgba(255,255,255,.9)" strokeWidth="1.2" strokeLinecap="round"></path>
          <path d="M11 8.5l2 1.5-2 1" stroke="rgba(255,180,180,.8)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      )
    case 'circularBilling':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 8c0 0 2-5 6-5s6 5 6 5" stroke="rgba(255,255,255,.9)" strokeWidth="1.2" strokeLinecap="round"></path>
          <path d="M14 8c0 0-2 5-6 5S2 8 2 8" stroke="rgba(255,255,255,.5)" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 1.5"></path>
          <circle cx="8" cy="8" r="2" stroke="rgba(255,255,255,.9)" strokeWidth="1.2"></circle>
          <path d="M11 5l2-2M5 11l-2 2" stroke="rgba(255,220,255,.7)" strokeWidth="1" strokeLinecap="round"></path>
        </svg>
      )
    case 'tradeFinancing':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="4.5" width="12" height="8" rx="1.2" stroke="rgba(255,255,255,.9)" strokeWidth="1.2"></rect>
          <path d="M5 4.5V3.5a1 1 0 011-1h4a1 1 0 011 1v1" stroke="rgba(255,255,255,.7)" strokeWidth="1.2"></path>
          <path d="M2 8.5h12" stroke="rgba(255,255,255,.5)" strokeWidth="1"></path>
          <path d="M6 8.5v1.5a2 2 0 004 0V8.5" stroke="rgba(255,255,255,.9)" strokeWidth="1.2" strokeLinecap="round"></path>
        </svg>
      )
    case 'excessiveDebt':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 12L6 7l3 3 2-4 2 4" stroke="rgba(255,255,255,.9)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M2 12h12" stroke="rgba(255,255,255,.5)" strokeWidth="1"></path>
          <path d="M12 4v3M10.5 4.5L12 3l1.5 1.5" stroke="rgba(255,200,180,.8)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      )
    case 'overseasRisk':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="5.5" stroke="rgba(255,255,255,.9)" strokeWidth="1.2"></circle>
          <path d="M8 2.5c-2 2-2 7 0 11M8 2.5c2 2 2 7 0 11" stroke="rgba(255,255,255,.6)" strokeWidth="1"></path>
          <path d="M2.5 8h11" stroke="rgba(255,255,255,.5)" strokeWidth="1"></path>
          <path d="M3.5 5.5h9M3.5 10.5h9" stroke="rgba(255,255,255,.3)" strokeWidth="1"></path>
        </svg>
      )
    case 'financialDisorder':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1.5" y="5" width="5" height="8" rx="1" stroke="rgba(255,255,255,.9)" strokeWidth="1.2"></rect>
          <rect x="5.5" y="3" width="5" height="10" rx="1" stroke="rgba(255,255,255,.7)" strokeWidth="1.2"></rect>
          <rect x="9.5" y="1.5" width="5" height="11.5" rx="1" stroke="rgba(255,255,255,.5)" strokeWidth="1.2"></rect>
          <path d="M1.5 9.5h13" stroke="rgba(255,200,100,.6)" strokeWidth="1" strokeDasharray="2 1.5"></path>
        </svg>
      )
  }
}

export function MajorDomainModel({ onPrompt }: MajorDomainModelProps) {
  return (
    <>
      <div className="mc-section-hd">
        <div className="mc-section-title">11类重点关注领域模型</div>
        <span className="mc-count-badge">共11个模型</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 8 }}>
        {MAJOR_MODELS.map((item) => (
          <div
            key={item.name}
            style={{ background: '#fff', border: '0.5px solid #dde4ec', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow .15s, transform .15s' }}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform = 'translateY(-2px)'
              event.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,.08)'
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = ''
              event.currentTarget.style.boxShadow = ''
            }}
            onClick={() => onPrompt(item.prompt)}
          >
            <div style={{ background: item.bg, padding: '18px 16px 14px', position: 'relative' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', marginBottom: 6, letterSpacing: '.5px' }}>{item.domain}</div>
              <div style={{ fontSize: 17, fontWeight: 500, color: '#fff', lineHeight: 1.3 }}>{item.name}</div>
              <div style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {renderMajorModelIcon(item.icon)}
              </div>
            </div>

            <div style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: '#6b84a0', lineHeight: 1.65, marginBottom: 10 }}>{item.desc}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 8, background: item.badgeBg, color: item.badgeColor, border: `0.5px solid ${item.badgeBorder}` }}>{item.badge}</span>
                <span style={{ fontSize: 11, color: '#1a3f6f' }}>查看详情 ↗</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
