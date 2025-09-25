import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { RootStackParamList, LoginCredentials } from '../../types';
import { theme } from '../../theme';
import { useAuth } from '../../store/authStore';
import { apiService } from '../../services/apiService';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Card from '../../components/atoms/Card';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(data);
      
      await login(
        { accessToken: response.accessToken, refreshToken: response.refreshToken },
        response.user
      );
    } catch (error) {
      Alert.alert('Login Failed', apiService.handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text variant="headlineLarge" style={styles.title}>
            Heroes Profile
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Enter the world of adventure
          </Text>

          <Card variant="game" style={styles.formCard}>
            <Text variant="headlineSmall" style={styles.formTitle}>
              Sign In
            </Text>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                  left={<Text>📧</Text>}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  secureTextEntry
                  error={errors.password?.message}
                  left={<Text>🔒</Text>}
                />
              )}
            />

            <Button
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
            />

            <Button
              title="Forgot Password?"
              variant="text"
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotButton}
            />

            <Divider style={styles.divider} />

            <Button
              title="Create Account"
              variant="outline"
              onPress={() => navigation.navigate('Register')}
              style={styles.registerButton}
            />
          </Card>

          <Text variant="bodySmall" style={styles.footer}>
            Join the adventure and become a legendary hero!
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.onBackground,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    opacity: 0.8,
  },
  formCard: {
    width: '100%',
    maxWidth: 400,
  },
  formTitle: {
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  loginButton: {
    marginTop: theme.spacing.md,
  },
  forgotButton: {
    marginTop: theme.spacing.sm,
  },
  divider: {
    marginVertical: theme.spacing.lg,
  },
  registerButton: {
    marginBottom: theme.spacing.sm,
  },
  footer: {
    color: theme.colors.onBackground,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    opacity: 0.6,
  },
});

export default LoginScreen;