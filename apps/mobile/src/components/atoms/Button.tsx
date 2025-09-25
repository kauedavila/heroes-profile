import React from 'react';
import { Button as PaperButton, ButtonProps } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface CustomButtonProps extends Omit<ButtonProps, 'children'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
}

const Button: React.FC<CustomButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  style,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    switch (size) {
      case 'small':
        baseStyle.push(styles.small);
        break;
      case 'large':
        baseStyle.push(styles.large);
        break;
      default:
        baseStyle.push(styles.medium);
    }

    return baseStyle;
  };

  const getMode = (): 'contained' | 'outlined' | 'text' => {
    switch (variant) {
      case 'outline':
        return 'outlined';
      case 'text':
        return 'text';
      default:
        return 'contained';
    }
  };

  const getButtonColor = () => {
    switch (variant) {
      case 'secondary':
        return theme.colors.secondary;
      case 'outline':
        return undefined;
      case 'text':
        return undefined;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <PaperButton
      mode={getMode()}
      buttonColor={getButtonColor()}
      textColor={variant === 'outline' || variant === 'text' ? theme.colors.primary : theme.colors.onPrimary}
      style={[...getButtonStyle(), style]}
      labelStyle={styles.label}
      {...props}
    >
      {title}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.gameUI.buttonRadius,
    elevation: theme.gameUI.shadowElevation,
  },
  small: {
    minHeight: 32,
  },
  medium: {
    minHeight: 48,
  },
  large: {
    minHeight: 56,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default Button;