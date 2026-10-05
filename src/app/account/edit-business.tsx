import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { ApiError, errorMessage } from '@/api/client';
import { Company } from '@/api/endpoints';
import type { Business, BusinessSize, BusinessUpdate } from '@/api/types';
import { FormScroll } from '@/components/form-scroll';
import { OptionPicker } from '@/components/option-picker';
import { Avatar } from '@/components/ui/avatar';
import { PrimaryButton, SecondaryButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScreenHeader } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { EmptyState, ErrorBanner, ErrorState, Loading } from '@/components/ui/states';
import { INDUSTRIES } from '@/constants/industries';
import { Type } from '@/constants/theme';
import { useAuth, useMe } from '@/context/auth-context';
import { useAsync } from '@/hooks/use-async';
import { normalizeWebsite, SIZE_LABELS } from '@/utils/format';

const TEXT_FIELDS = ['name', 'description', 'looking_for', 'location', 'website'] as const;
type TextField = (typeof TEXT_FIELDS)[number];

const styles = StyleSheet.create({
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  logoActions: { flex: 1, gap: 6 },
  logoButtons: { flexDirection: 'row', gap: 10, marginTop: 4, flexWrap: 'wrap' },
});

const INDUSTRY_OPTIONS = INDUSTRIES.map((i) => ({ value: i, label: i }));
// Mirrors the server's own limits (routes/business.rs), so the usual mistakes are
// caught before a multi-megabyte upload.
const LOGO_MAX_BYTES = 5 * 1024 * 1024;
const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const SIZE_OPTIONS = (Object.keys(SIZE_LABELS) as BusinessSize[]).map((s) => ({ value: s, label: SIZE_LABELS[s] }));

export default function EditBusinessScreen() {
  const me = useMe();
  const { data, error, loading, retry } = useAsync(() => Company.get());
  // Mirrors `can_write_business` on the server: the owner may finish the company while their
  // account is still pending, an admin may not until their own membership is approved.
  const locked = data && data.role !== 'owner' && !(data.role === 'admin' && me.status === 'approved');

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title="Edit company" back />
      {loading ? (
        <Loading />
      ) : error || !data ? (
        <ErrorState message={error ?? 'Company not found'} onRetry={retry} />
      ) : locked ? (
        <EmptyState
          icon="lock"
          title={data.role === 'member' ? 'Owners and admins only' : 'Awaiting approval'}
          message={
            data.role === 'member'
              ? 'Ask your company owner to update these details.'
              : 'Your account is still under review. The company owner can update these details in the meantime.'
          }
        />
      ) : (
        <BusinessForm business={data.business} />
      )}
    </Screen>
  );
}

