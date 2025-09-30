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
    id: "slime_icei",
    name: "Ice Slime",
    image: ["Slime Icei.png", "Slime Iceii.png", "Slime Iceiii.png"],
    imageWidth: 140,
    imageHeight: 140,
    level: 2,
    stats: {
      hp: 30,
      attack: 8,
      defense: 6,
      speed: 10,
      magic: 5,
    },
    moves: ["freeze", "bounce"],
    rewards: {
      gold: 15,
      experience: 20,
    },
    dropItems: [
      { item: "ice_gel", chance: 0.4 },
      { item: "healing_potion", chance: 0.2 },
    ],
  },
];

export const monsterImages: { [key: string]: any } = {
  "Slime Icei.png": require("../../assets/monsters/Slime Icei.png"),
  "Slime Iceii.png": require("../../assets/monsters/Slime Iceii.png"),
  "Slime Iceiii.png": require("../../assets/monsters/Slime Iceiii.png"),
};
