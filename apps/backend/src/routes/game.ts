import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, requireVip, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Game constants
const STAGE_REWARDS = {
  1: { gold: 10, experience: 25 },
  2: { gold: 15, experience: 35 },
  3: { gold: 20, experience: 50 },
  4: { gold: 30, experience: 70 },
  5: { gold: 40, experience: 100 },
};

const VIP_MULTIPLIERS = {
  0: 1,
  1: 1.2,
  2: 1.4,
  3: 1.6,
  4: 1.8,
  5: 2.0,
};

// Get game state
router.get('/state', authenticate, (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not found' });
  }

  res.json({
    gameData: req.user.gameData,
    isVip: req.user.isVip(),
    vipLevel: req.user.vipLevel,
    vipMultiplier: VIP_MULTIPLIERS[req.user.vipLevel as keyof typeof VIP_MULTIPLIERS] || 1,
  });
});

// Create character
router.post('/character', [
  authenticate,
  body('name').trim().isLength({ min: 2, max: 20 }),
  body('class').isIn(['warrior', 'mage', 'archer', 'rogue']),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const { name, class: characterClass } = req.body;

    // Check character limit (VIP can have more characters)
    const maxCharacters = req.user.isVip() ? 5 : 3;
    if (req.user.gameData.characters.length >= maxCharacters) {
      return res.status(400).json({ 
        message: `Maximum ${maxCharacters} characters allowed`,
        upgradeMessage: !req.user.isVip() ? 'Upgrade to VIP for more character slots!' : undefined
      });
    }

    // Base stats by class
    const baseStats = {
      warrior: { health: 120, attack: 15, defense: 12, speed: 8 },
      mage: { health: 80, attack: 20, defense: 6, speed: 12 },
      archer: { health: 100, attack: 18, defense: 8, speed: 15 },
      rogue: { health: 90, attack: 16, defense: 7, speed: 18 },
    };

    const newCharacter = {
      id: new Date().getTime().toString(),
      name,
      class: characterClass,
      level: 1,
      stats: baseStats[characterClass as keyof typeof baseStats],
      equipment: {
        weapon: null,
        armor: null,
        accessory: null,
      },
    };

    req.user.gameData.characters.push(newCharacter);
    await req.user.save();

    res.status(201).json({
      message: 'Character created successfully',
      character: newCharacter,
    });
  } catch (error) {
    console.error('Create character error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Battle stage
router.post('/battle', [
  authenticate,
  body('characterId').isString(),
  body('stageId').isInt({ min: 1 }),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const { characterId, stageId } = req.body;

    // Find character
    const character = req.user.gameData.characters.find(c => c.id === characterId);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Check if stage is available
    if (stageId > req.user.gameData.currentStage) {
      return res.status(400).json({ message: 'Stage not unlocked' });
    }

    // Simulate battle (simplified)
    const victory = Math.random() > 0.3; // 70% win rate
    
    if (victory) {
      const baseReward = STAGE_REWARDS[stageId as keyof typeof STAGE_REWARDS] || { gold: 50, experience: 100 };
      const vipMultiplier = VIP_MULTIPLIERS[req.user.vipLevel as keyof typeof VIP_MULTIPLIERS] || 1;
      
      const goldReward = Math.floor(baseReward.gold * vipMultiplier);
      const expReward = Math.floor(baseReward.experience * vipMultiplier);

      // Update user game data
      req.user.gameData.gold += goldReward;
      req.user.gameData.experience += expReward;

      // Check for level up
      const experienceForNextLevel = req.user.gameData.level * 100;
      if (req.user.gameData.experience >= experienceForNextLevel) {
        req.user.gameData.level += 1;
        req.user.gameData.experience -= experienceForNextLevel;
      }

      // Unlock next stage
      if (stageId === req.user.gameData.currentStage && stageId < 100) {
        req.user.gameData.currentStage += 1;
      }

      await req.user.save();

      res.json({
        victory: true,
        rewards: {
          gold: goldReward,
          experience: expReward,
          vipBonus: vipMultiplier > 1,
        },
        playerState: {
          level: req.user.gameData.level,
          experience: req.user.gameData.experience,
          gold: req.user.gameData.gold,
          currentStage: req.user.gameData.currentStage,
        },
      });
    } else {
      res.json({
        victory: false,
        message: 'Defeat! Try again or upgrade your character.',
      });
    }
  } catch (error) {
    console.error('Battle error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Shop (VIP exclusive items)
router.get('/shop', authenticate, (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not found' });
  }

  const basicItems = [
    { id: 'health_potion', name: 'Health Potion', price: 50, type: 'consumable' },
    { id: 'iron_sword', name: 'Iron Sword', price: 200, type: 'weapon' },
    { id: 'leather_armor', name: 'Leather Armor', price: 150, type: 'armor' },
  ];

  const vipItems = [
    { id: 'legendary_sword', name: 'Legendary Sword', price: 1000, type: 'weapon', vipRequired: 2 },
    { id: 'dragon_armor', name: 'Dragon Armor', price: 1500, type: 'armor', vipRequired: 3 },
    { id: 'phoenix_ring', name: 'Phoenix Ring', price: 2000, type: 'accessory', vipRequired: 4 },
  ];

  const availableItems = [...basicItems];
  
  if (req.user.isVip()) {
    availableItems.push(...vipItems.filter(item => req.user!.vipLevel >= item.vipRequired));
  }

  res.json({
    items: availableItems,
    playerGold: req.user.gameData.gold,
    isVip: req.user.isVip(),
    vipLevel: req.user.vipLevel,
  });
});

// Purchase item
router.post('/shop/purchase', [
  authenticate,
  body('itemId').isString(),
  body('quantity').optional().isInt({ min: 1, max: 10 }),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const { itemId, quantity = 1 } = req.body;

    // Mock item data (in a real app, this would come from a database)
    const items: Record<string, any> = {
      health_potion: { name: 'Health Potion', price: 50, type: 'consumable' },
      iron_sword: { name: 'Iron Sword', price: 200, type: 'weapon' },
      leather_armor: { name: 'Leather Armor', price: 150, type: 'armor' },
      legendary_sword: { name: 'Legendary Sword', price: 1000, type: 'weapon', vipRequired: 2 },
      dragon_armor: { name: 'Dragon Armor', price: 1500, type: 'armor', vipRequired: 3 },
      phoenix_ring: { name: 'Phoenix Ring', price: 2000, type: 'accessory', vipRequired: 4 },
    };

    const item = items[itemId];
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check VIP requirement
    if (item.vipRequired && (!req.user.isVip() || req.user.vipLevel < item.vipRequired)) {
      return res.status(403).json({ 
        message: 'VIP access required',
        requiredVipLevel: item.vipRequired 
      });
    }

    const totalCost = item.price * quantity;

    // Check if user has enough gold
    if (req.user.gameData.gold < totalCost) {
      return res.status(400).json({ message: 'Insufficient gold' });
    }

    // Process purchase
    req.user.gameData.gold -= totalCost;

    // Add to inventory
    const existingItem = req.user.gameData.inventory.find(i => i.id === itemId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      req.user.gameData.inventory.push({
        id: itemId,
        name: item.name,
        type: item.type,
        rarity: item.rarity || 'common',
        quantity,
      });
    }

    await req.user.save();

    res.json({
      message: 'Purchase successful',
      item: {
        id: itemId,
        name: item.name,
        quantity,
        totalCost,
      },
      remainingGold: req.user.gameData.gold,
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Auto-battle (VIP feature)
router.post('/auto-battle', [
  authenticate,
  requireVip(1),
  body('characterId').isString(),
  body('duration').isInt({ min: 1, max: 8 }), // hours
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const { characterId, duration } = req.body;

    // Find character
    const character = req.user.gameData.characters.find(c => c.id === characterId);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Calculate rewards based on duration and VIP level
    const baseRewardsPerHour = { gold: 20, experience: 50 };
    const vipMultiplier = VIP_MULTIPLIERS[req.user.vipLevel as keyof typeof VIP_MULTIPLIERS] || 1;
    
    const totalGold = Math.floor(baseRewardsPerHour.gold * duration * vipMultiplier);
    const totalExp = Math.floor(baseRewardsPerHour.experience * duration * vipMultiplier);

    req.user.gameData.gold += totalGold;
    req.user.gameData.experience += totalExp;

    await req.user.save();

    res.json({
      message: 'Auto-battle completed',
      duration,
      rewards: {
        gold: totalGold,
        experience: totalExp,
        vipMultiplier,
      },
      playerState: {
        level: req.user.gameData.level,
        experience: req.user.gameData.experience,
        gold: req.user.gameData.gold,
      },
    });
  } catch (error) {
    console.error('Auto-battle error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;