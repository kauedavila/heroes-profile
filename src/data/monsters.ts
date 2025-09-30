/**
 * monsters.ts
 *
 * Este arquivo exporta o array MONSTERS contendo todos os monstros do jogo.
 * Cada objeto do array representa um monstro enfrentado nas batalhas.
 *
 * Estrutura de cada monstro:
 * - id: Identificador único do monstro
 * - name: Nome exibido
 * - image: Nome do arquivo de imagem do monstro
 * - level: Nível do monstro
 * - stats: Atributos (hp, attack, defense, speed, magic)
 * - abilities: Lista de habilidades
 * - rewards: Recompensas ao derrotar (ouro, experiência)
 * - dropItems: Lista de itens que podem ser dropados (com chance)
 *
 * Para adicionar novos monstros, basta incluir um novo objeto ao array MONSTERS.
 * Este arquivo é utilizado pelo sistema de dados do jogo para gerar batalhas e recompensas.
 */

import { Monster } from "../types/game";

export const MONSTERS: Monster[] = [
  {
    id: "goblin_01",
    name: "Goblin Warrior",
    image: "goblin_warrior.png",
    level: 1,
    stats: {
      hp: 45,
      attack: 12,
      defense: 8,
      speed: 15,
      magic: 2,
    },
    abilities: ["Slash", "Guard"],
    rewards: {
      gold: 25,
      experience: 30,
    },
    dropItems: [
      { item: "rusty_sword", chance: 0.1 },
      { item: "healing_potion", chance: 0.3 },
    ],
  },
  // Slime Ice monsters
  {
    id: "slime_icei",
    name: "Slime Icei",
    image: ["slime_icei.png", "slime_iceii.png", "slime_iceiii.png"],
    level: 2,
    stats: {
      hp: 30,
      attack: 8,
      defense: 6,
      speed: 10,
      magic: 5,
    },
    abilities: ["Freeze", "Bounce"],
    rewards: {
      gold: 15,
      experience: 20,
    },
    dropItems: [
      { item: "ice_gel", chance: 0.4 },
      { item: "healing_potion", chance: 0.2 },
    ],
  },
  {
    id: "slime_iceii",
    name: "Slime Iceii",
    image: ["slime_icei.png", "slime_iceii.png", "slime_iceiii.png"],
    level: 3,
    stats: {
      hp: 40,
      attack: 10,
      defense: 8,
      speed: 12,
      magic: 8,
    },
    abilities: ["Freeze", "Bounce", "Split"],
    rewards: {
      gold: 20,
      experience: 28,
    },
    dropItems: [
      { item: "ice_gel", chance: 0.5 },
      { item: "mana_potion", chance: 0.15 },
    ],
  },
  {
    id: "slime_iceiii",
    name: "Slime Iceiii",
    image: ["slime_icei.png", "slime_iceii.png", "slime_iceiii.png"],
    level: 4,
    stats: {
      hp: 55,
      attack: 13,
      defense: 10,
      speed: 14,
      magic: 12,
    },
    abilities: ["Freeze", "Bounce", "Split", "Ice Shield"],
    rewards: {
      gold: 30,
      experience: 40,
    },
    dropItems: [
      { item: "ice_gel", chance: 0.6 },
      { item: "rare_gem", chance: 0.05 },
    ],
  },
];
