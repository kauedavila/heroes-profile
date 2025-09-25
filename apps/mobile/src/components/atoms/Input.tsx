import React from 'react';
import { TextInput, TextInputProps, HelperText } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { theme } from '../../theme';

interface InputProps extends Omit<TextInputProps, 'theme'> {
  error?: string;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({
  error,
  helperText,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        error={!!error}
        style={[styles.input, style]}
        outlineStyle={styles.outline}
        contentStyle={styles.content}
        {...props}
      />
      {(error || helperText) && (
        <HelperText type={error ? 'error' : 'info'} visible={!!(error || helperText)}>
          {error || helperText}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.surface,
  },
  outline: {
    borderRadius: theme.gameUI.buttonRadius,
    borderWidth: 2,
  },
  content: {
    color: theme.colors.onSurface,
  },
});

export default Input;