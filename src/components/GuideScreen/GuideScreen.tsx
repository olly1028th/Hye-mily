import { useState } from 'react';
import { useGameContext } from '../../context/GameContext';
import { SPECIES_CONFIGS, STAGE_LABELS } from '../../constants';
import './GuideScreen.css';

type Section = 'levelup' | 'stats' | 'gameover' | 'coins' | 'species';

const SECTIONS: { id: Section; icon: string; label: string }[] = [
  { id: 'levelup', icon: 'upgrade', label: '성장' },
  { id: 'stats', icon: 'monitoring', label: '스탯' },
  { id: 'gameover', icon: 'heart_broken', label: '떠남' },
  { id: 'coins', icon: 'monetization_on', label: '코인' },
  { id: 'species', icon: 'pets', label: '종류' },
];

export default function GuideScreen() {
  const { state } = useGameContext();
  const [activeSection, setActiveSection] = useState<Section>('levelup');
  const pet = state.pet;

  return (
    <div className="guide-screen">
      <div className="guide-header">
        <h2 className="guide-title">게임 가이드</h2>
        <p className="guide-desc">레벨업 조건부터 스탯 관리까지 알아보세요</p>
      </div>

      {/* Section tabs */}
      <div className="guide-tabs no-scrollbar">
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            className={`guide-tab ${activeSection === sec.id ? 'active' : ''}`}
            onClick={() => setActiveSection(sec.id)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{sec.icon}</span>
            <span>{sec.label}</span>
          </button>
        ))}
      </div>

      <div className="guide-content">
        {activeSection === 'levelup' && <LevelUpGuide />}
        {activeSection === 'stats' && <StatsGuide />}
        {activeSection === 'gameover' && <GameOverGuide />}
        {activeSection === 'coins' && <CoinsGuide />}
        {activeSection === 'species' && <SpeciesGuide currentSpecies={pet?.species} />}
      </div>
    </div>
  );
}

function LevelUpGuide() {
  return (
    <div className="guide-section">
      <div className="guide-card">
        <h3 className="guide-card-title">
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>emoji_events</span>
          성장 단계
        </h3>
        <div className="guide-stages">
          <div className="guide-stage">
            <span className="guide-stage-icon">🐣</span>
            <div>
              <strong>아기 (Lv.1)</strong>
              <p>스탯 감소가 빠르지만 액션 효과도 커요. 자주 돌봐주세요!</p>
            </div>
          </div>
          <div className="guide-arrow">→</div>
          <div className="guide-stage">
            <span className="guide-stage-icon">🐾</span>
            <div>
              <strong>청소년 (Lv.5)</strong>
              <p>균형 잡힌 시기. 경험치 효율이 좋아요.</p>
            </div>
          </div>
          <div className="guide-arrow">→</div>
          <div className="guide-stage">
            <span className="guide-stage-icon">⭐</span>
            <div>
              <strong>성인 (Lv.10)</strong>
              <p>스탯 감소가 느려져 안정적이에요.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="guide-card">
        <h3 className="guide-card-title">
          <span className="material-symbols-outlined" style={{ color: '#059669' }}>checklist</span>
          진화 조건
        </h3>
        <ul className="guide-list">
          <li><strong>경험치(EXP)</strong> — 액션으로 경험치를 모으세요 (놀아주기가 가장 많아요!)</li>
          <li><strong>최소 나이</strong> — 일정 틱 수 이상 생존해야 해요</li>
          <li><strong>최소 스탯</strong> — 종별 핵심 스탯이 일정 수준 이상이어야 해요</li>
          <li>세 가지 조건을 <strong>모두 충족</strong>해야 다음 단계로 성장해요!</li>
        </ul>
      </div>
    </div>
  );
}

