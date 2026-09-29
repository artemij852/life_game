import { create } from 'zustand';

export interface Inventory {
  wood: number;
  stone: number;
  food: number;
  fiber: number;
  iron: number;
  gold: number;
  leather: number;
  herbs: number;
}

export interface Technology {
  id: string;
  name: string;
  era: string;
  cost: Partial<Inventory>;
  unlocked: boolean;
  description: string;
}

export interface Human {
  id: string;
  name: string;
  position: [number, number, number];
  health: number;
  hunger: number;
  age: number;
  state: 'idle' | 'gathering' | 'building' | 'exploring' | 'fighting' | 'trading' | 'resting' | 'crafting';
  target: [number, number, number] | null;
  inventory: Inventory;
  skills: { [key: string]: number };
  alive: boolean;
  gender: 'male' | 'female';
}

export interface Building {
  id: string;
  type: string;
  position: [number, number, number];
  health: number;
  builder: string | null;
}

export interface Animal {
  id: string;
  type: 'deer' | 'wolf' | 'bear' | 'rabbit' | 'boar';
  position: [number, number, number];
  health: number;
  state: 'wandering' | 'fleeing' | 'attacking';
  target: [number, number, number] | null;
}

export interface Resource {
  id: string;
  type: 'tree' | 'rock' | 'bush' | 'herb';
  position: [number, number, number];
  amount: number;
  maxAmount: number;
  regenTimer: number;
}

export interface GameState {
  humans: Human[];
  buildings: Building[];
  animals: Animal[];
  resources: Resource[];
  technologies: Technology[];
  day: number;
  time: number;
  speed: number;
  cameraMode: 'free' | 'follow';
  selectedHuman: string | null;
  notifications: string[];
  population: number;
  era: string;
  lastSave: number;

  // Actions
  tick: (delta: number) => void;
  addNotification: (msg: string) => void;
  setCameraMode: (mode: 'free' | 'follow') => void;
  selectHuman: (id: string | null) => void;
  setSpeed: (speed: number) => void;
  saveGame: () => void;
  loadGame: () => void;
  initWorld: () => void;
}

const NAMES_MALE = ['Адам', 'Кайн', 'Ной', 'Аврам', 'Давид', 'Иван', 'Борис', 'Глеб', 'Олег', 'Рюрик', 'Тор', 'Один', 'Локи', 'Фенрир', 'Бьорн'];
const NAMES_FEMALE = ['Ева', 'Лилит', 'Сара', 'Лея', 'Мария', 'Анна', 'Ольга', 'Вера', 'Любава', 'Заря', 'Фрея', 'Сигрид', 'Астрид', 'Ингрид', 'Хельга'];

const generateId = () => Math.random().toString(36).substr(2, 9);

const createHuman = (x: number, z: number): Human => {
  const gender = Math.random() > 0.5 ? 'male' : 'female';
  const names = gender === 'male' ? NAMES_MALE : NAMES_FEMALE;
  return {
    id: generateId(),
    name: names[Math.floor(Math.random() * names.length)],
    position: [x, 0, z],
    health: 100,
    hunger: 100,
    age: 18 + Math.floor(Math.random() * 20),
    state: 'idle',
    target: null,
    inventory: { wood: 0, stone: 0, food: 2, fiber: 0, iron: 0, gold: 0, leather: 0, herbs: 0 },
    skills: { gathering: 1, building: 1, combat: 1, crafting: 1, exploring: 1 },
    alive: true,
    gender,
  };
};

const createResource = (type: Resource['type'], x: number, z: number): Resource => {
  const maxAmount = type === 'tree' ? 5 : type === 'rock' ? 8 : type === 'herb' ? 3 : 4;
  return {
    id: generateId(),
    type,
    position: [x, 0, z],
    amount: maxAmount,
    maxAmount,
    regenTimer: 0,
  };
};

const createAnimal = (type: Animal['type'], x: number, z: number): Animal => {
  const health = type === 'rabbit' ? 10 : type === 'deer' ? 30 : type === 'boar' ? 50 : type === 'wolf' ? 40 : 80;
  return {
    id: generateId(),
    type,
    position: [x, 0, z],
    health,
    state: 'wandering',
    target: null,
  };
};

