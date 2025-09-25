import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text } from 'react-native-paper';

import { ShopItem } from '../../types';
import { theme } from '../../theme';
import { useAuth } from '../../store/authStore';
import { apiService } from '../../services/apiService';
import Card from '../../components/atoms/Card';
import Button from '../../components/atoms/Button';

const ShopScreen: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [shopData, setShopData] = useState<{
    items: ShopItem[];
    playerGold: number;
    isVip: boolean;
    vipLevel: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingItem, setPurchasingItem] = useState<string | null>(null);

  useEffect(() => {
    loadShop();
  }, []);

  const loadShop = async () => {
    try {
      const data = await apiService.getShop();
      setShopData(data);
    } catch (error) {
      console.error('Failed to load shop:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (item: ShopItem) => {
    if (!shopData) return;

    if (shopData.playerGold < item.price) {
      Alert.alert('Insufficient Gold', 'You need more gold to purchase this item.');
      return;
    }

    try {
      setPurchasingItem(item.id);
      const result = await apiService.purchaseItem({ itemId: item.id });
      
      // Update local state
      setShopData(prev => prev ? { ...prev, playerGold: result.remainingGold } : null);
      
      // Update user data
      if (user) {
        updateUser({
          gameData: {
            ...user.gameData,
            gold: result.remainingGold,
          },
        });
      }

      Alert.alert('Purchase Successful', `You bought ${result.item.name}!`);
    } catch (error) {
      Alert.alert('Purchase Failed', apiService.handleApiError(error));
    } finally {
      setPurchasingItem(null);
    }
  };

  const renderShopItem = (item: ShopItem) => (
    <Card key={item.id} variant="default" style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text variant="titleMedium" style={styles.itemName}>
          {item.name}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{item.price.toLocaleString()}</Text>
          <Text style={styles.goldIcon}>🪙</Text>
        </View>
      </View>
      
      <Text variant="bodySmall" style={styles.itemType}>
        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        {item.vipRequired && ` • VIP ${item.vipRequired} Required`}
      </Text>

      <Button
        title="Purchase"
        size="small"
        onPress={() => handlePurchase(item)}
        loading={purchasingItem === item.id}
        disabled={
          purchasingItem !== null ||
          (shopData && shopData.playerGold < item.price) ||
          (item.vipRequired && (!shopData?.isVip || shopData.vipLevel < item.vipRequired))
        }
        style={styles.purchaseButton}
      />
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text variant="headlineMedium">Loading Shop...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        Item Shop
      </Text>

      <Card variant="character" style={styles.goldCard}>
        <View style={styles.goldContainer}>
          <Text variant="titleMedium" style={styles.goldLabel}>Your Gold:</Text>
          <Text variant="titleLarge" style={[styles.goldAmount, { color: theme.colors.gold }]}>
            {shopData?.playerGold.toLocaleString() || '0'} 🪙
          </Text>
        </View>
      </Card>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {shopData?.items.map(renderShopItem)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  title: {
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    fontWeight: 'bold',
  },
  goldCard: {
    marginBottom: theme.spacing.md,
  },
  goldContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goldLabel: {
    color: theme.colors.onSurface,
  },
  goldAmount: {
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  itemCard: {
    marginBottom: theme.spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  itemName: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    color: theme.colors.gold,
    fontSize: 16,
    fontWeight: 'bold',
  },
  goldIcon: {
    marginLeft: theme.spacing.xs,
  },
  itemType: {
    color: theme.colors.onSurface,
    opacity: 0.7,
    marginBottom: theme.spacing.md,
    textTransform: 'capitalize',
  },
  purchaseButton: {
    alignSelf: 'flex-start',
  },
});

export default ShopScreen;