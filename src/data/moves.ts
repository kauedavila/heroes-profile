/**
 * moves.ts
 *
 * Este arquivo exporta o array MOVES contendo todos os movimentos/habilidades do jogo.
 * Cada objeto do array representa um movimento que pode ser usado por personagens e monstros.
 *
 * Estrutura de cada movimento:
 * - id: Identificador único do movimento
 * - name: Nome exibido
 * - description: Descrição do movimento
 * - type: Tipo do movimento ("physical", "magical", "healing", "buff", "debuff")
 * - damageRatio: Fórmula de dano baseada em atributos (attack, magic, level)
 * - baseCooldown: Cooldown base em turnos
 * - targetType: Tipo de alvo ("single", "all_enemies", "all_allies", "self")
 * - effects: Efeitos especiais (cura, buffs, debuffs)
 *
 * Para adicionar novos movimentos, basta incluir um novo objeto ao array MOVES.
 * Este arquivo é utilizado pelo sistema de batalha para calcular danos e efeitos.
 */

import { Move } from "../types/game";

export const MOVES: Move[] = [
  // Basic Attack Moves
  {
    id: "basic_attack",
    name: "Attack",
    description: "A basic physical attack",
    type: "physical",
    damageRatio: {
      attack: 1.0,
      magic: 0.0,
      level: 0.1,
    },
    baseCooldown: 0,
    targetType: "single",
    animation: "attack-shake",
  },
  {
    id: "slash",
    name: "Slash",
    description: "A powerful sword strike",
    type: "physical",
    damageRatio: {
      attack: 1.2,
      magic: 0.0,
      level: 0.15,
    },
    baseCooldown: 1,
    targetType: "single",
    animation: "attack-slash",
  },
  {
    id: "power_strike",
    name: "Power Strike",
    description: "A devastating physical blow",
    type: "physical",
    damageRatio: {
      attack: 1.5,
      magic: 0.0,
      level: 0.2,
    },
    baseCooldown: 3,
    targetType: "single",
    animation: "attack-strike",
  },

  // Magic Moves
  {
    id: "fireball",
    name: "Fireball",
    description: "A blazing ball of fire",
    type: "magical",
    damageRatio: {
      attack: 0.0,
      magic: 1.5,
      level: 0.2,
    },
    baseCooldown: 2,
    targetType: "single",
    animation: "attack-pulse",
  },
  {
    id: "ice_shard",
    name: "Ice Shard",
    description: "A sharp projectile of ice",
    type: "magical",
    damageRatio: {
      attack: 0.0,
      magic: 1.3,
      level: 0.15,
    },
    baseCooldown: 2,
    targetType: "single",
    animation: "attack-pulse",
  },
  {
    id: "lightning_bolt",
    name: "Lightning Bolt",
    description: "A crackling bolt of electricity",
    type: "magical",
    damageRatio: {
      attack: 0.0,
      magic: 1.7,
      level: 0.25,
    },
    baseCooldown: 4,
    targetType: "single",
    animation: "attack-flash",
  },

  // Healing Moves
  {
    id: "heal",
    name: "Heal",
    description: "Restores health to target",
    type: "healing",
    damageRatio: {
      attack: 0.0,
      magic: 1.2,
      level: 0.3,
    },
    baseCooldown: 2,
    targetType: "single",
    animation: "heal-glow",
    effects: {
      heal: 1.0, // Multiplier for healing amount
    },
  },
  {
    id: "mass_heal",
    name: "Mass Heal",
    description: "Heals all allies",
    type: "healing",
    damageRatio: {
      attack: 0.0,
      magic: 0.8,
      level: 0.2,
    },
    baseCooldown: 5,
    targetType: "all_allies",
    animation: "heal-glow",
    effects: {
      heal: 1.0,
    },
  },

  // Defensive Moves
  {
    id: "guard",
    name: "Guard",
    description: "Reduces incoming damage",
    type: "buff",
    damageRatio: {
      attack: 0.0,
      magic: 0.0,
      level: 0.0,
    },
    baseCooldown: 0,
    targetType: "self",
    animation: "defend-pulse",
    effects: {
      buffStats: { defense: 5 },
      duration: 1,
    },
  },
  {
    id: "shield",
    name: "Shield",
    description: "Grants temporary defense boost",
    type: "buff",
    damageRatio: {
      attack: 0.0,
      magic: 0.0,
      level: 0.0,
    },
    baseCooldown: 3,
    targetType: "single",
    animation: "defend-pulse",
    effects: {
      buffStats: { defense: 8, hp: 10 },
      duration: 3,
    },
  },

  // Monster-specific moves
  {
    id: "bounce",
    name: "Bounce",
    description: "A bouncing attack",
    type: "physical",
    damageRatio: {
      attack: 0.9,
      magic: 0.0,
      level: 0.1,
    },
    baseCooldown: 1,
    targetType: "single",
    animation: "attack-bounce",
  },
  {
    id: "freeze",
    name: "Freeze",
    description: "Slows the target with ice",
    type: "magical",
    damageRatio: {
      attack: 0.0,
      magic: 1.1,
      level: 0.1,
    },
    baseCooldown: 2,
    targetType: "single",
    animation: "attack-pulse",
    effects: {
      debuffStats: { speed: -3 },
      duration: 2,
    },
  },

  // Advanced moves
  {
    id: "whirlwind",
    name: "Whirlwind",
    description: "Attacks all enemies",
    type: "physical",
    damageRatio: {
      attack: 0.8,
      magic: 0.0,
      level: 0.15,
    },
    baseCooldown: 4,
    targetType: "all_enemies",
    animation: "attack-spin",
  },
  {
    id: "meteor",
    name: "Meteor",
    description: "A devastating magical attack on all enemies",
    type: "magical",
    damageRatio: {
      attack: 0.0,
      magic: 1.4,
      level: 0.3,
    },
    baseCooldown: 6,
    targetType: "all_enemies",
    animation: "attack-flash",
  },
];