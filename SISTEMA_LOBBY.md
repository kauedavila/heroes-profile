# Sistema de Lobby - Gerenciamento de Grupo

## Resumo
O sistema de lobby substitui o mapa-múndi como tela principal após iniciar ou carregar um jogo. Ele fornece funcionalidades completas de gerenciamento de grupo, permitindo aos jogadores organizar seus personagens para batalha.

## Funcionalidades Implementadas

### 1. Tela de Lobby
- Exibe o background do último mapa visitado (armazenado em `GameState.lastMapBackground`)
- Usa um background padrão se nenhum mapa foi visitado ainda (atualmente usando ice_dungeon_01.png temporariamente)
- Fornece navegação para:
  - Mapa-Múndi (para selecionar missões)
  - Menu Principal (para salvar/carregar/sair)

### 2. Gerenciamento de Grupo
- **Tamanho Máximo do Grupo**: 4 personagens ativos
- **Sistema de Reserva**: Capacidade ilimitada para personagens que não estão no grupo ativo
- Personagens podem ser movidos entre grupo e reserva
- Cada personagem exibe:
  - Nome, classe e nível
  - Estatísticas (HP, Ataque, Defesa, Velocidade, Magia)
  - Potencial (se aplicável)
  - Posição atual (Linha de frente ou Linha de trás)

### 3. Sistema de Posicionamento em Batalha

#### Linha de Frente (Front Row)
- Posição padrão para todos os personagens
- Dano normal causado e recebido
- **Maior prioridade de alvo**: 70% de chance de ser alvo da IA inimiga quando ambas as linhas existem

#### Linha de Trás (Back Row)
- **Metade do dano causado**: Todos os ataques e habilidades causam 50% de dano
- **Metade do dano recebido**: Todo dano recebido é reduzido em 50%
- **Menor prioridade de alvo**: 30% de chance de ser alvo quando a linha de frente existe
- Distinção visual na batalha (levemente transparente e menor)

#### Alternar Posição
- Jogadores podem alternar a posição do personagem entre linha de frente e linha de trás no lobby
- A posição é persistente entre batalhas e salvamentos

### 4. Posicionamento de Monstros
- Monstros vêm por padrão na linha de frente
- Pode ser configurado por monstro no banco de dados definindo o campo `position` como "back"
- Exemplo em `src/data/monsters.ts`:
```typescript
{
  id: "monster_id",
  name: "Nome do Monstro",
  // ... outras propriedades
  position: "back" // Opcional, padrão é "front"
}
```

### 5. Atualizações na Tela de Batalha
- Indicadores visuais mostram as posições dos personagens (badges FRONT/BACK)
- Personagens na linha de trás são renderizados com:
  - 85% de opacidade
  - 90% de escala
  - Badge azul (vs. verde para linha de frente)

### 6. Persistência de Dados
- Posições dos personagens salvas no estado do jogo
- Array de reserva salvo no estado do jogo
- Background do último mapa visitado salvo
- Migração automática para salvamentos existentes (adiciona campos ausentes)

## Fluxo de Navegação

```
Menu Principal
    ↓
  Lobby (NOVO PADRÃO)
    ↓ ↔ Mapa-Múndi
    ↓     ↓
    ↓   Batalha
    ↓     ↓
    ↓   Vitória/Derrota
    ↓     ↓
  ← ← ← Lobby
```

## Mecânicas de Batalha

### Cálculo de Dano
```typescript
// Atacante na linha de trás
dano = danoBase * 0.5;

// Defensor na linha de trás
danoRecebido = danoRecebido * 0.5;

// Ambos na linha de trás
danoFinal = danoBase * 0.5 * 0.5 = danoBase * 0.25
```

### Seleção de Alvo pela IA
```typescript
// Lógica de prioridade
if (alvosLinhaFrente.length > 0 && random() < 0.7) {
  alvo = alvoAleatorioLinhaFrente;
} else if (alvosLinhaTras.length > 0) {
  alvo = alvoAleatorioLinhaTras;
}
```

## Exemplos de Uso

### Movendo Personagens
1. Abra a tela de Lobby
2. Toque em um personagem no grupo
3. Toque no botão "Reserve" para mover para reserva
4. Toque em um personagem da reserva
5. Toque em "Add to Party" para voltar ao grupo (se não estiver cheio)

### Mudando Posição
1. Abra a tela de Lobby
2. Toque em um personagem no grupo ativo
3. Toque em "→ Back" para mover para linha de trás (ou "→ Front" para mover para frente)
4. A posição é imediatamente salva e usada na próxima batalha

### Recrutamento
- Quando o grupo está cheio (4 personagens), novos recrutas vão automaticamente para a reserva
- Mensagem de sucesso indica se o personagem entrou no grupo ou na reserva

## Arquivos Modificados

1. **App.tsx** - Fluxo de navegação, limites de tamanho do grupo
2. **src/types/game.ts** - Campos de posição e reserva
3. **src/services/storageService.ts** - Persistência e migração
4. **src/services/battleSystem.ts** - Dano baseado em posição e seleção de alvo pela IA
5. **src/screens/BattleScreen.tsx** - Indicadores de posição e estilo visual
6. **src/screens/LobbyScreen.tsx** (NOVO) - Interface completa de gerenciamento de grupo

## Implementação Completa

Todos os requisitos do problema original foram implementados:

✅ Tela principal não é mais o worldmap, mas um lobby
✅ Background é o último mapa visitado (ou padrão se não houver)
✅ Grupo exibido ao centro com gerenciamento completo
✅ Acesso ao worldmap e menu principal
✅ Mover personagens entre grupo e reserva
✅ Posicionar personagens na linha de frente ou trás
✅ Personagens na linha de trás: menos probabilidade de alvo, metade do dano causado/recebido
✅ Monstros por padrão na linha de frente, configurável no database
✅ Dados dos personagens exibidos no gerenciamento
