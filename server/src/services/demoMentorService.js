const INJECTION_DEFLECTION =
  'Я работаю исключительно как AI Lab Mentor по физике в Virtual Science Lab и не могу менять роль, раскрывать внутренние инструкции или выполнять посторонний код. Давай вернёмся к измерениям текущего эксперимента — что ты наблюдаешь на приборах прямо сейчас?';

function buildOhmsDemo(payload) {
  const { parameters, results, measurements } = payload.verifiedContext;
  const { voltage, resistance, circuitClosed } = parameters;
  const { current, power } = results;

  if (!circuitClosed) {
    return (
      `Сейчас ключ цепи разомкнут, поэтому при напряжении ${voltage} В сила тока I = 0 А и мощность P = 0 Вт — электрическая цепь не замкнута.\n\n` +
      'Как ты думаешь, что покажет амперметр, если замкнуть ключ при текущем сопротивлении ' +
      `${resistance} Ом?`
    );
  }

  if (payload.endpointType === 'analyze' && payload.action === 'review_conclusion') {
    const len = payload.conclusion.length;
    if (len < 25) {
      return 'Твой вывод пока слишком краткий. Попробуй явно указать, как именно связаны сила тока I, напряжение U и сопротивление R, и подтверди это хотя бы одним числовым замером.';
    }
    return (
      'Хорошая основа для вывода! Проверь, отражены ли в нём оба фактора закона Ома (I = U / R): прямая пропорциональность напряжению и обратная — сопротивлению. ' +
      `На твоих текущих параметрах (${voltage} В, ${resistance} Ом) прибор показывает ${current} А.`
    );
  }

  if (payload.endpointType === 'analyze') {
    const count = measurements.length;
    const hypNote = payload.hypothesisChoice
      ? `Ты выдвинул(а) гипотезу: «${payload.hypothesisChoice}». `
      : '';
    return (
      `${hypNote}В журнале зафиксировано измерений: ${count}. Сейчас при U = ${voltage} В и R = ${resistance} Ом сила тока составляет I = ${current} А (мощность ${power} Вт).\n\n` +
      'Сравни два замера с разным сопротивлением при одном и том же напряжении: во сколько раз изменилось R и во сколько раз изменился ток I?'
    );
  }

  if (payload.action === 'explain_graph') {
    return (
      `График показывает функциональную зависимость по закону Ома I = U / R для текущей установки (${voltage} В, ${resistance} Ом, I = ${current} А). ` +
      'Линейный рост I(U) означает постоянство сопротивления, а гиперболическая кривая I(R) показывает, что при удвоении R ток падает вдвое.\n\n' +
      'Какое значение тока получится, если увеличить напряжение ровно в 2 раза, не меняя резистор?'
    );
  }

  if (payload.mode === 'free' && (payload.action === 'explain_current_state' || payload.endpointType === 'explain')) {
    return (
      `Цепь замкнута: источник подаёт напряжение ${voltage} В на резистор ${resistance} Ом. По закону Ома I = U / R амперметр фиксирует силу тока ${current} А, а выделяемая тепловая мощность равна P = U · I = ${power} Вт.\n\n` +
      'Попробуй увеличить сопротивление вдвое и посмотри на стрелку амперметра: совпадёт ли новый ток с твоим прогнозом?'
    );
  }

  const msg = payload.message.toLowerCase();
  if (msg.includes('увелич') || msg.includes('меньш') || msg.includes('уменьш')) {
    return (
      `Отлично, давай проверим твоё рассуждение на формуле I = U / R. Сейчас напряжение ${voltage} В, сопротивление ${resistance} Ом, ток равен ${current} А.\n\n` +
      'Если числитель U не менять, а знаменатель R увеличить, в какую сторону изменится дробь U / R?'
    );
  }

  return (
    `Сейчас на стенде: U = ${voltage} В, R = ${resistance} Ом, ток I = ${current} А, мощность P = ${power} Вт.\n\n` +
    'Какой параметр ты хочешь изменить следующим шагом — напряжение или сопротивление — и какой результат ожидаешь увидеть?'
  );
}