function StatsGuide() {
  return (
    <div className="guide-section">
      <div className="guide-card">
        <h3 className="guide-card-title">
          <span className="material-symbols-outlined" style={{ color: '#0284c7' }}>info</span>
          스탯 시스템
        </h3>
        <div className="guide-stat-list">
          <div className="guide-stat-item">
            <span className="guide-stat-dot" style={{ background: '#fff9db' }} />
            <div>
              <strong>배고픔</strong>
              <p>0이면 굶주림 상태. 밥 주기로 회복. 매 틱마다 감소해요.</p>
            </div>
          </div>
          <div className="guide-stat-item">
            <span className="guide-stat-dot" style={{ background: '#fff0f6' }} />
            <div>
              <strong>행복도</strong>
              <p>놀아주기로 회복. 싫어하는 액션은 행복도가 -8 떨어져요.</p>
            </div>
          </div>
          <div className="guide-stat-item">
            <span className="guide-stat-dot" style={{ background: '#e6fcf5' }} />
            <div>
              <strong>에너지</strong>
              <p>재우기로 크게 회복. 놀면 에너지가 소모돼요.</p>
            </div>
          </div>
          <div className="guide-stat-item">
            <span className="guide-stat-dot" style={{ background: '#e0f2fe' }} />
            <div>
              <strong>청결도</strong>
              <p>씻기기로 회복. 고양이는 특히 청결에 민감해요.</p>
            </div>
          </div>
          <div className="guide-stat-item">
            <span className="guide-stat-dot" style={{ background: '#fee2e2' }} />
            <div>
              <strong>건강</strong>
              <p>치료하기로 회복. <strong>0이 되면 반려동물이 떠나요!</strong></p>
            </div>
          </div>
        </div>
      </div>

      <div className="guide-card guide-card-warn">
        <h3 className="guide-card-title">
          <span className="material-symbols-outlined" style={{ color: '#dc2626' }}>warning</span>
          위험 수준 (20 이하)
        </h3>
        <ul className="guide-list">
          <li>스탯이 <strong>20 이하</strong>로 떨어지면 위험 상태에요</li>
          <li>위험 스탯 1개당 <strong>건강 -2</strong>가 추가로 적용돼요</li>
          <li>종별 <strong>취약 스탯</strong>이 위험이면 건강 감소가 더 커요!</li>
          <li>여러 스탯이 동시에 위험하면 건강이 급속히 떨어져요</li>
        </ul>
      </div>

      <div className="guide-card">
        <h3 className="guide-card-title">
          <span className="material-symbols-outlined" style={{ color: '#7c3aed' }}>balance</span>
          오버케어 주의
        </h3>
        <p className="guide-text">
          스탯이 이미 높은 상태(85~90 이상)에서 같은 액션을 반복하면
          효과가 <strong>70% 감소</strong>해요. 골고루 돌봐주는 게 효율적이에요!
        </p>
      </div>
    </div>
  );
}

function GameOverGuide() {
  return (
    <div className="guide-section">
      <div className="guide-card guide-card-warn">
        <h3 className="guide-card-title">
          <span className="material-symbols-outlined" style={{ color: '#dc2626' }}>heart_broken</span>
          반려동물이 떠나는 조건
        </h3>
        <div className="guide-goodbye-flow">
          <div className="guide-flow-step">
            <div className="guide-flow-num">1</div>
            <p>스탯이 하나씩 <strong>위험 수준(20 이하)</strong>으로 떨어짐</p>
          </div>
          <div className="guide-flow-step">
            <div className="guide-flow-num">2</div>
            <p>위험 스탯마다 <strong>건강이 추가로 감소</strong> (틱당 -2 × 위험 스탯 수)</p>
          </div>
          <div className="guide-flow-step">
            <div className="guide-flow-num">3</div>
            <p>종별 취약 스탯이 위험이면 <strong>추가 페널티</strong> (-3~5)</p>
          </div>
          <div className="guide-flow-step guide-flow-final">
            <div className="guide-flow-num">💫</div>
            <p><strong>건강이 0</strong>이 되면 반려동물이 먼 여행을 떠나요</p>
          </div>
        </div>
      </div>

      <div className="guide-card">
        <h3 className="guide-card-title">
          <span className="material-symbols-outlined" style={{ color: '#059669' }}>tips_and_updates</span>
          떠남을 막는 팁
        </h3>
        <ul className="guide-list">
          <li>스탯이 <strong>30 이하</strong>로 내려가기 전에 미리 관리하세요</li>
          <li>취약 스탯을 최우선으로 관리해주세요</li>
          <li>상점에서 <strong>비타민 젤리</strong>를 사면 건강을 빠르게 회복할 수 있어요</li>
          <li>좋아하는 액션을 해주면 <strong>보너스 효과</strong>가 있어요!</li>
          <li>오프라인 시간이 길면 스탯이 많이 떨어지니 자주 접속하세요</li>
        </ul>
      </div>
    </div>
  );
}

