import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Dimensions,
    ImageBackground,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    Linking
} from 'react-native';
import { Stack } from 'expo-router';
import { colors, typography, spacing, fontSize } from '../constants/theme';
import { Play, Tv, Share2, Heart, Award } from 'lucide-react-native';
import { fetchVideos, Video } from '../services/api';

const { width } = Dimensions.get('window');

export default function VideoHub() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('ALL');

    const loadVideos = async () => {
        try {
            const data = await fetchVideos();
            setVideos(data);
        } catch (error) {
            console.error('Error loading videos:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadVideos();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadVideos();
    };

    const handleVideoPress = (video: Video) => {
        if (video.videoUrl) {
            Linking.openURL(video.videoUrl);
        }
    };

    const renderVideoItem = ({ item }: { item: Video }) => (
        <TouchableOpacity
            style={styles.videoCard}
            activeOpacity={0.9}
            onPress={() => handleVideoPress(item)}
        >
            <ImageBackground
                source={item.thumbnail ? { uri: item.thumbnail } : require('../assets/hero-fallback.jpeg')}
                style={styles.thumbnail}
                imageStyle={{ borderRadius: 8 }}
            >
                <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{item.duration}</Text>
                </View>
                <View style={[styles.playIconContainer, !item.thumbnail && { backgroundColor: 'rgba(191, 155, 48, 0.2)' }]}>
                    <Play size={32} color={colors.text} fill={colors.text} />
                </View>
            </ImageBackground>

            <View style={styles.videoInfo}>
                <View style={styles.videoHeader}>
                    <Text style={styles.videoCategory}>{item.category.toUpperCase()}</Text>
                    <Text style={styles.viewCount}>{item.views} views</Text>
                </View>
                <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>

                <View style={styles.videoActions}>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Heart size={18} color={colors.textDim} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Share2 size={18} color={colors.textDim} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.loadingText}>Tuning into Maine Broadcasts...</Text>
            </View>
        );
    }

    const liveVideo = videos.find(v => v.isLive);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'VIDEO HUB' }} />

            {liveVideo && (
                <View style={styles.liveStreamBanner}>
                    <View style={styles.liveIndicator}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                    <View style={styles.liveContent}>
                        <Tv size={24} color={colors.accent} />
                        <Text style={styles.liveTitle} numberOfLines={1}>{liveVideo.title}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.watchBtn}
                        onPress={() => liveVideo.videoUrl && Linking.openURL(liveVideo.videoUrl)}
                    >
                        <Text style={styles.watchBtnText}>WATCH LIVE</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['ALL', 'LATEST', 'POPULAR', 'SERIES', 'LIVESTREAMS'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={videos}
                renderItem={renderVideoItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                numColumns={1}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
                }
                ListHeaderComponent={
                    <View style={styles.featuredHeader}>
                        <Award size={20} color={colors.accent} />
                        <Text style={styles.featuredLabel}>FEATURED SHORTFORM</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No videos found. Check back later for fresh broadcasts.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    liveStreamBanner: {
        backgroundColor: '#1a1a1a',
        margin: spacing.md,
        borderRadius: 8,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.border,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ff3b30',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'white',
        marginRight: 4,
    },
    liveText: {
        color: 'white',
        fontFamily: 'Inter_600SemiBold',
        fontSize: 10,
    },
    liveContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        marginHorizontal: spacing.md,
    },
    liveTitle: {
        fontFamily: 'Oswald_500Medium',
        fontSize: 14,
        color: colors.text,
    },
    watchBtn: {
        borderWidth: 1,
        borderColor: colors.accent,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    watchBtnText: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 10,
        color: colors.accent,
    },
    tabsContainer: {
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderDim,
    },
    tab: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        marginHorizontal: 4,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: colors.accent,
    },
    tabText: {
        fontFamily: 'Oswald_500Medium',
        fontSize: 14,
        color: colors.textDim,
        letterSpacing: 1,
    },
    activeTabText: {
        color: colors.accent,
    },
    listContent: {
        padding: spacing.md,
    },
    featuredHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: spacing.md,
    },
    featuredLabel: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12,
        color: colors.textDim,
        letterSpacing: 1,
    },
    videoCard: {
        marginBottom: spacing.xl,
        backgroundColor: colors.cardBg,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderDim,
    },
    thumbnail: {
        width: '100%',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    durationBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    durationText: {
        color: 'white',
        fontSize: 12,
        fontFamily: 'Inter_600SemiBold',
    },
    playIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.text,
    },
    videoInfo: {
        padding: spacing.md,
    },
    videoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    videoCategory: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 10,
        color: colors.accent,
        letterSpacing: 1,
    },
    viewCount: {
        fontFamily: 'Inter_400Regular',
        fontSize: 10,
        color: colors.textDim,
    },
    videoTitle: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 20,
        color: colors.text,
        lineHeight: 26,
        marginBottom: spacing.sm,
    },
    videoActions: {
        flexDirection: 'row',
        gap: 16,
        marginTop: spacing.xs,
    },
    actionBtn: {
        padding: 4,
    },
    centerContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xxl,
    },
    loadingText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
        color: colors.textMuted,
        marginTop: spacing.lg,
        textAlign: 'center',
    },
    emptyContainer: {
        padding: spacing.xxl,
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: colors.textDim,
        textAlign: 'center',
        lineHeight: 22,
    },
});