function buildFreeFallDemo(payload) {
  const { parameters, results, measurements } = payload.verifiedContext;
  const { height, gravity } = parameters;
  const { totalTime, impactVelocity } = results;

  if (payload.endpointType === 'analyze' && payload.action === 'review_conclusion') {
    return (
      `Ты сформулировал(а) вывод для падения с высоты ${height} м при g = ${gravity} м/с² (t = ${totalTime} с, v_уд = ${impactVelocity} м/с). ` +
      'Проверь, упомянуто ли в выводе, что скорость растёт линейно (v = g·t), а путь — квадратично (s = g·t² / 2), поэтому при увеличении высоты в 4 раза время растёт только в 2 раза.'
    );
  }

  if (payload.endpointType === 'analyze') {
    return (
      `Зафиксировано запусков: ${measurements.length}. Для h = ${height} м и g = ${gravity} м/с² расчётное время падения составляет ${totalTime} с, а скорость у земли — ${impactVelocity} м/с.\n\n` +
      'Посмотри на стробоскопические отметки положения тела: почему расстояние между соседними отметками за равные интервалы времени увеличивается?'
    );
  }

  if (payload.mode === 'free' && (payload.action === 'explain_current_state' || payload.endpointType === 'explain')) {
    return (
      `Тело падает с высоты ${height} м при ускорении свободного падения g = ${gravity} м/с² без сопротивления воздуха. Полное время падения равно t = √(2h / g) = ${totalTime} с, а скорость в момент касания достигает ${impactVelocity} м/с.\n\n` +
      'Если перенести этот же опыт на Луну (g = 1.62 м/с²), во сколько примерно раз увеличится время падения?'
    );
  }

  return (
    `Текущая установка: высота ${height} м, ускорение g = ${gravity} м/с², время до земли ${totalTime} с, скорость удара ${impactVelocity} м/с.\n\n` +
    'Как изменится наклон графика скорости v(t), если выбрать планету с большим значением g?'
  );
}

function buildProjectileDemo(payload) {
  const { parameters, results, measurements } = payload.verifiedContext;
  const { velocity, angle, gravity } = parameters;
  const { range, maxHeight, flightTime, vx, vy0 } = results;

  if (payload.endpointType === 'analyze' && payload.action === 'review_conclusion') {
    return (
      `Проверяем логику вывода: при v₀ = ${velocity} м/с и α = ${angle}° дальность составила ${range} м, высота — ${maxHeight} м. ` +
      'Убедись, что в заключении объяснено, почему именно 45° даёт максимум L = v₀²·sin(2α)/g и почему углы α и (90° − α) дают одинаковую дальность.'
    );
  }

  if (payload.endpointType === 'analyze') {
    return (
      `У тебя записано запусков: ${measurements.length}. Текущий запуск: v₀ = ${velocity} м/с, α = ${angle}°, дальность L = ${range} м, высота H = ${maxHeight} м, время полёта T = ${flightTime} с.\n\n` +
      'Сравнив углы 30°, 45° и 60°, какое общее правило для пары углов 30° и 60° ты замечаешь?'
    );
  }

  if (payload.mode === 'free' && (payload.action === 'explain_current_state' || payload.endpointType === 'explain')) {
    return (
      `Начальная скорость ${velocity} м/с под углом ${angle}° раскладывается на горизонтальную составляющую vx = ${vx} м/с (она постоянна) и вертикальную vy₀ = ${vy0} м/с. Тело поднимается на высоту ${maxHeight} м и приземляется на расстоянии ${range} м через ${flightTime} с.\n\n` +
      'Как ты думаешь, чему равна вертикальная скорость vy в самой верхней точке траектории?'
    );
  }

  return (
    `Параметры броска: v₀ = ${velocity} м/с, угол α = ${angle}°, g = ${gravity} м/с² → дальность ${range} м, высота ${maxHeight} м.\n\n` +
    'Попробуй сравнить два дополнительных угла, сумма которых равна 90° (например, 30° и 60°): что останется одинаковым, а что изменится?'
  );
}

