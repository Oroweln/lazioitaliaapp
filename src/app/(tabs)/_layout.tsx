import { Tabs } from 'expo-router';

import { Icon, type IconName } from '@/components/ui/icon';
import { C } from '@/constants/theme';

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'discover', title: 'Discover', icon: 'travel_explore' },
  { name: 'connections', title: 'Connections', icon: 'handshake' },
  { name: 'messages', title: 'Messages', icon: 'forum' },
  { name: 'profile', title: 'Profile', icon: 'account_circle' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: C.bg },
        tabBarActiveTintColor: C.accentLight,
        tabBarInactiveTintColor: C.textMuted,
        tabBarStyle: {
          backgroundColor: C.bg,
          borderTopColor: C.divider,
          borderTopWidth: 1,
          elevation: 0,
          height: undefined,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
      }}>
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color }) => <Icon name={t.icon} size={24} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
