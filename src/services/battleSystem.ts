import { BattleCharacter, BattleAction, BattleState, Character, Monster } from '../types/game';

export class BattleSystem {
  private battleState: BattleState;
  private onStateChange: (state: BattleState) => void;
  private battleTimer: NodeJS.Timeout | null = null;

  constructor(
    playerParty: Character[],
    enemies: Monster[],
    onStateChange: (state: BattleState) => void
  ) {
    this.onStateChange = onStateChange;
    this.battleState = this.initializeBattle(playerParty, enemies);
  }

  private initializeBattle(playerParty: Character[], enemies: Monster[]): BattleState {
    const characters: BattleCharacter[] = [];

    // Add player characters
    playerParty.forEach((char, index) => {
      characters.push({
        ...char,
        id: `player_${index}`,
        currentHp: char.stats.hp,
        actionMeter: 0,
        isPlayerControlled: true
      });
    });

    // Add enemy characters
    enemies.forEach((enemy, index) => {
      characters.push({
        id: `enemy_${index}`,
        name: enemy.name,
        class: 'monster',
        level: enemy.level,
        stats: { ...enemy.stats },
        experience: 0,
        abilities: enemy.abilities,
        equipment: {},
        currentHp: enemy.stats.hp,
        actionMeter: 0,
        isPlayerControlled: false
      });
    });

    return {
      characters,
      currentRound: 1,
      totalRounds: 1,
      isPlayerTurn: false,
      actionQueue: [],
      battleLog: ['Battle begins!']
    };
  }

  startBattle(): void {
    this.battleTimer = setInterval(() => {
      this.updateActionMeters();
    }, 100); // Update every 100ms for smooth animation
  }

  stopBattle(): void {
    if (this.battleTimer) {
      clearInterval(this.battleTimer);
      this.battleTimer = null;
    }
  }

  private updateActionMeters(): void {
    let shouldUpdate = false;

    this.battleState.characters.forEach(character => {
      if (character.currentHp > 0) {
        // Action meter fills based on character's speed
        // Higher speed = faster meter fill
        const speedMultiplier = character.stats.speed / 10;
        character.actionMeter += speedMultiplier;

        if (character.actionMeter >= 100) {
          character.actionMeter = 100;
          shouldUpdate = true;
        }
      }
    });

    if (shouldUpdate) {
      this.checkForReadyCharacters();
    }

    this.onStateChange({ ...this.battleState });
  }

  private checkForReadyCharacters(): void {
    const readyCharacters = this.battleState.characters.filter(
      char => char.currentHp > 0 && char.actionMeter >= 100
    );

    if (readyCharacters.length > 0) {
      const nextCharacter = readyCharacters[0];
      
      if (nextCharacter.isPlayerControlled) {
        this.battleState.isPlayerTurn = true;
        // Pause the battle timer to wait for player input
        this.stopBattle();
      } else {
        // AI takes action immediately
        this.performAIAction(nextCharacter);
      }
    }
  }

  private performAIAction(character: BattleCharacter): void {
    const playerCharacters = this.battleState.characters.filter(
      char => char.isPlayerControlled && char.currentHp > 0
    );

    if (playerCharacters.length === 0) {
      // Player party defeated
      this.endBattle(false);
      return;
    }

    // Simple AI: attack random player character
    const target = playerCharacters[Math.floor(Math.random() * playerCharacters.length)];
    const action: BattleAction = {
      type: 'attack',
      source: character,
      target
    };

    this.executeAction(action);
  }

  performPlayerAction(action: BattleAction): void {
    if (!this.battleState.isPlayerTurn) {
      return;
    }

    this.executeAction(action);
    this.battleState.isPlayerTurn = false;
    
    // Resume battle timer
    this.startBattle();
  }

  private executeAction(action: BattleAction): void {
    const { source, target, type } = action;

    switch (type) {
      case 'attack':
        this.performAttack(source, target!);
        break;
      case 'ability':
        this.performAbility(source, target, action.abilityId!);
        break;
      case 'guard':
        this.performGuard(source);
        break;
      case 'item':
        this.performItemUse(source, target, action.itemId!);
        break;
    }

    // Reset action meter after action
    source.actionMeter = 0;

    // Check battle end conditions
    this.checkBattleEnd();

    this.onStateChange({ ...this.battleState });
  }

