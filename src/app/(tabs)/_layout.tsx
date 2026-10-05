import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui/icon';
import { C } from '@/constants/theme';

const TAB_BAR_HEIGHT = 58;

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'discover', title: 'Discover', icon: 'travel_explore' },
  { name: 'connections', title: 'Connections', icon: 'handshake' },
  { name: 'messages', title: 'Messages', icon: 'forum' },
  { name: 'profile', title: 'Profile', icon: 'account_circle' },
];

export default function TabsLayout() {
  // The app is edge-to-edge, so the bar has to reserve the gesture/navigation bar itself;
  // without this it renders behind it and looks like there are no tabs at all.
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: C.bg },
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.textMuted,
        tabBarStyle: {
          backgroundColor: C.bg,
          borderTopColor: C.divider,
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
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