function buildRefractionDemo(payload) {
  const { parameters, results, measurements } = payload.verifiedContext;
  const { incidentAngle, n1, n2 } = parameters;
  const { refractedAngle, criticalAngle, isTotalInternalReflection } = results;

  if (payload.endpointType === 'analyze' && payload.action === 'review_conclusion') {
    return (
      `Хорошая работа над выводом! При n₁ = ${n1}, n₂ = ${n2} и θ₁ = ${incidentAngle}° ` +
      (isTotalInternalReflection
        ? `наблюдается полное внутреннее отражение (критический угол ${criticalAngle}°). `
        : `угол преломления составляет ${refractedAngle}°. `) +
      'Проверь, указаны ли оба обязательных условия ПВО: n₁ > n₂ и θ₁ ≥ θ_кр.'
    );
  }

  if (payload.endpointType === 'analyze') {
    return (
      `Замеров в журнале: ${measurements.length}. Сейчас n₁ = ${n1} → n₂ = ${n2}, угол падения θ₁ = ${incidentAngle}°, ` +
      (isTotalInternalReflection
        ? `преломлённый луч отсутствует — сработало полное внутреннее отражение (θ_кр = ${criticalAngle}°).`
        : `угол преломления θ₂ = ${refractedAngle}°.`) +
      '\n\nПочему при переходе из воздуха (1.00) в стекло (1.50) луч приближается к нормали, а не удаляется от неё?'
    );
  }

  if (payload.mode === 'free' && (payload.action === 'explain_current_state' || payload.endpointType === 'explain')) {
    if (isTotalInternalReflection) {
      return (
        `Луч идёт из более плотной среды (n₁ = ${n1}) в менее плотную (n₂ = ${n2}) под углом ${incidentAngle}°, что превышает критический угол θ_кр = ${criticalAngle}°. Уравнение Снеллиуса даёт sin(θ₂) > 1, поэтому преломлённый луч не может выйти во вторую среду и вся энергия отражается обратно.\n\n` +
        'Где в современной технике (например, в интернете или медицине) используют эффект полного внутреннего отражения?'
      );
    }
    return (
      `По закону Снеллиуса n₁·sin(θ₁) = n₂·sin(θ₂) при переходе из среды n₁ = ${n1} в среду n₂ = ${n2} под углом ${incidentAngle}° луч преломляется под углом ${refractedAngle}°. Отражённый луч всегда уходит под тем же углом ${incidentAngle}°.\n\n` +
      'Что произойдёт с углом θ₂, если поменять среды местами (сделать n₁ > n₂) и постепенно увеличивать угол падения?'
    );
  }

  return (
    `Оптическая граница: n₁ = ${n1}, n₂ = ${n2}, угол падения ${incidentAngle}°` +
    (isTotalInternalReflection
      ? ` (полное внутреннее отражение, θ_кр = ${criticalAngle}°).`
      : `, угол преломления ${refractedAngle}°.`) +
    '\n\nПри каком соотношении n₁ и n₂ угол преломления становится больше угла падения?'
  );
}