  private performAttack(attacker: BattleCharacter, target: BattleCharacter): void {
    const baseDamage = attacker.stats.attack;
    const defense = target.stats.defense;
    
    // Calculate damage with some randomness
    const damage = Math.max(1, Math.floor(
      (baseDamage - defense / 2) * (0.8 + Math.random() * 0.4)
    ));

    target.currentHp = Math.max(0, target.currentHp - damage);

    const logMessage = `${attacker.name} attacks ${target.name} for ${damage} damage!`;
    this.battleState.battleLog.push(logMessage);

    if (target.currentHp === 0) {
      this.battleState.battleLog.push(`${target.name} is defeated!`);
    }
  }

  private performAbility(
    caster: BattleCharacter, 
    target: BattleCharacter | undefined, 
    abilityId: string
  ): void {
    // Simple ability system - could be expanded
    const ability = caster.abilities.find(ab => ab === abilityId);
    if (!ability) return;

    let damage = 0;
    let healing = 0;

    switch (abilityId) {
      case 'Fireball':
        damage = Math.floor(caster.stats.magic * 1.5);
        break;
      case 'Heal':
        healing = Math.floor(caster.stats.magic * 1.2);
        break;
      case 'Power Strike':
        damage = Math.floor(caster.stats.attack * 1.3);
        break;
      default:
        damage = caster.stats.attack;
    }

    if (target && damage > 0) {
      const actualDamage = Math.max(1, damage - target.stats.defense / 2);
      target.currentHp = Math.max(0, target.currentHp - actualDamage);
      this.battleState.battleLog.push(
        `${caster.name} uses ${abilityId} on ${target.name} for ${actualDamage} damage!`
      );
    }

    if (target && healing > 0) {
      const actualHealing = Math.min(healing, target.stats.hp - target.currentHp);
      target.currentHp += actualHealing;
      this.battleState.battleLog.push(
        `${caster.name} heals ${target.name} for ${actualHealing} HP!`
      );
    }
  }

  private performGuard(character: BattleCharacter): void {
    // Guarding reduces incoming damage for the next turn
    this.battleState.battleLog.push(`${character.name} takes a defensive stance!`);
  }

  private performItemUse(
    user: BattleCharacter, 
    target: BattleCharacter | undefined, 
    itemId: string
  ): void {
    // Simple item system
    switch (itemId) {
      case 'healing_potion':
        if (target) {
          const healing = 50;
          const actualHealing = Math.min(healing, target.stats.hp - target.currentHp);
          target.currentHp += actualHealing;
          this.battleState.battleLog.push(
            `${user.name} uses Healing Potion on ${target.name} for ${actualHealing} HP!`
          );
        }
        break;
    }
  }

  private checkBattleEnd(): void {
    const alivePlayerCharacters = this.battleState.characters.filter(
      char => char.isPlayerControlled && char.currentHp > 0
    );

    const aliveEnemyCharacters = this.battleState.characters.filter(
      char => !char.isPlayerControlled && char.currentHp > 0
    );

    if (alivePlayerCharacters.length === 0) {
      this.endBattle(false);
    } else if (aliveEnemyCharacters.length === 0) {
      this.endBattle(true);
    }
  }

  private endBattle(playerWon: boolean): void {
    this.stopBattle();
    
    if (playerWon) {
      this.battleState.battleLog.push('Victory! The enemies have been defeated!');
    } else {
      this.battleState.battleLog.push('Defeat! Your party has been defeated...');
    }

    this.onStateChange({ ...this.battleState });
  }

  getBattleState(): BattleState {
    return { ...this.battleState };
  }

  getAvailableTargets(isPlayerAction: boolean): BattleCharacter[] {
    if (isPlayerAction) {
      // Player can target enemies
      return this.battleState.characters.filter(
        char => !char.isPlayerControlled && char.currentHp > 0
      );
    } else {
      // Enemies can target players
      return this.battleState.characters.filter(
        char => char.isPlayerControlled && char.currentHp > 0
      );
    }
  }

  getAvailableAllies(isPlayerAction: boolean): BattleCharacter[] {
    if (isPlayerAction) {
      // Player can target allies
      return this.battleState.characters.filter(
        char => char.isPlayerControlled && char.currentHp > 0
      );
    } else {
      // Enemies can target other enemies
      return this.battleState.characters.filter(
        char => !char.isPlayerControlled && char.currentHp > 0
      );
    }
  }
}