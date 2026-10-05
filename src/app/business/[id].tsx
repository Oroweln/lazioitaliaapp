import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError, errorMessage } from '@/api/client';
import { ConnectionsApi, Discover } from '@/api/endpoints';
import { PrimaryButton, SecondaryButton } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Divider, Card } from '@/components/ui/card';
import { ScreenHeader } from '@/components/ui/header';
import { Icon } from '@/components/ui/icon';
import { metal, MetalEdge } from '@/components/ui/metal';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ErrorBanner, ErrorState, Loading } from '@/components/ui/states';
import { Tag } from '@/components/ui/tag';
import { C, Font, MaxContentWidth, Radius, Type } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { invalidateConnections, useConnections } from '@/hooks/use-connections';
import { useOpenChat } from '@/hooks/use-open-chat';
import { relationTo } from '@/utils/connections';
import { displayWebsite, SIZE_LABELS } from '@/utils/format';
import { isWebUrl, openWebsite } from '@/utils/links';

export default function BusinessScreen() {
  const params = useLocalSearchParams<{ id: string; name?: string }>();
  const id = Number(params.id);

  const { data: business, error, loading, retry } = useAsync(
    () =>
      Discover.get(id).catch((e) => {
        // Discover only returns listed companies; a connection can outlive the listing.
        if (e instanceof ApiError && e.status === 404) {
          throw new ApiError(404, 'This company is no longer listed in the network.');
        }
        throw e;
      }),
    id,
  );
  const connections = useConnections(30_000);
  const [composerOpen, setComposerOpen] = useState(false);
  const { openChat, openingFor } = useOpenChat();

  const relation = business && connections.data ? relationTo(business, connections.data) : null;

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title={business?.name ?? params.name ?? 'Company'} back />
      {loading ? (
        <Loading />
      ) : error || !business ? (
        <ErrorState message={error ?? 'Company not found'} onRetry={retry} />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scroll}>
            {/* Teal company hero, like the website's company profile. */}
            <View style={[styles.hero, metal('hero')]}>
              <Avatar name={business.name} size={96} logoUrl={business.logo_url} />
              <Text style={styles.heroTitle}>{business.name}</Text>
              {business.location ? (
                <View style={styles.place}>
                  <Icon name="location_on" size={15} color={C.coral} />
                  <Text style={styles.placeText}>{business.location}</Text>
                </View>
              ) : null}
              {isWebUrl(business.website) ? (
                <Pressable
                  onPress={() => openWebsite(business.website)}
                  hitSlop={8}
                  accessibilityRole="link"
                  accessibilityLabel={`Open website ${displayWebsite(business.website)}`}>
                  <Text style={styles.website}>{displayWebsite(business.website)} ↗</Text>
                </Pressable>
              ) : null}
              <View style={styles.tags}>
                {business.industry && <Tag label={business.industry} />}
                {relation && (
                  <Tag
                    label={relation.status === 'approved' ? 'Connected' : relation.status === 'rejected' ? 'Declined' : 'Request pending'}
                    tone={relation.status === 'approved' ? 'success' : relation.status === 'rejected' ? 'muted' : 'warning'}
                  />
                )}
              </View>
            </View>
            <MetalEdge />

            <View style={styles.content}>
              {business.description ? (
                <Section title="About">
                  <Text style={styles.body}>{business.description}</Text>
                </Section>
              ) : null}

              {business.looking_for ? (
                // "We are looking for": deep-teal card with a red left edge, the statement in Tinos.
                <Card tone="ink" style={styles.lookingFor}>
                  <Text style={[Type.eyebrow, { color: C.coral }]}>Looking for</Text>
                  <Text style={styles.lookingForText}>{business.looking_for}</Text>
                </Card>
              ) : null}

              <Section title="Key facts" ink>
                <DetailRow icon="apartment" label="Industry" value={business.industry} />
                <DetailRow icon="location_on" label="Location" value={business.location} />
                <DetailRow icon="group" label="Company size" value={business.size ? SIZE_LABELS[business.size] : null} />
                <DetailRow
                  icon="language"
                  label="Website"
                  value={displayWebsite(business.website)}
                  onPress={isWebUrl(business.website) ? () => openWebsite(business.website) : undefined}
                />
              </Section>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {!connections.data ? (
              connections.error ? (
                <SecondaryButton title="Retry" icon="refresh" onPress={() => void connections.reload().catch(() => undefined)} />
              ) : (
                <SecondaryButton title="Checking connection…" disabled />
              )
            ) : relation?.status === 'approved' ? (
              relation.contactUserId != null ? (
                <PrimaryButton
                  title={`Message ${business.name}`}
                  icon="chat"
                  loading={openingFor === relation.contactUserId}
                  onPress={() => openChat(relation.contactUserId!, business.name)}
                />
              ) : (
                <SecondaryButton title="No contact available" disabled />
              )
            ) : relation?.status === 'pending_admin' ? (
              <SecondaryButton
                title={relation.direction === 'sent' ? 'Request sent' : 'Respond in Connections'}
                icon="hourglass_top"
                disabled
              />
            ) : relation?.status === 'rejected' ? (
              <SecondaryButton title="Request declined" disabled />
            ) : (
              <PrimaryButton title={`Connect with ${business.name}`} icon="handshake" onPress={() => setComposerOpen(true)} />
            )}
          </View>

          <ConnectComposer
            visible={composerOpen}
            businessId={business.id}
            businessName={business.name}
            onClose={() => setComposerOpen(false)}
            onSent={() => {
              setComposerOpen(false);
              invalidateConnections();
              void connections.reload().catch(() => undefined);
            }}
            onStale={() => {
              invalidateConnections();
              void connections.reload().catch(() => undefined);
            }}
          />
        </>
      )}
    </Screen>
  );
}

