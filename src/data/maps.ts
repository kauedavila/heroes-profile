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
 * - recruitmentCost: Custo base para recrutar (apenas mapas de recrutamento)
 * - availableCharacters: Lista de personagens disponíveis para recrutamento (apenas mapas de recrutamento)
 *   - id: ID do monstro no banco de dados (monsters.ts)
 *   - cost: Custo adicional para recrutar este personagem específico
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
    backgroundImage: "ice_dungeon_01.png",
    rounds: 1,
    monsters: [{ id: "slime_icei", quantity: 2, round: 1 }],
  },
  {
    id: "village_recruitment_01",
    name: "Peaceful Village",
    type: "recruitment",
    description: "A small village where heroes can be recruited",
    backgroundImage: "ice_dungeon_01.png",
    recruitmentCost: 100,
    availableCharacters: [
      {
        id: "slime_icei",
        cost: 150,
      },
    ],
  },
];

// Map image mapping (add all used images here)
export const mapImages: { [key: string]: any } = {
  "ice_dungeon_01.png": require("../../assets/maps/ice_dungeon_01.png"),
  "ice_dungeon_02.png": require("../../assets/maps/ice_dungeon_02.png"),
  "ice_dungeon_03.png": require("../../assets/maps/ice_dungeon_03.png"),
};
