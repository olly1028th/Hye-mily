import { BREED_CONFIGS, STAGE_LABELS } from '../../constants';
import { ACHIEVEMENTS } from '../../utils/progress';
import type { UserProgress } from '../../types';
import './Collection.css';

interface CollectionProps {
  progress: UserProgress;
  onClose: () => void;
}

export default function Collection({ progress, onClose }: CollectionProps) {
  const unlockedSet = new Set(progress.unlockedAchievements);

  return (
    <div className="collection-overlay">
      <div className="collection-panel">
        <div className="collection-header">
          <h2 className="collection-title">도감 & 업적</h2>
          <button className="collection-close" onClick={onClose}>✕</button>
        </div>

        {/* 탭: 도감 */}
        <section className="collection-section">
          <h3 className="section-title">도감 ({progress.petRecords.length}마리)</h3>
          {progress.petRecords.length === 0 ? (
            <p className="empty-text">아직 기록된 펫이 없어요.</p>
          ) : (
            <div className="pet-records">
              {progress.petRecords.map((record, i) => {
                const breedCfg = BREED_CONFIGS[record.breed];
                return (
                  <div key={`${record.bornAt}-${i}`} className="pet-record-card">
                    <span className="record-emoji">{breedCfg?.emoji ?? '❓'}</span>
                    <div className="record-info">
                      <span className="record-name">{record.name}</span>
                      <span className="record-detail">
                        {breedCfg?.displayName} · {STAGE_LABELS[record.maxStage]} · {record.maxAge}틱
                      </span>
                    </div>
                    {record.diedAt ? (
                      <span className="record-badge dead">별이 됨</span>
                    ) : (
                      <span className="record-badge alive">생존 중</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 탭: 업적 */}
        <section className="collection-section">
          <h3 className="section-title">
            업적 ({progress.unlockedAchievements.length}/{ACHIEVEMENTS.length})
          </h3>
          <div className="achievements-grid">
            {ACHIEVEMENTS.map((ach) => {
              const unlocked = unlockedSet.has(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}
                >
                  <span className="achievement-icon">{unlocked ? ach.icon : '🔒'}</span>
                  <span className="achievement-title">{ach.title}</span>
                  <span className="achievement-desc">
                    {unlocked ? ach.description : '???'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 통계 */}
        <section className="collection-section stats-section">
          <h3 className="section-title">통계</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{progress.totalPetsRaised}</span>
              <span className="stat-desc">키운 펫</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{progress.totalActionsPerformed}</span>
              <span className="stat-desc">총 액션</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{progress.totalEvolutions}</span>
              <span className="stat-desc">진화 횟수</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{progress.totalMiniGamesPlayed}</span>
              <span className="stat-desc">미니게임</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
