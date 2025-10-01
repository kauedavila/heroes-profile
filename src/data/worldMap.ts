/**
 * worldMap.ts
 *
 * Este arquivo exporta o objeto WORLD_MAP que define a estrutura do mapa-múndi do jogo.
 * Contém informações sobre o mundo, regiões jogáveis e conexões entre elas.
 *
 * Estrutura:
 * - name: Nome do mundo
 * - description: Descrição/lore do mundo
 * - regions: Array de regiões, cada uma com:
 *     - id: Identificador único da região
 *     - name: Nome exibido
 *     - description: Descrição/lore da região
 *     - position: Coordenadas x/y para posicionamento no mapa
 *     - unlocked: Se a região está acessível
 *     - unlockRequirement: Requisitos para desbloquear (completedMaps, playerLevel)
 *     - maps: Lista de IDs de mapas associados à região
 * - connections: Array de caminhos entre regiões (de, para, nome do caminho)
 *
 * Para adicionar novas regiões ou conexões, basta incluir novos objetos nos arrays correspondentes.
 * Este arquivo é utilizado para renderizar o mapa-múndi e controlar a progressão do jogador.
 */
import { WorldMap } from "../types/game";

export const WORLD_MAP: WorldMap = {
  name: "Midgard",
  description: "A vast world filled with dangers and opportunities",
  regions: [
    {
      id: "ice_dungeon",
      name: "Ice Dungeon",
      description: "A cold and treacherous dungeon filled with ice monsters",
      position: { x: 900, y: 0 },
      unlocked: true,
      maps: ["ice_dungeon_01", "village_recruitment_01"],
    },
    {
      id: "dark_forest",
      name: "Dark Forest",
      description: "Ancient woods where shadows hide dangerous creatures",
      position: { x: 300, y: 150 },
      unlocked: false,
      unlockRequirement: {
        completedMaps: ["plains_monsters_01"],
        playerLevel: 3,
      },
      maps: [
        "forest_monsters_01",
        "forest_monsters_02",
        "druid_recruitment_01",
      ],
    },
  ],
  connections: [
    {
      from: "starting_plains",
      to: "dark_forest",
      path: "forest_path",
    },
  ],
};
