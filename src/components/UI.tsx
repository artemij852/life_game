import React, { useState } from 'react';
import useStore from '../store';

export function GameUI() {
  const [showTech, setShowTech] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const humans = useStore(s => s.humans);
  const technologies = useStore(s => s.technologies);
  const day = useStore(s => s.day);
  const time = useStore(s => s.time);
  const speed = useStore(s => s.speed);
  const population = useStore(s => s.population);
  const era = useStore(s => s.era);
  const notifications = useStore(s => s.notifications);
  const selectedHuman = useStore(s => s.selectedHuman);
  const cameraMode = useStore(s => s.cameraMode);
  const setSpeed = useStore(s => s.setSpeed);
  const setCameraMode = useStore(s => s.setCameraMode);
  const selectHuman = useStore(s => s.selectHuman);
  const saveGame = useStore(s => s.saveGame);

  const selected = humans.find(h => h.id === selectedHuman);

  const timeStr = `${Math.floor(time).toString().padStart(2, '0')}:${Math.floor((time % 1) * 60).toString().padStart(2, '0')}`;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Top bar */}
      <div className="pointer-events-auto absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-4">
          <div className="text-white font-bold text-lg">
            🏛️ {era}
          </div>
          <div className="text-white/80 text-sm">
            📅 День {day} | 🕐 {timeStr}
          </div>
          <div className="text-white/80 text-sm">
            👥 {population} жителей
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSpeed(speed === 1 ? 2 : speed === 2 ? 5 : 1)}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-sm transition-colors"
          >
            ⏩ x{speed}
          </button>
          <button
            onClick={() => setCameraMode(cameraMode === 'free' ? 'follow' : 'free')}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-sm transition-colors"
          >
            📷 {cameraMode === 'free' ? 'Свободная' : 'Следить'}
          </button>
          <button
            onClick={() => setShowTech(!showTech)}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-sm transition-colors"
          >
            🔬 Технологии
          </button>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-sm transition-colors"
          >
            ℹ️ Инфо
          </button>
          <button
            onClick={saveGame}
            className="px-3 py-1 bg-green-600/50 hover:bg-green-600/70 rounded text-white text-sm transition-colors"
          >
            💾 Сохранить
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="absolute top-14 right-4 w-72 max-h-48 overflow-hidden">
        {notifications.slice(0, 5).map((n, i) => (
          <div
            key={i}
            className="text-white text-xs bg-black/50 rounded px-2 py-1 mb-1 animate-pulse"
            style={{ opacity: 1 - i * 0.2 }}
          >
            {n}
          </div>
        ))}
      </div>

      {/* Selected human info */}
      {selected && (
        <div className="pointer-events-auto absolute bottom-4 left-4 w-72 bg-black/70 rounded-lg p-3 text-white backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg">{selected.gender === 'male' ? '👨' : '👩'} {selected.name}</h3>
            <button onClick={() => selectHuman(null)} className="text-white/50 hover:text-white">✕</button>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div>❤️ Здоровье: {Math.round(selected.health)}%</div>
            <div>🍖 Сытость: {Math.round(selected.hunger)}%</div>
            <div>📅 Возраст: {Math.round(selected.age)} лет</div>
            <div>📊 Состояние: {getStateLabel(selected.state)}</div>
          </div>
          <div className="mt-2 text-xs">
            <div className="font-semibold mb-1">🎒 Инвентарь:</div>
            <div className="grid grid-cols-4 gap-1">
              {selected.inventory.wood > 0 && <span>🪵 {selected.inventory.wood}</span>}
              {selected.inventory.stone > 0 && <span>🪨 {selected.inventory.stone}</span>}
              {selected.inventory.food > 0 && <span>🍎 {selected.inventory.food}</span>}
              {selected.inventory.fiber > 0 && <span>🧵 {selected.inventory.fiber}</span>}
              {selected.inventory.iron > 0 && <span>⚙️ {selected.inventory.iron}</span>}
              {selected.inventory.gold > 0 && <span>💰 {selected.inventory.gold}</span>}
              {selected.inventory.leather > 0 && <span>🟤 {selected.inventory.leather}</span>}
              {selected.inventory.herbs > 0 && <span>🌿 {selected.inventory.herbs}</span>}
            </div>
          </div>
          <div className="mt-2 text-xs">
            <div className="font-semibold mb-1">⭐ Навыки:</div>
            <div className="grid grid-cols-2 gap-1">
              <span>🌾 Сбор: {selected.skills.gathering.toFixed(1)}</span>
              <span>🔨 Строит: {selected.skills.building.toFixed(1)}</span>
              <span>⚔️ Бой: {selected.skills.combat.toFixed(1)}</span>
              <span>🛠️ Крафт: {selected.skills.crafting.toFixed(1)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Humans list */}
      <div className="pointer-events-auto absolute bottom-4 right-4 w-56 max-h-64 overflow-y-auto bg-black/60 rounded-lg p-2 backdrop-blur-sm">
        <h4 className="text-white text-xs font-bold mb-1">Жители (клик для выбора):</h4>
        {humans.filter(h => h.alive).map(h => (
          <div
            key={h.id}
            onClick={() => selectHuman(h.id)}
            className={`text-xs px-2 py-1 rounded cursor-pointer transition-colors ${
              h.id === selectedHuman ? 'bg-green-600/50 text-white' : 'text-white/70 hover:bg-white/10'
            }`}
          >
            {h.gender === 'male' ? '👨' : '👩'} {h.name} - {getStateLabel(h.state)}
          </div>
        ))}
      </div>

      {/* Technology panel */}
      {showTech && (
        <div className="pointer-events-auto absolute top-14 left-4 w-80 max-h-96 overflow-y-auto bg-black/80 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-bold">🔬 Технологии</h3>
            <button onClick={() => setShowTech(false)} className="text-white/50 hover:text-white">✕</button>
          </div>
          <div className="space-y-1">
            {technologies.map(tech => (
              <div
                key={tech.id}
                className={`text-xs p-2 rounded ${
                  tech.unlocked
                    ? 'bg-green-900/50 text-green-300 border border-green-700'
                    : 'bg-gray-900/50 text-gray-400 border border-gray-700'
                }`}
              >
                <div className="font-semibold">
                  {tech.unlocked ? '✅' : '🔒'} {tech.name}
                  <span className="ml-2 text-[10px] opacity-70">[{tech.era}]</span>
                </div>
                <div className="text-[10px] opacity-70">{tech.description}</div>
                {!tech.unlocked && (
                  <div className="text-[10px] mt-1">
                    Стоимость: {Object.entries(tech.cost).map(([k, v]) => `${getResourceEmoji(k)}${v}`).join(' ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info panel */}
      {showInfo && (
        <div className="pointer-events-auto absolute top-14 left-4 w-80 bg-black/80 rounded-lg p-3 backdrop-blur-sm text-white text-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">ℹ️ Управление</h3>
            <button onClick={() => setShowInfo(false)} className="text-white/50 hover:text-white">✕</button>
          </div>
          <div className="space-y-1">
            <p>🖱️ <b>ЛКМ + тянуть</b> — вращение камеры</p>
            <p>🖱️ <b>ПКМ + тянуть</b> — перемещение камеры</p>
            <p>🖱️ <b>Колёсико</b> — приближение/удаление</p>
            <p>👆 <b>Клик на жителя</b> — выбрать и увидеть инфо</p>
            <p>⏩ <b>Кнопка скорости</b> — ускорение симуляции</p>
            <p>💾 Автосохранение каждые 5 минут</p>
            <hr className="border-white/20 my-2" />
            <p>Мир: 1км × 1км</p>
            <p>Биомы: лес, пляж, море, поляна, пещера</p>
            <p>Жители — полностью автономный ИИ</p>
            <p>Они собирают ресурсы, крафтят, торгуют, исследуют технологии, сражаются с животными и создают новое поколение.</p>
          </div>
        </div>
      )}

      {/* Mini compass */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 text-white/50 text-xs">
        {cameraMode === 'free' && '🎥 Свободная камера — вы невидимый наблюдатель'}
        {cameraMode === 'follow' && selected && `🎥 Слежение за: ${selected.name}`}
      </div>
    </div>
  );
}

function getStateLabel(state: string): string {
  const labels: { [key: string]: string } = {
    idle: '💤 Отдыхает',
    gathering: '🌾 Собирает',
    building: '🔨 Строит',
    exploring: '🧭 Исследует',
    fighting: '⚔️ Сражается',
    trading: '🤝 Торговля',
    resting: '😴 Отдыхает',
    crafting: '🛠️ Крафтит',
  };
  return labels[state] || state;
}

function getResourceEmoji(key: string): string {
  const emojis: { [key: string]: string } = {
    wood: '🪵', stone: '🪨', food: '🍎', fiber: '🧵',
    iron: '⚙️', gold: '💰', leather: '🟤', herbs: '🌿',
  };
  return emojis[key] || key;
}
