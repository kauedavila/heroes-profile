import React from 'react';
import { Card as PaperCard, CardProps } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface CustomCardProps extends CardProps {
  variant?: 'default' | 'game' | 'character' | 'vip';
}

const Card: React.FC<CustomCardProps> = ({
  variant = 'default',
  style,
  children,
  ...props
}) => {
  const getCardStyle = () => {
    const baseStyle = [styles.card];
    
    switch (variant) {
      case 'game':
        baseStyle.push(styles.gameCard);
        break;
      case 'character':
        baseStyle.push(styles.characterCard);
        break;
      case 'vip':
        baseStyle.push(styles.vipCard);
        break;
    }

    return baseStyle;
  };

  return (
    <PaperCard
      style={[...getCardStyle(), style]}
      contentStyle={styles.content}
      {...props}
    >
      {children}
    </PaperCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.gameUI.cardRadius,
    elevation: theme.gameUI.shadowElevation,
    marginVertical: theme.spacing.xs,
  },
  gameCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: theme.gameUI.borderWidth,
    borderColor: theme.colors.primary,
  },
  characterCard: {
    backgroundColor: theme.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  vipCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: theme.gameUI.borderWidth,
    borderColor: theme.colors.vip,
  },
  content: {
    padding: theme.spacing.md,
  },
});

export default Card;