const ALL_TECHNOLOGIES: Technology[] = [
  { id: 'stone_tools', name: 'Каменные орудия', era: 'stone', cost: { stone: 5, wood: 3 }, unlocked: false, description: 'Базовые инструменты из камня' },
  { id: 'fire', name: 'Огонь', era: 'stone', cost: { wood: 10, stone: 5 }, unlocked: false, description: 'Контроль огня' },
  { id: 'shelter', name: 'Укрытие', era: 'stone', cost: { wood: 20, fiber: 10 }, unlocked: false, description: 'Базовое укрытие' },
  { id: 'farming', name: 'Земледелие', era: 'stone', cost: { wood: 15, stone: 10 }, unlocked: false, description: 'Выращивание пищи' },
  { id: 'pottery', name: 'Гончарное дело', era: 'stone', cost: { stone: 20 }, unlocked: false, description: 'Керамическая посуда' },
  { id: 'bow', name: 'Лук и стрелы', era: 'stone', cost: { wood: 15, fiber: 10 }, unlocked: false, description: 'Дальнобойное оружие' },
  { id: 'bronze', name: 'Бронза', era: 'bronze', cost: { stone: 30, gold: 10 }, unlocked: false, description: 'Металлургия бронзы' },
  { id: 'wheel', name: 'Колесо', era: 'bronze', cost: { wood: 30, stone: 20 }, unlocked: false, description: 'Транспорт' },
  { id: 'iron', name: 'Железо', era: 'iron', cost: { stone: 50, iron: 20 }, unlocked: false, description: 'Железная металлургия' },
  { id: 'masonry', name: 'Каменная кладка', era: 'iron', cost: { stone: 60 }, unlocked: false, description: 'Каменные здания' },
  { id: 'steel', name: 'Сталь', era: 'medieval', cost: { iron: 50, stone: 30 }, unlocked: false, description: 'Стальная металлургия' },
  { id: 'gunpowder', name: 'Порох', era: 'medieval', cost: { stone: 40, herbs: 30 }, unlocked: false, description: 'Взрывчатые вещества' },
  { id: 'electricity', name: 'Электричество', era: 'industrial', cost: { iron: 80, gold: 40 }, unlocked: false, description: 'Электрическая энергия' },
  { id: 'steam', name: 'Паровой двигатель', era: 'industrial', cost: { iron: 100, stone: 50 }, unlocked: false, description: 'Паровая машина' },
  { id: 'computing', name: 'Вычисления', era: 'modern', cost: { iron: 100, gold: 80 }, unlocked: false, description: 'Компьютеры' },
  { id: 'drones', name: 'Дроны', era: 'modern', cost: { iron: 150, gold: 100 }, unlocked: false, description: 'Летающие дроны' },
  { id: 'armor', name: 'Броня', era: 'medieval', cost: { iron: 60, leather: 40 }, unlocked: false, description: 'Защитная броня' },
];

const WORLD_SIZE = 500; // 500 units = represents 1km

