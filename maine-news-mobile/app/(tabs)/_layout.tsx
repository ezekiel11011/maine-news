import { Tabs, useRouter } from 'expo-router';
import { Home, LayoutGrid, Award, Tv, MoreHorizontal, Search, CloudSun } from 'lucide-react-native';
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
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image
                                source={require('../../assets/square-logo.png')}
                                style={{ width: 32, height: 32, marginRight: 10 }}
                                resizeMode="contain"
                            />
                            <Text style={{ fontFamily: 'Oswald_700Bold', fontSize: 18, color: colors.text, letterSpacing: 0.5 }}>
                                MAINE NEWS NOW
                            </Text>
                        </View>
                    ),
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                            <TouchableOpacity
                                onPress={() => router.push('/weather')}
                                style={{ padding: 8 }}
                            >
                                <CloudSun size={24} color={colors.accent} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => router.push('/tips')}
                                style={{
                                    backgroundColor: colors.accent,
                                    paddingHorizontal: 12,
                                    paddingVertical: 5,
                                    borderRadius: 4,
                                    marginHorizontal: 8
                                }}
                            >
                                <Text style={{ color: colors.background, fontFamily: 'Oswald_700Bold', fontSize: 12 }}>SEND NEWS TIP</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => router.push('/search')}
                                style={{ padding: 8 }}
                            >
                                <Search size={22} color={colors.text} />
                            </TouchableOpacity>
                        </View>
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
                name="video-hub"
                options={{
                    title: 'Video Hub',
                    tabBarIcon: ({ color }) => <Tv size={24} color={color} />,
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
