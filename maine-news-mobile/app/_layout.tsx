import { useEffect, useState, useCallback } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
    useFonts,
    Oswald_400Regular,
    Oswald_500Medium,
    Oswald_700Bold
} from '@expo-google-fonts/oswald';
import {
    Inter_400Regular,
    Inter_600SemiBold
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, fontError] = useFonts({
        Oswald_400Regular,
        Oswald_500Medium,
        Oswald_700Bold,
        Inter_400Regular,
        Inter_600SemiBold,
    });

    const [isReady, setIsReady] = useState(false);
    const segments = useSegments();
    const router = useRouter();
    const navigationState = useRootNavigationState();

    useEffect(() => {
        async function prepare() {
            try {
                const hasOnboarded = await AsyncStorage.getItem('has_onboarded');

                // Wait for navigation state to be ready before redirecting
                if (navigationState?.key) {
                    if (!hasOnboarded && segments[0] !== 'onboarding') {
                        router.replace('/onboarding');
                    }
                    setIsReady(true);
                }
            } catch (e) {
                console.warn(e);
                setIsReady(true); // Proceed anyway to avoid white screen
            }
        }

        if (loaded || fontError) {
            prepare();
        }
    }, [loaded, fontError, navigationState?.key]);

    const onLayoutRootView = useCallback(async () => {
        if (loaded && isReady) {
            await SplashScreen.hideAsync();
        }
    }, [loaded, isReady]);

    if (!loaded && !fontError) {
        return null;
    }

    if (!isReady) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color={colors.accent} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }} onLayout={onLayoutRootView}>
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: colors.background,
                    },
                    headerTintColor: colors.text,
                    headerTitleStyle: {
                        fontFamily: 'Oswald_700Bold',
                    },
                    headerTitleAlign: 'center',
                    headerShadowVisible: false,
                    contentStyle: {
                        backgroundColor: colors.background,
                    },
                }}
            >
                <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="article/[slug]"
                    options={{ title: 'Article' }}
                />
                <Stack.Screen
                    name="onboarding"
                    options={{ headerShown: false, presentation: 'fullScreenModal' }}
                />
            </Stack>
            <StatusBar style="light" />
        </View>
    );
}
