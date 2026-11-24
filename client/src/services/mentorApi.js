const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function buildUrl(path) {
  return `${API_BASE}${path}`;
}

export async function fetchMentorHealth() {
  try {
    const res = await fetch(buildUrl('/api/health'));
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch {
    return { status: 'offline', aiMode: 'offline-demo', model: 'client-offline-fallback' };
  }
}

function buildOfflineFallbackReply(endpointType, payload) {
  const { experimentId, parameters, results } = payload;
  if (experimentId === 'ohms-law') {
    return (
      `[Локальный Demo-режим: сервер недоступен] При U = ${parameters.voltage} В и R = ${parameters.resistance} Ом ` +
      `Simulation Engine рассчитал ток I = ${results.current} А и мощность P = ${results.power} Вт.\n\n` +
      'Как изменится ток, если уменьшить сопротивление вдвое?'
    );
  }
  if (experimentId === 'free-fall') {
    return (
      `[Локальный Demo-режим: сервер недоступен] Падение с высоты ${parameters.height} м при g = ${parameters.gravity} м/с² ` +
      `длится ${results.totalTime} с, скорость у земли — ${results.impactVelocity} м/с.\n\n` +
      'Почему скорость растёт линейно, а пройденный путь — квадратично?'
    );
  }
  if (experimentId === 'projectile-motion') {
    return (
      `[Локальный Demo-режим: сервер недоступен] Бросок при v₀ = ${parameters.velocity} м/с и α = ${parameters.angle}° ` +
      `даёт дальность ${results.range} м и высоту ${results.maxHeight} м.\n\n` +
      'Какой угол запуска обеспечит максимальную дальность?'
    );
  }
  if (experimentId === 'series-parallel') {
    return (
      `[Локальный Demo-режим: сервер недоступен] В ${parameters.circuitType === 'parallel' ? 'параллельной' : 'последовательной'} цепи ` +
      `R_общ = ${results.rTotal} Ом, I_общ = ${results.iTotal} А.\n\nСравни общий ток с противоположным типом соединения.`
    );
  }
  if (experimentId === 'newtons-second-law') {
    return (
      `[Локальный Demo-режим: сервер недоступен] При m = ${parameters.mass} кг и F_рез = ${results.netForce} Н ` +
      `ускорение a = ${results.acceleration} м/с².\n\nКак изменится ускорение при удвоении массы?`
    );
  }
  if (experimentId === 'ideal-gas') {
    return (
      `[Локальный Demo-режим: сервер недоступен] При T = ${parameters.temperature} К, V = ${parameters.volume} л и n = ${parameters.moles} моль ` +
      `давление газа равно ${results.pressureKpa} кПа.\n\nКак изменится давление, если уменьшить объём вдвое?`
    );
  }
  if (experimentId === 'wave-interference') {
    return (
      `[Локальный Demo-режим: сервер недоступен] При A = ${parameters.amplitude} см и Δφ = ${parameters.phaseShift}° ` +
      `результирующая амплитуда A_рез = ${results.resultantAmplitude} см.\n\nПри каком сдвиге фаз волны полностью гасят друг друга?`
    );
  }
  return (
    `[Локальный Demo-режим: сервер недоступен] При n₁ = ${parameters.n1}, n₂ = ${parameters.n2} и θ₁ = ${parameters.incidentAngle}° ` +
    (results.isTotalInternalReflection
      ? `наблюдается полное внутреннее отражение (θ_кр = ${results.criticalAngle}°).`
      : `угол преломления составляет θ₂ = ${results.refractedAngle}°.`) +
    '\n\nПопробуй изменить угол падения и понаблюдай за лучом.'
  );
}

export async function requestMentor(endpointType, payload) {
  const pathMap = {
    explain: '/api/mentor/explain',
    chat: '/api/mentor/chat',
    analyze: '/api/mentor/analyze',
  };
  const url = buildUrl(pathMap[endpointType] || '/api/mentor/chat');

  // Strip results before sending so backend remains authoritative verifier
  const body = {
    experimentId: payload.experimentId,
    mode: payload.mode,
    phase: payload.phase,
    action: payload.action,
    parameters: payload.parameters,
    message: payload.message || '',
    hypothesisChoice: payload.hypothesisChoice || '',
    hypothesisReasoning: payload.hypothesisReasoning || '',
    conclusion: payload.conclusion || '',
    recentActions: payload.recentActions || [],
    measurements: (payload.measurements || []).map((m) => ({ parameters: m.parameters })),
    history: (payload.history || []).slice(-10),
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Ошибка сервера (${res.status})`);
    }
    return data;
  } catch (err) {
    if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
      // Return offline fallback only on network failure; rethrow validation/rate-limit errors
      if (err.message.includes('Слишком много') || err.message.includes('Введите') || err.message.includes('длинно')) {
        throw err;
      }
    }
    return {
      reply: buildOfflineFallbackReply(endpointType, payload),
      aiMode: 'offline-demo',
      model: 'client-offline-fallback',
    };
  }
}
