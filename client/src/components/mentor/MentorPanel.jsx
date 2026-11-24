import { useEffect, useId, useRef, useState } from 'react';
import { SparkIcon } from '../ui/Icons.jsx';

export function MentorPanel({
  experimentTitle,
  mode,
  aiMode,
  messages,
  loading,
  error,
  contextSummary,
  onSendMessage,
  onQuickAction,
  onClearError,
}) {
  const [input, setInput] = useState('');
  const [showContext, setShowContext] = useState(false);
  const inputId = useId();
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSendMessage(trimmed);
    setInput('');
  };

  const badgeLabel =
    aiMode === 'live'
      ? 'GEMINI LIVE'
      : aiMode === 'demo-fallback'
        ? 'DEMO FALLBACK'
        : aiMode === 'offline-demo'
          ? 'OFFLINE DEMO'
          : 'DEMO MODE';

  const isLive = aiMode === 'live';

  return (
    <aside className="panel mentor-panel" aria-label="AI Lab Mentor">
      <div className="panel__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <SparkIcon />
          <h2 className="panel__title">AI Lab Mentor</h2>
        </div>
        <span className={`badge ${isLive ? 'badge--live' : 'badge--demo'}`}>{badgeLabel}</span>
      </div>

      <div
        style={{
          padding: '0.55rem 0.9rem',
          borderBottom: '1px solid var(--border-hairline)',
          background: 'var(--bg-paper)',
          fontSize: '0.78rem',
          color: 'var(--ink-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
          <span>
            {isLive
              ? 'Подключена живая модель Gemini (метод Сократа).'
              : 'Демонстрационный режим: подготовленные сократические сценарии (без API-ключа).'}
          </span>
          <button
            type="button"
            className="btn btn--sm"
            aria-expanded={showContext}
            onClick={() => setShowContext((v) => !v)}
          >
            {showContext ? 'Скрыть контекст' : 'Контекст'}
          </button>
        </div>

        {showContext ? (
          <pre
            className="mono"
            style={{
              margin: 0,
              padding: '0.5rem',
              background: 'var(--bg-instrument)',
              border: '1px solid var(--border-hairline)',
              borderRadius: '2px',
              fontSize: '0.72rem',
              overflowX: 'auto',
            }}
          >
            {JSON.stringify(contextSummary, null, 2)}
          </pre>
        ) : null}
      </div>

      <div className="mentor-messages" ref={listRef} aria-live="polite">
        {messages.length === 0 ? (
          <div className="mentor-msg mentor-msg--mentor">
            <div className="mentor-msg__meta">
              <span>AI LAB MENTOR</span>
              <span>{mode === 'guided' ? 'GUIDED' : 'FREE'}</span>
            </div>
            Привет! Я сопровождаю твой эксперимент «{experimentTitle}». Меняй параметры на стенде или нажми{' '}
            <strong>«Объяснить происходящее»</strong>, а я помогу разобраться в физической закономерности.
          </div>
        ) : null}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mentor-msg ${
              msg.role === 'user'
                ? 'mentor-msg--student'
                : msg.role === 'system'
                  ? 'mentor-msg--system'
                  : 'mentor-msg--mentor'
            }`}
          >
            <div className="mentor-msg__meta">
              <span>{msg.role === 'user' ? 'ТЫ' : msg.role === 'system' ? 'СИСТЕМА' : 'AI LAB MENTOR'}</span>
              {msg.aiMode ? <span>{msg.aiMode.toUpperCase()}</span> : null}
            </div>
            <div>{msg.text}</div>
          </div>
        ))}

        {loading ? (
          <div className="mentor-msg mentor-msg--mentor" style={{ color: 'var(--ink-secondary)' }}>
            Анализирую текущие показания приборов...
          </div>
        ) : null}
      </div>

      {error ? (
        <div role="alert" className="alert alert--danger" style={{ margin: '0.5rem 0.9rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'center' }}>
            <span>{error}</span>
            {onClearError ? (
              <button type="button" className="btn btn--sm" onClick={onClearError}>
                ОК
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div
        style={{
          padding: '0.6rem 0.9rem',
          borderTop: '1px solid var(--border-hairline)',
          background: 'var(--bg-instrument)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.35rem',
        }}
      >
        <button
          type="button"
          className="btn btn--sm btn--primary"
          disabled={loading}
          onClick={() => onQuickAction('explain_current_state')}
        >
          Объяснить происходящее
        </button>
        <button
          type="button"
          className="btn btn--sm"
          disabled={loading}
          onClick={() => onQuickAction('what_next')}
        >
          Что проверить дальше?
        </button>
        <button
          type="button"
          className="btn btn--sm"
          disabled={loading}
          onClick={() => onQuickAction('explain_graph')}
        >
          Почему график такой?
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          padding: '0.75rem 0.9rem',
          borderTop: '1px solid var(--border-hairline)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
        }}
      >
        <label htmlFor={inputId} className="visually-hidden">
          Вопрос AI-наставнику по текущему эксперименту
        </label>
        <textarea
          id={inputId}
          rows={2}
          maxLength={1000}
          className="lab-textarea"
          placeholder="Опиши свою гипотезу или задай вопрос по эксперименту..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--ink-secondary)' }}>
            {input.length}/1000
          </span>
          <button type="submit" className="btn btn--primary btn--sm" disabled={loading || !input.trim()}>
            Отправить наставнику
          </button>
        </div>
      </form>
    </aside>
  );
}
