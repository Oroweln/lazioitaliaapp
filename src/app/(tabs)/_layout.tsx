import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui/icon';
import { metal } from '@/components/ui/metal';
import { C, Font } from '@/constants/theme';

const TAB_BAR_HEIGHT = 62;

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
        // Deep teal like the website's navbar/footer: ivory when active, with a red marker.
        tabBarActiveTintColor: C.onInk,
        tabBarInactiveTintColor: 'rgba(207,226,228,0.62)',
        tabBarStyle: {
          backgroundColor: C.nav,
          borderTopColor: C.lineOnInk,
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: { fontFamily: Font.bold, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase' },
      }}>
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconWrap}>
                {focused && <View style={[styles.marker, metal('red')]} />}
                <Icon name={t.icon} size={24} color={color} />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center', width: 48, height: 28 },
  // Metal-red line above the active tab (the website's red rule for active states).
  marker: { position: 'absolute', top: -7, width: 28, height: 3, borderRadius: 2 },
});
