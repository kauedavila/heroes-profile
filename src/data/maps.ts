/**
 * maps.ts
 *
 * Este arquivo exporta o array MAPS contendo todos os mapas do jogo.
 * Cada objeto do array representa um mapa jogável ou local de recrutamento.
 *
 * Estrutura de cada mapa:
 * - id: Identificador único do mapa
 * - name: Nome exibido
 * - type: Tipo do mapa ("monster" para combate, "recruitment" para recrutamento)
 * - description: Descrição/lore do mapa
 * - backgroundImage: Nome do arquivo de imagem de fundo
 * - rounds: Número de rodadas (apenas mapas de combate)
 * - monsters: Lista de inimigos por rodada (apenas mapas de combate)
 * - rewards: Recompensas ao completar o mapa (ouro, experiência, itens)
 * - recruitmentCost: Custo para recrutar (apenas mapas de recrutamento)
 * - availableCharacters: Lista de personagens disponíveis para recrutamento
 *
 * Para adicionar novos mapas, basta incluir um novo objeto ao array MAPS.
 * Este arquivo é utilizado pelo sistema de dados do jogo para gerar cenários, batalhas e opções de recrutamento.
 */
import { GameMap } from "../types/game";

export const MAPS: GameMap[] = [
  // Plains area maps
  {
    id: "ice_dungeon_01",
    name: "Ice Dungeon Entrance",
    type: "monster",
    description: "An entrance to a cold dungeon filled with ice monsters",
    backgroundImage: "ice_1.png",
    rounds: 1,
    monsters: [{ id: "slime_icei", quantity: 2, round: 1 }],
  },
  {
    id: "village_recruitment_01",
    name: "Peaceful Village",
    type: "recruitment",
    description: "A small village where heroes can be recruited",
    backgroundImage: "village_bg.png",
    recruitmentCost: 100,
    availableCharacters: [
      {
        class: "warrior",
        level: 1,
        cost: 150,
        stats: { hp: 80, attack: 15, defense: 12, speed: 8, magic: 2 },
      },
      {
        class: "archer",
        level: 1,
        cost: 120,
        stats: { hp: 60, attack: 12, defense: 8, speed: 15, magic: 5 },
      },
      {
        class: "mage",
        level: 1,
        cost: 180,
        stats: { hp: 45, attack: 8, defense: 6, speed: 10, magic: 20 },
      },
    ],
  },
];