function CoinsGuide() {
  return (
    <div className="guide-section">
      <div className="guide-card">
        <h3 className="guide-card-title">
          <span className="material-symbols-outlined" style={{ color: '#ea580c' }}>monetization_on</span>
          코인 획득 방법
        </h3>
        <div className="guide-coin-table">
          <div className="guide-coin-row">
            <span>🎮 미니게임</span>
            <strong>잡은 개수 × 10 코인</strong>
          </div>
          <div className="guide-coin-row">
            <span>🍖 밥 주기</span>
            <strong>+3 코인</strong>
          </div>
          <div className="guide-coin-row">
            <span>🛁 씻기기</span>
            <strong>+4 코인</strong>
          </div>
          <div className="guide-coin-row">
            <span>💤 재우기</span>
            <strong>+2 코인</strong>
          </div>
          <div className="guide-coin-row">
            <span>💊 치료하기</span>
            <strong>+2 코인</strong>
          </div>
        </div>
        <p className="guide-tip">💡 미니게임이 가장 효율적이에요! 8개 이상 잡으면 80코인!</p>
      </div>

      <div className="guide-card">
        <h3 className="guide-card-title">
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>shopping_bag</span>
          코인 사용처
        </h3>
        <ul className="guide-list">
          <li><strong>간식</strong> — 배고픔과 행복도를 즉시 회복 (20~80코인)</li>
          <li><strong>장난감</strong> — 행복도와 에너지 관리 (50~100코인)</li>
          <li><strong>케어용품</strong> — 청결도와 건강 회복 (35~60코인)</li>
          <li>구매 즉시 효과가 적용돼요. 쿨타임 없이 바로 사용 가능!</li>
        </ul>
      </div>
    </div>
  );
}

function SpeciesGuide({ currentSpecies }: { currentSpecies?: string }) {
  const speciesList = Object.values(SPECIES_CONFIGS);

  return (
    <div className="guide-section">
      {speciesList.map((config) => {
        const isActive = config.species === currentSpecies;

        return (
          <div key={config.species} className={`guide-card ${isActive ? 'guide-card-active' : ''}`}>
            <h3 className="guide-card-title">
              {config.species === 'cat' ? '🐱' : config.species === 'dog' ? '🐶' : config.species === 'lizard' ? '🦎' : '🦔'}
              {' '}{config.displayName}
              {isActive && <span className="guide-current-badge">내 펫</span>}
            </h3>
            <p className="guide-text">{config.description}</p>

            <div className="guide-species-details">
              <div className="guide-detail-row">
                <span className="guide-detail-label">좋아하는 액션</span>
                <span className="guide-detail-value positive">{actionLabel(config.favoriteAction)}</span>
              </div>
              <div className="guide-detail-row">
                <span className="guide-detail-label">싫어하는 액션</span>
                <span className="guide-detail-value negative">{actionLabel(config.dislikedAction)}</span>
              </div>
              <div className="guide-detail-row">
                <span className="guide-detail-label">취약 스탯</span>
                <span className="guide-detail-value warn">{statLabelKo(config.vulnerableStat)} (패널티 -{config.vulnerabilityPenalty})</span>
              </div>
              <div className="guide-detail-row">
                <span className="guide-detail-label">오버케어 임계</span>
                <span className="guide-detail-value">{config.overcareThreshold} 이상</span>
              </div>
            </div>

            <div className="guide-evolution-info">
              <h4>진화 조건</h4>
              <div className="guide-evo-steps">
                <div className="guide-evo-step">
                  <span>{STAGE_LABELS.baby} → {STAGE_LABELS.teen}</span>
                  <span>EXP {config.evolution[0].exp} · 나이 {config.evolution[0].minAge}틱</span>
                </div>
                <div className="guide-evo-step">
                  <span>{STAGE_LABELS.teen} → {STAGE_LABELS.adult}</span>
                  <span>EXP {config.evolution[1].exp} · 나이 {config.evolution[1].minAge}틱</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function actionLabel(action: string): string {
  const map: Record<string, string> = {
    feed: '밥 주기 🍖',
    play: '놀아주기 🎾',
    clean: '씻기기 🛁',
    sleep: '재우기 💤',
    heal: '치료하기 💊',
  };
  return map[action] ?? action;
}

function statLabelKo(key: string): string {
  const map: Record<string, string> = {
    hunger: '배고픔',
    happiness: '행복도',
    energy: '에너지',
    cleanliness: '청결도',
    health: '건강',
  };
  return map[key] ?? key;
}
