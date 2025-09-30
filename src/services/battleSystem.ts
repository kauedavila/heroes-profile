import {
  BattleCharacter,
  BattleAction,
  BattleState,
  Character,
  Monster,
  Move,
} from "../types/game";
import { GameDataService } from "./gameDataService";

export class BattleSystem {
  private battleState: BattleState;
  private onStateChange: (state: BattleState) => void;
  private battleTimer: NodeJS.Timeout | null = null;
  private gameDataService: GameDataService;

  constructor(
    playerParty: Character[],
    enemies: Monster[],
    onStateChange: (state: BattleState) => void,
    gameDataService: GameDataService
  ) {
    this.onStateChange = onStateChange;
    this.gameDataService = gameDataService;
    this.battleState = this.initializeBattle(playerParty, enemies);
  }

  private initializeBattle(
    playerParty: Character[],
    enemies: Monster[]
  ): BattleState {
    const characters: BattleCharacter[] = [];

    // Add player characters
    playerParty.forEach((char, index) => {
      characters.push({
        ...char,
        id: `player_${index}`,
        currentHp: char.stats.hp,
        actionMeter: 0,
        isPlayerControlled: true,
        moveCooldowns: {},
        // image: char.image || null, // Uncomment if you add images for player characters
      });
    });

    // Add enemy characters
    enemies.forEach((enemy, index) => {
      let selectedImage = null;
      if (Array.isArray(enemy.image)) {
        const arr = enemy.image;
        selectedImage = arr[Math.floor(Math.random() * arr.length)];
      } else {
        selectedImage = enemy.image;
      }
      characters.push({
        id: `enemy_${index}`,
        name: enemy.name,
        class: "monster",
        level: enemy.level,
        stats: { ...enemy.stats },
        experience: 0,
        moves: enemy.moves,
        equipment: {},
        currentHp: enemy.stats.hp,
        actionMeter: 0,
        isPlayerControlled: false,
        moveCooldowns: {},
        image: selectedImage,
        imageWidth: enemy.imageWidth,
        imageHeight: enemy.imageHeight,
      });
    });

    return {
      characters,
      currentRound: 1,
      totalRounds: 1,
      currentTurn: 0,
      isPlayerTurn: false,
      actionQueue: [],
      battleLog: ["Battle begins!"],
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

    this.battleState.characters.forEach((character) => {
      if (character.currentHp > 0) {
        // Action meter fills based on character's speed
        // Higher speed = faster meter fill
        const speedMultiplier = character.stats.speed;
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
      (char) => char.currentHp > 0 && char.actionMeter >= 100
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
      (char) => char.isPlayerControlled && char.currentHp > 0
    );

    if (playerCharacters.length === 0) {
      // Player party defeated
      this.endBattle(false);
      return;
    }

    // Simple AI: choose random available move or basic attack
    let action: BattleAction;
    const availableMoves = character.moves.filter(
      (moveId) =>
        this.getMoveById(moveId) && (character.moveCooldowns[moveId] || 0) <= 0
    );

    if (availableMoves.length > 0 && Math.random() > 0.3) {
      // 70% chance to use a move instead of basic attack
      const moveId =
        availableMoves[Math.floor(Math.random() * availableMoves.length)];
      const target =
        playerCharacters[Math.floor(Math.random() * playerCharacters.length)];
      action = {
        type: "move",
        source: character,
        target,
        moveId,
      };
    } else {
      // Basic attack
      const target =
        playerCharacters[Math.floor(Math.random() * playerCharacters.length)];
      action = {
        type: "attack",
        source: character,
        target,
      };
    }

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

  private getMoveById(moveId: string): Move | null {
    return this.gameDataService.getMoveById(moveId);
  }

  private executeAction(action: BattleAction): void {
    const { source, target, type } = action;

    // Clear any existing animation
    source.currentAnimation = undefined;

    switch (type) {
      case "attack":
        source.currentAnimation = "attack-shake";
        this.performAttack(source, target!);
        break;
      case "move":
        const move = this.getMoveById(action.moveId!);
        if (move?.animation) {
          source.currentAnimation = move.animation;
        }
        this.performMove(source, target, action.moveId!);
        break;
      case "guard":
        source.currentAnimation = "defend-pulse";
        this.performGuard(source);
        break;
      case "item":
        this.performItemUse(source, target, action.itemId!);
        break;
    }

    // Clear animation after a delay
    setTimeout(() => {
      source.currentAnimation = undefined;
      this.onStateChange({ ...this.battleState });
    }, 500);

    // Advance turn and update cooldowns
    this.battleState.currentTurn++;
    this.updateCooldowns();

    // Reset action meter after action
    source.actionMeter = 0;

    // Check battle end conditions
    this.checkBattleEnd();

    this.onStateChange({ ...this.battleState });
  }

  private updateCooldowns(): void {
    this.battleState.characters.forEach((character) => {
      if (character.currentHp > 0) {
        // Reduce cooldowns based on agility (speed)
        // Higher agility reduces cooldowns faster
        const agilityBonus = Math.max(0.1, character.stats.speed / 100);

        for (const moveId in character.moveCooldowns) {
          if (character.moveCooldowns[moveId] > 0) {
            character.moveCooldowns[moveId] = Math.max(
              0,
              character.moveCooldowns[moveId] - (1 + agilityBonus)
            );
          }
        }
      }
    });
  }

  private performMove(
    caster: BattleCharacter,
    target: BattleCharacter | undefined,
    moveId: string
  ): void {
    const move = this.getMoveById(moveId);
    if (!move || !caster.moves.includes(moveId)) {
      this.battleState.battleLog.push(
        `${caster.name} tried to use an unknown move!`
      );
      return;
    }

    // Check if move is on cooldown
    if ((caster.moveCooldowns[moveId] || 0) > 0) {
      this.battleState.battleLog.push(`${move.name} is still on cooldown!`);
      return;
    }

    // Calculate damage/healing based on move formula
    const damageAmount = Math.floor(
      move.damageRatio.attack * caster.stats.attack +
        move.damageRatio.magic * caster.stats.magic +
        move.damageRatio.level * caster.level
    );

    // Apply cooldown (modified by agility for realism)
    const cooldownReduction = Math.max(0, caster.stats.speed / 20);
    const actualCooldown = Math.max(0, move.baseCooldown - cooldownReduction);
    if (actualCooldown > 0) {
      caster.moveCooldowns[moveId] = actualCooldown;
    }

    // Handle different move types
    switch (move.type) {
      case "physical":
      case "magical":
        if (target && damageAmount > 0) {
          const actualDamage = Math.max(
            1,
            damageAmount - target.stats.defense / 2
          );
          target.currentHp = Math.max(0, target.currentHp - actualDamage);
          this.battleState.battleLog.push(
            `${caster.name} uses ${move.name} on ${target.name} for ${actualDamage} damage!`
          );

          if (target.currentHp === 0) {
            this.battleState.battleLog.push(`${target.name} is defeated!`);
          }
        }
        break;

      case "healing":
        if (target && move.effects?.heal) {
          const healAmount = Math.floor(damageAmount * move.effects.heal);
          const actualHealing = Math.min(
            healAmount,
            target.stats.hp - target.currentHp
          );
          target.currentHp += actualHealing;
          this.battleState.battleLog.push(
            `${caster.name} uses ${move.name} on ${target.name} and heals ${actualHealing} HP!`
          );
        }
        break;

      case "buff":
      case "debuff":
        // Simple buff/debuff system - could be expanded
        this.battleState.battleLog.push(
          `${caster.name} uses ${move.name}! (Effect applied)`
        );
        break;
    }
  }

  private performAttack(
    attacker: BattleCharacter,
    target: BattleCharacter
  ): void {
    const baseDamage = attacker.stats.attack;
    const defense = target.stats.defense;

    // Calculate damage with some randomness
    const damage = Math.max(
      1,
      Math.floor((baseDamage - defense / 2) * (0.8 + Math.random() * 0.4))
    );

    target.currentHp = Math.max(0, target.currentHp - damage);

    const logMessage = `${attacker.name} attacks ${target.name} for ${damage} damage!`;
    this.battleState.battleLog.push(logMessage);

    if (target.currentHp === 0) {
      this.battleState.battleLog.push(`${target.name} is defeated!`);
    }
  }

  private performGuard(character: BattleCharacter): void {
    // Guarding reduces incoming damage for the next turn
    this.battleState.battleLog.push(
      `${character.name} takes a defensive stance!`
    );
  }

  private performItemUse(
    user: BattleCharacter,
    target: BattleCharacter | undefined,
    itemId: string
  ): void {
    // Simple item system
    switch (itemId) {
      case "healing_potion":
        if (target) {
          const healing = 50;
          const actualHealing = Math.min(
            healing,
            target.stats.hp - target.currentHp
          );
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
      (char) => char.isPlayerControlled && char.currentHp > 0
    );

    const aliveEnemyCharacters = this.battleState.characters.filter(
      (char) => !char.isPlayerControlled && char.currentHp > 0
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
      this.battleState.battleLog.push(
        "Victory! The enemies have been defeated!"
      );
    } else {
      this.battleState.battleLog.push(
        "Defeat! Your party has been defeated..."
      );
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
        (char) => !char.isPlayerControlled && char.currentHp > 0
      );
    } else {
      // Enemies can target players
      return this.battleState.characters.filter(
        (char) => char.isPlayerControlled && char.currentHp > 0
      );
    }
  }

  getAvailableAllies(isPlayerAction: boolean): BattleCharacter[] {
    if (isPlayerAction) {
      // Player can target allies
      return this.battleState.characters.filter(
        (char) => char.isPlayerControlled && char.currentHp > 0
      );
    } else {
      // Enemies can target other enemies
      return this.battleState.characters.filter(
        (char) => !char.isPlayerControlled && char.currentHp > 0
      );
    }
  }
}