const useStore = create<GameState>((set, get) => ({
  humans: [],
  buildings: [],
  animals: [],
  resources: [],
  technologies: [...ALL_TECHNOLOGIES],
  day: 1,
  time: 0,
  speed: 1,
  cameraMode: 'free',
  selectedHuman: null,
  notifications: [],
  population: 0,
  era: 'Каменный век',
  lastSave: Date.now(),

  initWorld: () => {
    // Check for saved game
    const saved = localStorage.getItem('colony_save');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        set({
          humans: data.humans,
          buildings: data.buildings,
          animals: data.animals,
          resources: data.resources,
          technologies: data.technologies,
          day: data.day,
          time: data.time,
          population: data.humans.filter((h: Human) => h.alive).length,
          era: data.era,
          notifications: ['Игра загружена из сохранения'],
          lastSave: Date.now(),
        });
        return;
      } catch (e) {
        console.error('Failed to load save', e);
      }
    }

    // Generate world
    const resources: Resource[] = [];
    const animals: Animal[] = [];

    // Forest (north-west quadrant)
    for (let i = 0; i < 200; i++) {
      const x = -WORLD_SIZE / 2 + Math.random() * WORLD_SIZE / 2;
      const z = -WORLD_SIZE / 2 + Math.random() * WORLD_SIZE / 2;
      resources.push(createResource('tree', x, z));
    }

    // Rocks scattered
    for (let i = 0; i < 80; i++) {
      const x = -WORLD_SIZE / 2 + Math.random() * WORLD_SIZE;
      const z = -WORLD_SIZE / 2 + Math.random() * WORLD_SIZE;
      resources.push(createResource('rock', x, z));
    }

    // Herbs near clearing
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 100;
      resources.push(createResource('herb', Math.cos(angle) * dist, Math.sin(angle) * dist));
    }

    // Bushes
    for (let i = 0; i < 60; i++) {
      const x = -WORLD_SIZE / 4 + Math.random() * WORLD_SIZE / 2;
      const z = -WORLD_SIZE / 4 + Math.random() * WORLD_SIZE / 2;
      resources.push(createResource('bush', x, z));
    }

    // Animals
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 200;
      animals.push(createAnimal('deer', Math.cos(angle) * dist, Math.sin(angle) * dist));
    }
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 200;
      animals.push(createAnimal('rabbit', Math.cos(angle) * dist, Math.sin(angle) * dist));
    }
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 100 + Math.random() * 150;
      animals.push(createAnimal('wolf', Math.cos(angle) * dist, Math.sin(angle) * dist));
    }
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 100 + Math.random() * 150;
      animals.push(createAnimal('bear', Math.cos(angle) * dist, Math.sin(angle) * dist));
    }
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 150;
      animals.push(createAnimal('boar', Math.cos(angle) * dist, Math.sin(angle) * dist));
    }

    // Starting humans
    const humans: Human[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 15;
      humans.push(createHuman(Math.cos(angle) * dist, Math.sin(angle) * dist));
    }

    set({
      humans,
      resources,
      animals,
      buildings: [],
      technologies: [...ALL_TECHNOLOGIES],
      population: humans.length,
      notifications: ['Колония основана! 8 поселенцев начинают новую жизнь.'],
    });
  },

  tick: (delta: number) => {
    const state = get();
    const speed = state.speed;
    const dt = delta * speed;

    // Update time
    let newTime = state.time + dt * 0.01;
    let newDay = state.day;
    if (newTime >= 24) {
      newTime = 0;
      newDay++;
    }

    // Update humans AI
    const newHumans = state.humans.map(human => {
      if (!human.alive) return human;

      const h = { ...human, position: [...human.position] as [number, number, number], inventory: { ...human.inventory } };

      // Age
      h.age += dt * 0.0001;
      h.hunger -= dt * 0.05;

      // Death from hunger
      if (h.hunger <= 0) {
        h.health -= dt * 0.5;
        h.hunger = 0;
      }

      // Death from old age or no health
      if (h.health <= 0 || h.age > 70 + Math.random() * 20) {
        h.alive = false;
        return h;
      }

      // Eat food
      if (h.hunger < 50 && h.inventory.food > 0) {
        h.inventory.food--;
        h.hunger = Math.min(100, h.hunger + 30);
      }

      // AI State machine
      const moveSpeed = 5 * dt;

      switch (h.state) {
        case 'idle': {
          // Decide next action
          const rand = Math.random();
          if (h.hunger < 30) {
            h.state = 'gathering';
            // Find food resource
            const foodRes = state.resources.filter(r => r.type === 'bush' && r.amount > 0);
            if (foodRes.length > 0) {
              const target = foodRes[Math.floor(Math.random() * foodRes.length)];
              h.target = [...target.position] as [number, number, number];
            }
          } else if (rand < 0.3) {
            h.state = 'gathering';
            const res = state.resources.filter(r => r.amount > 0);
            if (res.length > 0) {
              const target = res[Math.floor(Math.random() * res.length)];
              h.target = [...target.position] as [number, number, number];
            }
          } else if (rand < 0.5) {
            h.state = 'exploring';
            const angle = Math.random() * Math.PI * 2;
            const dist = 20 + Math.random() * 80;
            h.target = [Math.cos(angle) * dist, 0, Math.sin(angle) * dist];
          } else if (rand < 0.6) {
            h.state = 'resting';
            h.target = [0, 0, 0];
          } else if (rand < 0.7 && h.inventory.wood > 3) {
            h.state = 'crafting';
            h.target = [0, 0, 0];
          } else {
            // Trade with nearby human
            const nearby = state.humans.filter(
              other => other.id !== h.id && other.alive &&
              Math.hypot(other.position[0] - h.position[0], other.position[2] - h.position[2]) < 30
            );
            if (nearby.length > 0) {
              h.state = 'trading';
              h.target = [...nearby[0].position] as [number, number, number];
            }
          }
          break;
        }

        case 'gathering': {
          if (h.target) {
            const dx = h.target[0] - h.position[0];
            const dz = h.target[2] - h.position[2];
            const dist = Math.hypot(dx, dz);
            if (dist > 2) {
              h.position[0] += (dx / dist) * moveSpeed;
              h.position[2] += (dz / dist) * moveSpeed;
            } else {
              // Gather from resource
              const res = state.resources.find(
                r => Math.hypot(r.position[0] - h.position[0], r.position[2] - h.position[2]) < 3 && r.amount > 0
              );
              if (res) {
                res.amount--;
                const skill = h.skills.gathering;
                const amount = Math.ceil(Math.random() * skill);
                if (res.type === 'tree') h.inventory.wood += amount;
                else if (res.type === 'rock') h.inventory.stone += amount;
                else if (res.type === 'bush') h.inventory.food += amount;
                else if (res.type === 'herb') h.inventory.herbs += amount;
                h.skills.gathering = Math.min(10, h.skills.gathering + 0.001);
              }
              h.state = 'idle';
              h.target = null;
            }
          } else {
            h.state = 'idle';
          }
          break;
        }

        case 'exploring': {
          if (h.target) {
            const dx = h.target[0] - h.position[0];
            const dz = h.target[2] - h.position[2];
            const dist = Math.hypot(dx, dz);
            if (dist > 2) {
              h.position[0] += (dx / dist) * moveSpeed * 1.2;
              h.position[2] += (dz / dist) * moveSpeed * 1.2;
            } else {
              h.skills.exploring = Math.min(10, h.skills.exploring + 0.01);
              // Chance to discover something
              if (Math.random() < 0.1) {
                h.inventory.gold += 1;
              }
              h.state = 'idle';
              h.target = null;
            }
          } else {
            h.state = 'idle';
          }
          break;
        }

        case 'resting': {
          h.health = Math.min(100, h.health + dt * 0.1);
          if (h.health >= 100 || Math.random() < 0.001) {
            h.state = 'idle';
            h.target = null;
          }
          break;
        }

        case 'crafting': {
          if (h.target) {
            const dx = h.target[0] - h.position[0];
            const dz = h.target[2] - h.position[2];
            const dist = Math.hypot(dx, dz);
            if (dist > 2) {
              h.position[0] += (dx / dist) * moveSpeed;
              h.position[2] += (dz / dist) * moveSpeed;
            } else {
              // Craft items
              if (h.inventory.wood >= 2) {
                h.inventory.wood -= 2;
                h.inventory.fiber += 1;
                h.skills.crafting = Math.min(10, h.skills.crafting + 0.005);
              }
              h.state = 'idle';
              h.target = null;
            }
          } else {
            h.state = 'idle';
          }
          break;
        }

        case 'trading': {
          if (h.target) {
            const dx = h.target[0] - h.position[0];
            const dz = h.target[2] - h.position[2];
            const dist = Math.hypot(dx, dz);
            if (dist > 3) {
              h.position[0] += (dx / dist) * moveSpeed;
              h.position[2] += (dz / dist) * moveSpeed;
            } else {
              // Trade
              const partner = state.humans.find(
                other => other.id !== h.id && other.alive &&
                Math.hypot(other.position[0] - h.position[0], other.position[2] - h.position[2]) < 5
              );
              if (partner && Math.random() < 0.01) {
                // Exchange resources
                const giveItems = Object.entries(h.inventory).filter(([_, v]) => v > 2) as [string, number][];
                if (giveItems.length > 0) {
                  const [giveKey, _] = giveItems[Math.floor(Math.random() * giveItems.length)];
                  const key = giveKey as keyof Inventory;
                  h.inventory[key]--;
                  // Partner receives
                  // (simplified - just transfer)
                }
              }
              h.state = 'idle';
              h.target = null;
            }
          } else {
            h.state = 'idle';
          }
          break;
        }

        case 'fighting': {
          if (h.target) {
            const dx = h.target[0] - h.position[0];
            const dz = h.target[2] - h.position[2];
            const dist = Math.hypot(dx, dz);
            if (dist > 2) {
              h.position[0] += (dx / dist) * moveSpeed * 1.5;
              h.position[2] += (dz / dist) * moveSpeed * 1.5;
            }
          }
          break;
        }

        case 'building': {
          if (h.target) {
            const dx = h.target[0] - h.position[0];
            const dz = h.target[2] - h.position[2];
            const dist = Math.hypot(dx, dz);
            if (dist > 2) {
              h.position[0] += (dx / dist) * moveSpeed;
              h.position[2] += (dz / dist) * moveSpeed;
            } else {
              h.skills.building = Math.min(10, h.skills.building + 0.01);
              h.state = 'idle';
              h.target = null;
            }
          } else {
            h.state = 'idle';
          }
          break;
        }
      }

      // Clamp to world bounds
      h.position[0] = Math.max(-WORLD_SIZE / 2, Math.min(WORLD_SIZE / 2, h.position[0]));
      h.position[2] = Math.max(-WORLD_SIZE / 2, Math.min(WORLD_SIZE / 2, h.position[2]));

      return h;
    });

    // Update animals
    const newAnimals = state.animals.map(animal => {
      const a = { ...animal, position: [...animal.position] as [number, number, number] };
      const moveSpeed = 3 * dt;

      switch (a.state) {
        case 'wandering': {
          if (!a.target || Math.random() < 0.005) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 20 + Math.random() * 60;
            a.target = [
              a.position[0] + Math.cos(angle) * dist,
              0,
              a.position[2] + Math.sin(angle) * dist,
            ];
          }
          if (a.target) {
            const dx = a.target[0] - a.position[0];
            const dz = a.target[2] - a.position[2];
            const dist = Math.hypot(dx, dz);
            if (dist > 2) {
              a.position[0] += (dx / dist) * moveSpeed * 0.5;
              a.position[2] += (dz / dist) * moveSpeed * 0.5;
            }
          }
          // Check for nearby humans (prey animals flee)
          if (['deer', 'rabbit'].includes(a.type)) {
            const nearHuman = newHumans.find(h => h.alive && Math.hypot(h.position[0] - a.position[0], h.position[2] - a.position[2]) < 15);
            if (nearHuman) {
              a.state = 'fleeing';
              const dx = a.position[0] - nearHuman.position[0];
              const dz = a.position[2] - nearHuman.position[2];
              const dist = Math.hypot(dx, dz) || 1;
              a.target = [a.position[0] + (dx / dist) * 50, 0, a.position[2] + (dz / dist) * 50];
            }
          }
          // Predators hunt
          if (['wolf', 'bear'].includes(a.type)) {
            const nearHuman = newHumans.find(h => h.alive && Math.hypot(h.position[0] - a.position[0], h.position[2] - a.position[2]) < 20);
            if (nearHuman && Math.random() < 0.001) {
              a.state = 'attacking';
              a.target = [...nearHuman.position] as [number, number, number];
            }
          }
          break;
        }
        case 'fleeing': {
          if (a.target) {
            const dx = a.target[0] - a.position[0];
            const dz = a.target[2] - a.position[2];
            const dist = Math.hypot(dx, dz);
            if (dist > 2) {
              a.position[0] += (dx / dist) * moveSpeed * 2;
              a.position[2] += (dz / dist) * moveSpeed * 2;
            } else {
              a.state = 'wandering';
              a.target = null;
            }
          }
          break;
        }
        case 'attacking': {
          if (a.target) {
            const dx = a.target[0] - a.position[0];
            const dz = a.target[2] - a.position[2];
            const dist = Math.hypot(dx, dz);
            if (dist > 2) {
              a.position[0] += (dx / dist) * moveSpeed * 1.5;
              a.position[2] += (dz / dist) * moveSpeed * 1.5;
            } else {
              // Attack nearest human
              const nearHuman = newHumans.find(h => h.alive && Math.hypot(h.position[0] - a.position[0], h.position[2] - a.position[2]) < 4);
              if (nearHuman) {
                nearHuman.health -= 5;
              }
              if (Math.random() < 0.01) {
                a.state = 'wandering';
                a.target = null;
              }
            }
          }
          break;
        }
      }

      // Clamp
      a.position[0] = Math.max(-WORLD_SIZE / 2, Math.min(WORLD_SIZE / 2, a.position[0]));
      a.position[2] = Math.max(-WORLD_SIZE / 2, Math.min(WORLD_SIZE / 2, a.position[2]));

      return a;
    });

    // Resource regeneration
    const newResources = state.resources.map(r => {
      const res = { ...r };
      if (res.amount < res.maxAmount) {
        res.regenTimer += dt;
        if (res.regenTimer > 30) { // Regenerate after 30 seconds
          res.amount = Math.min(res.maxAmount, res.amount + 1);
          res.regenTimer = 0;
        }
      }
      return res;
    });

    // Birth new humans
    let newHumansFinal = [...newHumans];
    const aliveHumans = newHumansFinal.filter(h => h.alive);
    if (aliveHumans.length >= 2 && Math.random() < 0.0001 * dt && aliveHumans.length < 50) {
      const parent = aliveHumans[Math.floor(Math.random() * aliveHumans.length)];
      const baby = createHuman(parent.position[0] + (Math.random() - 0.5) * 5, parent.position[2] + (Math.random() - 0.5) * 5);
      baby.age = 0;
      newHumansFinal.push(baby);
      get().addNotification(`Родился новый житель: ${baby.name}!`);
    }

    // Technology research
    const newTechs = [...state.technologies];
    const crafters = aliveHumans.filter(h => h.skills.crafting >= 3);
    if (crafters.length > 0 && Math.random() < 0.00005 * dt) {
      const locked = newTechs.filter(t => !t.unlocked);
      if (locked.length > 0) {
        const tech = locked[0];
        // Check if colony has resources
        const totalInventory = aliveHumans.reduce((acc, h) => {
          Object.entries(h.inventory).forEach(([k, v]) => {
            acc[k as keyof Inventory] = (acc[k as keyof Inventory] || 0) + v;
          });
          return acc;
        }, {} as Record<string, number>);

        const canAfford = Object.entries(tech.cost).every(([k, v]) => (totalInventory[k] || 0) >= (v as number));
        if (canAfford) {
          // Spend resources
          Object.entries(tech.cost).forEach(([k, v]) => {
            let remaining = v as number;
            for (const h of newHumansFinal) {
              if (!h.alive) continue;
              const key = k as keyof Inventory;
              const take = Math.min(h.inventory[key], remaining);
              h.inventory[key] -= take;
              remaining -= take;
              if (remaining <= 0) break;
            }
          });
          tech.unlocked = true;
          get().addNotification(`🔬 Исследована технология: ${tech.name}!`);
        }
      }
    }

    // Determine era
    const unlockedCount = newTechs.filter(t => t.unlocked).length;
    let era = 'Каменный век';
    if (unlockedCount >= 12) era = 'Современность';
    else if (unlockedCount >= 9) era = 'Индустриальная эра';
    else if (unlockedCount >= 6) era = 'Средневековье';
    else if (unlockedCount >= 4) era = 'Бронзовый век';
    else if (unlockedCount >= 2) era = 'Поздний каменный век';

    // Auto-save every 5 minutes
    const now = Date.now();
    if (now - state.lastSave > 5 * 60 * 1000) {
      get().saveGame();
    }

    set({
      humans: newHumansFinal,
      animals: newAnimals,
      resources: newResources,
      technologies: newTechs,
      time: newTime,
      day: newDay,
      population: newHumansFinal.filter(h => h.alive).length,
      era,
    });
  },

  addNotification: (msg: string) => {
    set(state => ({
      notifications: [msg, ...state.notifications].slice(0, 20),
    }));
  },

  setCameraMode: (mode: 'free' | 'follow') => set({ cameraMode: mode }),
  selectHuman: (id: string | null) => set({ selectedHuman: id }),
  setSpeed: (speed: number) => set({ speed }),

  saveGame: () => {
    const state = get();
    const saveData = {
      humans: state.humans,
      buildings: state.buildings,
      animals: state.animals,
      resources: state.resources,
      technologies: state.technologies,
      day: state.day,
      time: state.time,
      era: state.era,
    };
    localStorage.setItem('colony_save', JSON.stringify(saveData));
    set({ lastSave: Date.now() });
    get().addNotification('💾 Игра сохранена');
  },

  loadGame: () => {
    get().initWorld();
  },
}));

export default useStore;