function buildSeriesParallelDemo(payload) {
  const { parameters, results, measurements } = payload.verifiedContext;
  const { circuitType, voltage, r1, r2, circuitClosed } = parameters;
  const { rTotal, iTotal, i1, i2 } = results;
  const schemeName = circuitType === 'parallel' ? 'параллельная' : 'последовательная';

  if (!circuitClosed) {
    return `Ключ в цепи разомкнут, поэтому при U = ${voltage} В общий ток I_общ = 0 А. Замкни ключ, чтобы сравнить ${schemeName} схему для R₁ = ${r1} Ом и R₂ = ${r2} Ом.`;
  }
  if (payload.endpointType === 'analyze' && payload.action === 'review_conclusion') {
    return (
      `Ты проверил(а) соединение R₁ = ${r1} Ом и R₂ = ${r2} Ом (${schemeName} схема: R_общ = ${rTotal} Ом, I_общ = ${iTotal} А). ` +
      'Убедись, что в выводе объяснено, почему параллельное добавление ветви снижает R_общ ниже каждого из резисторов и увеличивает ток от источника.'
    );
  }
  if (payload.endpointType === 'analyze') {
    return (
      `Собрано замеров: ${measurements.length}. В текущей схеме (${schemeName}) R_общ = ${rTotal} Ом, общий ток I_общ = ${iTotal} А (I₁ = ${i1} А, I₂ = ${i2} А).\n\n` +
      'Сравни общий ток для одинаковых R₁ и R₂ в последовательном и параллельном включении: почему при параллельном подключении ток больше?'
    );
  }
  if (payload.mode === 'free' || payload.endpointType === 'explain') {
    return (
      `Собрана ${schemeName} цепь из R₁ = ${r1} Ом и R₂ = ${r2} Ом при U = ${voltage} В. Эквивалентное сопротивление равно R_общ = ${rTotal} Ом, поэтому общий ток составляет I_общ = ${iTotal} А (в ветвях I₁ = ${i1} А, I₂ = ${i2} А).\n\n` +
      'Что произойдёт с общим током, если переключить схему на другой тип соединения, не меняя резисторы?'
    );
  }
  return `Сейчас (${schemeName} схема): R_общ = ${rTotal} Ом, I_общ = ${iTotal} А. Какая величина остаётся одинаковой на обоих резисторах в этой топологии — ток или напряжение?`;
}

function buildNewtonDemo(payload) {
  const { parameters, results, measurements } = payload.verifiedContext;
  const { mass, appliedForce, frictionForce } = parameters;
  const { netForce, acceleration, isMoving } = results;

  if (payload.endpointType === 'analyze' && payload.action === 'review_conclusion') {
    return (
      `Для m = ${mass} кг, F_тяги = ${appliedForce} Н и F_тр = ${frictionForce} Н равнодействующая F_рез = ${netForce} Н, ускорение a = ${acceleration} м/с². ` +
      'Проверь, указана ли в выводе прямая зависимость a от F_рез и обратная зависимость от массы m.'
    );
  }
  if (payload.endpointType === 'analyze') {
    return (
      `В журнале замеров: ${measurements.length}. Сейчас F_рез = ${netForce} Н даёт тележке массой ${mass} кг ускорение a = ${acceleration} м/с².\n\n` +
      'Если при той же F_рез удвоить массу тележки, как и почему изменится её ускорение?'
    );
  }
  if (!isMoving) {
    return (
      `Тяга F_тяги = ${appliedForce} Н не превышает силу трения F_тр = ${frictionForce} Н, поэтому равнодействующая F_рез = 0 Н и ускорение a = 0 м/с² — тележка покоится.\n\n` +
      'Какое минимальное значение силы тяги нужно задать, чтобы тележка начала ускоряться?'
    );
  }
  if (payload.mode === 'free' || payload.endpointType === 'explain') {
    return (
      `На тележку массой ${mass} кг действует сила тяги ${appliedForce} Н и встречная сила трения ${frictionForce} Н. Равнодействующая F_рез = ${netForce} Н сообщает ей ускорение a = F_рез / m = ${acceleration} м/с².\n\n` +
      'Что произойдёт с ускорением, если увеличить массу тележки вдвое при тех же силах?'
    );
  }
  return `На стенде: m = ${mass} кг, F_рез = ${netForce} Н, a = ${acceleration} м/с². Как изменится наклон графика a(F), если увеличить массу m?`;
}

export function generateDemoMentorReply(payload) {
  if (payload.isInjectionAttempt) {
    return INJECTION_DEFLECTION;
  }

  switch (payload.experimentId) {
    case 'ohms-law':
      return buildOhmsDemo(payload);
    case 'free-fall':
      return buildFreeFallDemo(payload);
    case 'projectile-motion':
      return buildProjectileDemo(payload);
    case 'refraction':
      return buildRefractionDemo(payload);
    case 'series-parallel':
      return buildSeriesParallelDemo(payload);
    case 'newtons-second-law':
      return buildNewtonDemo(payload);
    default:
      return 'Опиши, какие изменения параметров ты сейчас наблюдаешь в симуляции.';
  }
}
