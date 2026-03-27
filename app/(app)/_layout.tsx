import { Tabs } from 'expo-router';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { colors } from '../../src/lib/constants/colors';
import { BannerAdView } from '../../src/components/BannerAdView';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      tabBar={(props) => (
        <View>
          <BannerAdView />
          <BottomTabBar {...props} />
        </View>
      )}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '오늘',
          tabBarIcon: ({ focused }) => <TabIcon emoji="✦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '히스토리',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📖" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="us"
        options={{
          title: '우리',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🐣" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="pairing"
        options={{
          title: '연결',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💌" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
