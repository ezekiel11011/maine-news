import { Tabs, useRouter } from 'expo-router';
import { Home, LayoutGrid, Award, Bell, MoreHorizontal, Search } from 'lucide-react-native';
import { TouchableOpacity, Image, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography } from '../../constants/theme';

export default function TabsLayout() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.textDim,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopColor: colors.border,
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
                    paddingTop: 8,
                },
                headerStyle: {
                    backgroundColor: colors.background,
                    borderBottomColor: colors.border,
                    borderBottomWidth: 1,
                },
                headerTitleStyle: {
                    fontFamily: 'Oswald_700Bold',
                    color: colors.text,
                },
                headerTitleAlign: 'center',
                tabBarLabelStyle: {
                    fontFamily: 'Inter_400Regular',
                    fontSize: 10,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    headerTitleAlign: 'left',
                    headerTitle: () => (
                        <View style={{ alignItems: 'center' }}>
                            <Image
                                source={require('../../assets/maine-news-now.png')}
                                style={{ width: 160, height: 40 }}
                                resizeMode="contain"
                            />
                        </View>
                    ),
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => router.push('/search')}
                            style={{ marginRight: 16 }}
                        >
                            <Search size={24} color={colors.text} />
                        </TouchableOpacity>
                    ),
                }}
            />
            <Tabs.Screen
                name="sections"
                options={{
                    title: 'Sections',
                    tabBarIcon: ({ color }) => <LayoutGrid size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="tips"
                options={{
                    title: 'Submit Tip',
                    tabBarIcon: ({ color }) => <Award size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    title: 'Alerts',
                    tabBarIcon: ({ color }) => <Bell size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="more"
                options={{
                    title: 'More',
                    tabBarIcon: ({ color }) => <MoreHorizontal size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
