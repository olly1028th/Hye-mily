import type { EventLogEntry } from '../../types';
import './EventLog.css';

interface EventLogProps {
  entries: EventLogEntry[];
  onClose: () => void;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function EventLog({ entries, onClose }: EventLogProps) {
  return (
    <div className="event-log-panel">
      <div className="event-log-header">
        <h3 className="event-log-title">이벤트 기록</h3>
        <button className="event-log-close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="event-log-list">
        {entries.length === 0 ? (
          <p className="event-log-empty">아직 이벤트가 없어요.</p>
        ) : (
          entries.map((entry, i) => (
            <div key={`${entry.timestamp}-${i}`} className="event-log-item">
              <span className="event-log-time">{formatTime(entry.timestamp)}</span>
              <span className="event-log-message">{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