function BusinessForm({ business }: { business: Business }) {
  const { refreshMe } = useAuth();
  const [text, setText] = useState<Record<TextField, string>>({
    name: business.name,
    description: business.description ?? '',
    looking_for: business.looking_for ?? '',
    location: business.location ?? '',
    website: business.website ?? '',
  });
  const [industry, setIndustry] = useState<string | null>(business.industry);
  const [size, setSize] = useState<BusinessSize | null>(business.size);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [logoUrl, setLogoUrl] = useState(business.logo_url);
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  // Everything is inside the try: the permission request and the picker itself can throw
  // (a missing native module, a cancelled system dialog), and those used to disappear
  // silently because only the upload was guarded.
  const pickLogo = async () => {
    if (logoBusy) return;
    setLogoError(null);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setLogoError('Allow photo access to choose a logo.');
        return;
      }
      // allowsEditing + a square aspect gives the crop step, so logos aren't squashed
      // into the round avatars they appear in.
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (picked.canceled) return;

      const asset = picked.assets[0];
      const type = asset.mimeType ?? 'image/jpeg';
      if (!LOGO_TYPES.includes(type)) {
        setLogoError('Choose a PNG, JPEG or WEBP image.');
        return;
      }
      if (asset.fileSize && asset.fileSize > LOGO_MAX_BYTES) {
        setLogoError('That image is larger than 5 MB.');
        return;
      }

      setLogoBusy(true);
      const updated = await Company.uploadLogo({
        uri: asset.uri,
        name: asset.fileName ?? `logo.${type.split('/')[1]}`,
        type,
      });
      setLogoUrl(updated.logo_url);
      await refreshMe();
    } catch (e) {
      console.warn('logo upload failed', e);
      // A missing native module can't be fixed by reloading, so say so rather than
      // showing a generic failure.
      const message = e instanceof Error ? e.message : String(e);
      setLogoError(
        /native module|doesn't exist|not available/i.test(message)
          ? 'Image picking needs a rebuild of the app (npx expo run:android).'
          : errorMessage(e),
      );
    } finally {
      setLogoBusy(false);
    }
  };

  const removeLogo = () =>
    Alert.alert('Remove logo', 'Your company will show its initials instead.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setLogoBusy(true);
          setLogoError(null);
          try {
            const updated = await Company.deleteLogo();
            setLogoUrl(updated.logo_url);
            await refreshMe();
          } catch (e) {
            console.warn('logo removal failed', e);
            setLogoError(errorMessage(e));
          } finally {
            setLogoBusy(false);
          }
        },
      },
    ]);

  const set = (field: TextField) => (v: string) => setText((t) => ({ ...t, [field]: v }));

  // Only changed fields are sent: the server treats an omitted field as "keep" and null as "clear".
  const buildUpdate = (): BusinessUpdate => {
    const update: BusinessUpdate = {};
    for (const field of TEXT_FIELDS) {
      let value: string | null = text[field].trim() || null;
      if (field === 'website' && value) value = normalizeWebsite(value);
      if (value !== (business[field] ?? null)) update[field] = value;
    }
    if (industry !== business.industry) update.industry = industry;
    if (size !== business.size) update.size = size;
    return update;
  };

  const save = async () => {
    if (!text.name.trim()) {
      setFieldErrors({ name: 'Company name is required' });
      return;
    }
    const update = buildUpdate();
    if (Object.keys(update).length === 0) {
      router.back();
      return;
    }
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      await Company.update(update);
      await refreshMe();
      router.back();
    } catch (e) {
      if (e instanceof ApiError && e.fields) setFieldErrors(e.fields);
      setError(errorMessage(e));
      setBusy(false);
    }
  };

  return (
    <FormScroll>
      <Card style={{ gap: 16 }}>
        <Text style={Type.eyebrow}>Identity</Text>
        <View style={styles.logoRow}>
          <Avatar name={text.name || business.name} size={72} logoUrl={logoUrl} />
          <View style={styles.logoActions}>
            <Text style={Type.label}>Company logo</Text>
            <Text style={Type.small}>PNG, JPEG or WEBP, up to 5 MB. Shown as a circle.</Text>
            <View style={styles.logoButtons}>
              <SecondaryButton
                title={logoUrl ? 'Change' : 'Add logo'}
                icon="image"
                compact
                loading={logoBusy}
                onPress={pickLogo}
              />
              {logoUrl ? (
                <SecondaryButton title="Remove" tone="danger" compact disabled={logoBusy} onPress={removeLogo} />
              ) : null}
            </View>
          </View>
        </View>
        <ErrorBanner message={logoError} />
        <Input label="Company name" value={text.name} onChangeText={set('name')} error={fieldErrors.name} />
        <OptionPicker label="Industry" value={industry} options={INDUSTRY_OPTIONS} onChange={setIndustry} allowClear />
        <OptionPicker
          label="Company size"
          value={size}
          options={SIZE_OPTIONS}
          onChange={(v) => setSize(v as BusinessSize | null)}
          allowClear
        />
        <Input label="Location" value={text.location} onChangeText={set('location')} placeholder="Roma, Lazio" error={fieldErrors.location} />
        <Input
          label="Website"
          value={text.website}
          onChangeText={set('website')}
          placeholder="https://yourcompany.com"
          autoCapitalize="none"
          keyboardType="url"
          error={fieldErrors.website}
        />
      </Card>
      <Card style={{ gap: 16 }}>
        <Text style={Type.eyebrow}>Presentation</Text>
        <Input
          label="About"
          value={text.description}
          onChangeText={(v) => set('description')(v.slice(0, 2000))}
          placeholder="What your company does, core services, markets"
          multiline
          error={fieldErrors.description}
        />
        <Input
          label="Looking for"
          value={text.looking_for}
          onChangeText={(v) => set('looking_for')(v.slice(0, 2000))}
          placeholder="The partners or collaborations you are seeking"
          multiline
          error={fieldErrors.looking_for}
        />
        <Text style={Type.small}>These details appear on your company page in Discover.</Text>
      </Card>
      <ErrorBanner message={error} />
      <PrimaryButton title="Save changes" onPress={save} loading={busy} />
    </FormScroll>
  );
}
