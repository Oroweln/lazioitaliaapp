import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, SectionList, StyleSheet, Text, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { ConnectionsApi } from '@/api/endpoints';
import type { ConnectionStatus, ReceivedConnection, SentConnection } from '@/api/types';
import { GoldButton, OutlineButton } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { GlassCard } from '@/components/ui/card';
import { ScreenHeader } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { Segmented } from '@/components/ui/segmented';
import { EmptyState, ErrorState, GoldRefreshControl, Loading } from '@/components/ui/states';
import { Tag, type TagTone } from '@/components/ui/tag';
import { C, MaxContentWidth, Type } from '@/constants/theme';
import { useMe } from '@/context/auth-context';
import { invalidateConnections, loadConnections, useConnections } from '@/hooks/use-connections';
import { useOpenChat } from '@/hooks/use-open-chat';
import { useRefetchOnFocus } from '@/hooks/use-refetch-on-focus';
import { STATUS_LABEL } from '@/utils/connections';
import { relativeTime } from '@/utils/format';

type Tab = 'pending' | 'connected';

const TONE: Record<ConnectionStatus, TagTone> = { pending_admin: 'warning', approved: 'success', rejected: 'muted' };

type Row = {
  key: string;
  name: string;
  subtitle: string;
  message: string | null;
  status: ConnectionStatus;
  createdAt: string;
  direction: 'sent' | 'received';
  businessId: number;
  contactUserId: number | null;
  requestId: number;
};

type Section = { title: string | null; data: Row[] };

function fromSent(s: SentConnection): Row {
  return {
    key: `s${s.id}`,
    name: s.business_name,
    subtitle: [s.business_industry, s.business_location].filter(Boolean).join('  ·  '),
    message: s.message,
    status: s.status,
    createdAt: s.created_at,
    direction: 'sent',
    businessId: s.business_id,
    contactUserId: s.business_owner_id,
    requestId: s.id,
  };
}

function fromReceived(r: ReceivedConnection): Row {
  return {
    key: `r${r.id}`,
    name: r.requester_name ?? 'Former member',
    subtitle: [r.requester_industry, r.requester_location].filter(Boolean).join('  ·  '),
    message: r.message,
    status: r.status,
    createdAt: r.created_at,
    direction: 'received',
    businessId: r.requester_business_id,
    contactUserId: r.requester_id,
    requestId: r.id,
  };
}

const byNewest = (a: Row, b: Row) => Date.parse(b.createdAt) - Date.parse(a.createdAt);

