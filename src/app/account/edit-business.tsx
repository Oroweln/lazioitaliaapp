import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { ApiError, errorMessage } from '@/api/client';
import { Company } from '@/api/endpoints';
import type { Business, BusinessSize, BusinessUpdate } from '@/api/types';
import { FormScroll } from '@/components/form-scroll';
import { OptionPicker } from '@/components/option-picker';
import { GoldButton } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/card';
import { GoldText } from '@/components/ui/gold-text';
import { ScreenHeader } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { EmptyState, ErrorBanner, ErrorState, Loading } from '@/components/ui/states';
import { INDUSTRIES } from '@/constants/industries';
import { Type } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useAsync } from '@/hooks/use-async';
import { normalizeWebsite, SIZE_LABELS } from '@/utils/format';

const TEXT_FIELDS = ['name', 'description', 'looking_for', 'location', 'website'] as const;
type TextField = (typeof TEXT_FIELDS)[number];

const INDUSTRY_OPTIONS = INDUSTRIES.map((i) => ({ value: i, label: i }));
const SIZE_OPTIONS = (Object.keys(SIZE_LABELS) as BusinessSize[]).map((s) => ({ value: s, label: SIZE_LABELS[s] }));

export default function EditBusinessScreen() {
  const { data, error, loading, retry } = useAsync(() => Company.get());

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title="Edit company" back />
      {loading ? (
        <Loading />
      ) : error || !data ? (
        <ErrorState message={error ?? 'Company not found'} onRetry={retry} />
      ) : data.role === 'member' ? (
        <EmptyState icon="lock" title="Owners and admins only" message="Ask your company owner to update these details." />
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
      <GlassCard style={{ gap: 16 }}>
        <GoldText style={Type.eyebrow}>Identity</GoldText>
        <Input label="Company name" value={text.name} onChangeText={set('name')} error={fieldErrors.name} />
        <OptionPicker label="Industry" value={industry} options={INDUSTRY_OPTIONS} onChange={setIndustry} allowClear />
        <OptionPicker
          label="Company size"
          value={size}
          options={SIZE_OPTIONS}
          onChange={(v) => setSize(v as BusinessSize | null)}
          allowClear
        />
        <Input label="Location" value={text.location} onChangeText={set('location')} placeholder="Milan, Italy" error={fieldErrors.location} />
        <Input
          label="Website"
          value={text.website}
          onChangeText={set('website')}
          placeholder="https://yourcompany.com"
          autoCapitalize="none"
          keyboardType="url"
          error={fieldErrors.website}
        />
      </GlassCard>
      <GlassCard style={{ gap: 16 }}>
        <GoldText style={Type.eyebrow}>Presentation</GoldText>
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
      </GlassCard>
      <ErrorBanner message={error} />
      <GoldButton title="Save changes" onPress={save} loading={busy} />
    </FormScroll>
  );
}
