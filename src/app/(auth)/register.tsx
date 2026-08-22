import { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { Primary, Spacing } from '@/constants/theme';

const INDUSTRIES = [
  'IT', 'Manufacturing', 'Logistics', 'Marketing', 'Finance',
  'Legal', 'Agriculture', 'Design', 'Healthcare', 'Tourism', 'Other',
];

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const handleRegister = () => {
    if (!companyName.trim() || !email.trim() || !password) {
      Alert.alert('Missing fields', 'Please fill in company name, email and password.');
      return;
    }
    Alert.alert(
      'Account Created',
      'Your account is pending approval. You will be notified once approved.',
      [{ text: 'OK', onPress: () => router.back() }],
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={[styles.backText, { color: Primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Register your company</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <Text style={[styles.section, { color: Primary }]}>COMPANY INFORMATION</Text>

          <Text style={[styles.label, { color: theme.textSecondary }]}>COMPANY NAME</Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.background,
              color: theme.text,
              borderColor: theme.backgroundSelected,
            }]}
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="Your Company Ltd."
            placeholderTextColor={theme.textSecondary}
          />

          <Text style={[styles.label, { color: theme.textSecondary }]}>INDUSTRY</Text>
          <TouchableOpacity
            style={[styles.input, styles.picker, {
              backgroundColor: theme.background,
              borderColor: theme.backgroundSelected,
            }]}
            onPress={() => setShowPicker(!showPicker)}
          >
            <Text style={{ color: industry ? theme.text : theme.textSecondary, fontSize: 15 }}>
              {industry || 'Select industry'}
            </Text>
          </TouchableOpacity>
          {showPicker && (
            <View style={[styles.pickerList, {
              backgroundColor: theme.background,
              borderColor: theme.backgroundSelected,
            }]}>
              {INDUSTRIES.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.pickerItem, { borderBottomColor: theme.backgroundSelected }]}
                  onPress={() => { setIndustry(item); setShowPicker(false); }}
                >
                  <Text style={{ color: industry === item ? Primary : theme.text, fontSize: 15 }}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={[styles.label, { color: theme.textSecondary }]}>CITY, COUNTRY</Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.background,
              color: theme.text,
              borderColor: theme.backgroundSelected,
            }]}
            value={location}
            onChangeText={setLocation}
            placeholder="Milan, Italy"
            placeholderTextColor={theme.textSecondary}
          />

          <Text style={[styles.section, { color: Primary, marginTop: Spacing.two }]}>
            ACCOUNT DETAILS
          </Text>

          <Text style={[styles.label, { color: theme.textSecondary }]}>WORK EMAIL</Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.background,
              color: theme.text,
              borderColor: theme.backgroundSelected,
            }]}
            value={email}
            onChangeText={setEmail}
            placeholder="you@company.com"
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
          />

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: Primary }]}
            onPress={handleRegister}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.footerLink, { color: Primary }]}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, padding: Spacing.five, paddingTop: Spacing.six },
  header: { marginBottom: Spacing.four },
  back: { marginBottom: Spacing.three },
  backText: { fontSize: 15, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14 },
  card: { borderRadius: 16, padding: Spacing.five, marginBottom: Spacing.four },
  section: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: Spacing.three },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 },
  input: {
    borderRadius: 10, paddingHorizontal: Spacing.three, paddingVertical: 12,
    fontSize: 15, marginBottom: Spacing.three, borderWidth: 1,
  },
  picker: { justifyContent: 'center' },
  pickerList: {
    borderRadius: 10, borderWidth: 1,
    marginBottom: Spacing.three, marginTop: -Spacing.two, overflow: 'hidden',
  },
  pickerItem: { paddingVertical: 10, paddingHorizontal: Spacing.three, borderBottomWidth: 1 },
  btn: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: Spacing.two },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', paddingBottom: Spacing.six,
  },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: '600' },
});