export default function ConnectionsScreen() {
  const me = useMe();
  const canRespond = me.business_role === 'owner' || me.business_role === 'admin';
  const [tab, setTab] = useState<Tab>('pending');
  const [responding, setResponding] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { openChat, openingFor } = useOpenChat();

  const { data, error, reload } = useConnections(0);
  useRefetchOnFocus(() => void loadConnections(10_000).catch(() => undefined));

  const refresh = async () => {
    setRefreshing(true);
    await reload().catch(() => undefined);
    setRefreshing(false);
  };

  const respond = async (row: Row, status: 'approved' | 'rejected') => {
    setResponding(row.requestId);
    try {
      await ConnectionsApi.respond(row.requestId, status);
      invalidateConnections();
      await reload().catch(() => undefined);
      if (status === 'approved') setTab('connected');
    } catch (e) {
      Alert.alert('Unable to update request', errorMessage(e));
    } finally {
      setResponding(null);
    }
  };

  const confirmDecline = (row: Row) =>
    Alert.alert('Decline request', `Decline the connection request from ${row.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Decline', style: 'destructive', onPress: () => void respond(row, 'rejected') },
    ]);

  const received = (data?.received ?? []).map(fromReceived);
  const sent = (data?.sent ?? []).map(fromSent);
  const incoming = received.filter((r) => r.status === 'pending_admin').sort(byNewest);
  const outgoing = sent.filter((s) => s.status !== 'approved').sort(byNewest);
  const declinedByUs = received.filter((r) => r.status === 'rejected').sort(byNewest);
  const connected = [...sent, ...received].filter((r) => r.status === 'approved').sort(byNewest);

  const sections: Section[] =
    tab === 'pending'
      ? [
          { title: 'Received', data: incoming },
          { title: 'Sent', data: outgoing },
          { title: 'Declined by you', data: declinedByUs },
        ].filter((s) => s.data.length > 0)
      : connected.length > 0
        ? [{ title: null, data: connected }]
        : [];

  const renderRow = ({ item: row }: { item: Row }) => (
    <GlassCard
      radius={20}
      style={styles.card}
      onPress={() => router.push({ pathname: '/business/[id]', params: { id: row.businessId, name: row.name } })}>
      <View style={styles.cardTop}>
        <Avatar name={row.name} size={46} />
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={styles.name} numberOfLines={1}>
            {row.name}
          </Text>
          {row.subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {row.subtitle}
            </Text>
          ) : null}
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <Tag label={STATUS_LABEL[row.status]} tone={TONE[row.status]} />
          <Text style={styles.time}>{relativeTime(row.createdAt)}</Text>
        </View>
      </View>
      {row.message ? <Text style={styles.message}>“{row.message}”</Text> : null}

      {tab === 'pending' &&
        row.direction === 'received' &&
        row.status === 'pending_admin' &&
        (canRespond ? (
          <View style={styles.actions}>
            <OutlineButton
              title="Decline"
              compact
              style={{ flex: 1 }}
              disabled={responding === row.requestId}
              onPress={() => confirmDecline(row)}
            />
            <GoldButton
              title="Accept"
              compact
              icon="check"
              style={{ flex: 1 }}
              loading={responding === row.requestId}
              onPress={() => respond(row, 'approved')}
            />
          </View>
        ) : (
          <Text style={styles.hint}>Your company owner or admin can accept this request.</Text>
        ))}

      {tab === 'connected' && (
        <OutlineButton
          title="Message"
          icon="chat"
          compact
          disabled={row.contactUserId == null}
          loading={row.contactUserId != null && openingFor === row.contactUserId}
          onPress={() => row.contactUserId != null && openChat(row.contactUserId, row.name)}
        />
      )}
    </GlassCard>
  );

  return (
    <Screen>
      <ScreenHeader eyebrow="Your network" title="Connections" />
      <View style={styles.segment}>
        <Segmented<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'pending', label: `Pending${incoming.length ? ` · ${incoming.length}` : ''}` },
            { value: 'connected', label: `Connected${connected.length ? ` · ${connected.length}` : ''}` },
          ]}
        />
      </View>
      {!data && !error ? (
        <Loading />
      ) : !data ? (
        <ErrorState message={error!} onRetry={refresh} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(row) => row.key}
          renderItem={renderRow}
          renderSectionHeader={({ section }) =>
            section.title ? <Text style={[Type.eyebrow, styles.section]}>{section.title}</Text> : null
          }
          stickySectionHeadersEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={styles.list}
          refreshControl={<GoldRefreshControl refreshing={refreshing} onRefresh={refresh} />}
          ListEmptyComponent={
            tab === 'pending' ? (
              <EmptyState
                icon="handshake"
                title="No pending requests"
                message="Find companies in Discover and send a connection request."
              />
            ) : (
              <EmptyState
                icon="forum"
                title="No connections yet"
                message="Once a request is accepted, you can message that company here."
              />
            )
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  segment: { paddingHorizontal: 20, paddingBottom: 12 },
  list: { paddingHorizontal: 20, paddingBottom: 32, flexGrow: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  section: { marginTop: 12, marginBottom: 10 },
  card: { gap: 12, padding: 16 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 16, color: C.text },
  subtitle: { fontSize: 12, color: C.textMuted },
  time: { fontSize: 11, color: C.textMuted },
  message: { fontSize: 13, color: C.textDim, fontStyle: 'italic', lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10 },
  hint: { fontSize: 12, color: C.textMuted },
});
