import { useState } from 'react';
import {
  Alert, Image, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { Primary, Spacing } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    login();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoSection}>
          <View style={[styles.logoMark, { borderColor: Primary }]}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>APP NAME</Text>{/* TODO */}
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>Tagline</Text>{/* TODO */}
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Welcome back</Text>
          <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
            Sign in to your company account
          </Text>

          <Text style={[styles.label, { color: theme.textSecondary }]}>EMAIL</Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.background,
              color: theme.text,
              borderColor: theme.backgroundSelected,
            }]}
            value={email}
            onChangeText={setEmail}
            placeholder="company@example.com"
            placeholderTextColor={theme.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { color: theme.textSecondary }]}>PASSWORD</Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.background,
              color: theme.text,
              borderColor: theme.backgroundSelected,
            }]}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            onSubmitEditing={handleLogin}
            returnKeyType="go"
          />

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: Primary }]}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={[styles.footerLink, { color: Primary }]}>Create one</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.five },
  logoSection: { alignItems: 'center', marginBottom: Spacing.five },
  logoMark: {
    width: 80, height: 80, borderRadius: 20, borderWidth: 2,
    marginBottom: Spacing.three, overflow: 'hidden',
  },
  logoImage: { width: '100%', height: '100%' },
  appName: { fontSize: 20, fontWeight: '800', letterSpacing: 2 },
  tagline: { fontSize: 12, fontWeight: '500', letterSpacing: 1, marginTop: 4 },
  card: { borderRadius: 16, padding: Spacing.five, marginBottom: Spacing.four },
  cardTitle: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  cardSub: { fontSize: 14, marginBottom: Spacing.four },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 },
  input: {
    borderRadius: 10, paddingHorizontal: Spacing.three, paddingVertical: 12,
    fontSize: 15, marginBottom: Spacing.three, borderWidth: 1,
  },
  btn: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: Spacing.two },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: '600' },
});