function Section({ title, children, ink }: { title: string; children: React.ReactNode; ink?: boolean }) {
  return (
    <Card style={{ gap: 12, paddingTop: ink ? 24 : 18 }} tone={ink ? 'ink' : 'light'} edge={ink}>
      <Text style={[Type.eyebrow, ink && { color: C.coral }]}>{title}</Text>
      {children}
    </Card>
  );
}

function DetailRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: 'apartment' | 'location_on' | 'group' | 'language';
  label: string;
  value: string | null | undefined;
  onPress?: () => void;
}) {
  if (!value) return null;
  const row = (
    <View style={styles.detailRow}>
      <Icon name={icon} size={18} color="#a3c8d3" />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, onPress && styles.detailLink]} numberOfLines={2}>
        {value}
        {onPress ? ' ↗' : ''}
      </Text>
    </View>
  );
  return (
    <>
      <Divider style={{ backgroundColor: C.lineOnInk }} />
      {onPress ? (
        <Pressable onPress={onPress} accessibilityRole="link" accessibilityLabel={`Open ${label} ${value}`}>
          {row}
        </Pressable>
      ) : (
        row
      )}
    </>
  );
}

function ConnectComposer({
  visible,
  businessId,
  businessName,
  onClose,
  onSent,
  onStale,
}: {
  visible: boolean;
  businessId: number;
  businessName: string;
  onClose: () => void;
  onSent: () => void;
  onStale: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      await ConnectionsApi.send(businessId, message.trim());
      setMessage('');
      onSent();
    } catch (e) {
      // 409 explains why (already sent, already connected, or they already asked you); the
      // cached relation is stale either way, so refresh it behind the message.
      if (e instanceof ApiError && e.status === 409) onStale();
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      {/* The sheet pads for the bottom inset itself; let the keyboard cover that padding. */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={-insets.bottom}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <SafeAreaView edges={['bottom']} style={styles.sheetWrap}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <MetalEdge style={styles.sheetEdge} />
            <Text style={Type.eyebrow}>Connection request</Text>
            <Text style={Type.heading}>Introduce yourself to {businessName}</Text>
            <Input
              value={message}
              onChangeText={(t) => setMessage(t.slice(0, 500))}
              placeholder="A short note about why you'd like to connect (optional)"
              multiline
            />
            <Text style={styles.counter}>{message.length}/500</Text>
            <ErrorBanner message={error} />
            <PrimaryButton title="Send request" onPress={send} loading={busy} icon="send" />
            <SecondaryButton title="Cancel" onPress={onClose} />
          </Pressable>
        </SafeAreaView>
      </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 32 },
  content: { padding: 20, gap: 16, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  hero: { alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 26, paddingBottom: 24 },
  heroTitle: { ...Type.display, color: C.onInk, textAlign: 'center' },
  place: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  placeText: { fontFamily: Font.semibold, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: C.onInkMuted },
  website: { color: C.coral, fontFamily: Font.semibold, fontSize: 14, textDecorationLine: 'underline' },
  tags: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 },
  body: { color: C.textDim, fontFamily: Font.regular, fontSize: 15, lineHeight: 24 },
  lookingFor: { gap: 10, borderLeftWidth: 4, borderLeftColor: C.accent },
  lookingForText: { fontFamily: Font.serif, fontSize: 21, lineHeight: 27, color: C.onInk },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailLabel: { color: C.onInkMuted, fontFamily: Font.medium, fontSize: 13, width: 104 },
  detailValue: { flex: 1, color: C.onInk, fontFamily: Font.semibold, fontSize: 14, textAlign: 'right' },
  detailLink: { color: C.coral, textDecorationLine: 'underline' },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.border,
    backgroundColor: C.surface,
  },
  backdrop: { flex: 1, backgroundColor: C.scrim, justifyContent: 'flex-end' },
  sheetWrap: { backgroundColor: C.surface, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg, overflow: 'hidden' },
  sheet: {
    padding: 22,
    paddingTop: 26,
    gap: 14,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: C.border,
  },
  sheetEdge: { position: 'absolute', top: 0, left: 0, right: 0 },
  counter: { alignSelf: 'flex-end', fontFamily: Font.medium, fontSize: 11, color: C.textMuted, marginTop: -8 },
});
