import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Image
} from 'react-native';
import { } from 'expo-router';
import { colors, spacing } from '../../constants/theme';
import { Play, Tv, Share2, Heart, Award, X, ChevronUp } from 'lucide-react-native';
import { fetchVideos, Video } from '../../services/api';
import YoutubePlayer from 'react-native-youtube-iframe';

const { width } = Dimensions.get('window');

export default function VideoHub() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('ALL');
    const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const flatListRef = React.useRef<FlatList>(null);

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

    const handleScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        if (offsetY > 400 && !showScrollTop) {
            setShowScrollTop(true);
        } else if (offsetY <= 400 && showScrollTop) {
            setShowScrollTop(false);
        }
    };

    const scrollToTop = () => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    };

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const getYoutubeThumbnail = (url: string) => {
        const id = getYoutubeId(url);
        return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
    };

    const handleVideoPress = (video: Video) => {
        setPlayingVideo(video);
    };

    const renderVideoItem = ({ item }: { item: Video }) => {
        const thumbUrl = item.thumbnail || getYoutubeThumbnail(item.videoUrl);

        return (
            <TouchableOpacity
                style={styles.videoCard}
                activeOpacity={0.9}
                onPress={() => handleVideoPress(item)}
            >
                <View style={[styles.thumbnailContainer, !thumbUrl && { backgroundColor: '#1a1a1a' }]}>
                    {thumbUrl && (
                        <Image
                            source={{ uri: thumbUrl }}
                            style={StyleSheet.absoluteFill}
                            resizeMode="cover"
                        />
                    )}
                    <View style={styles.thumbnailOverlay}>
                        <Play size={40} color={colors.text} fill={colors.text} />
                    </View>
                    <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{item.duration}</Text>
                    </View>
                </View>

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
    };

    return (
        <View style={styles.container}>

            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                    {['ALL', 'LATEST', 'POPULAR', 'SERIES'].map((tab) => (
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
                ref={flatListRef}
                data={videos}
                renderItem={renderVideoItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
                }
                ListHeaderComponent={
                    <View style={styles.featuredHeader}>
                        <Award size={20} color={colors.accent} />
                        <Text style={styles.featuredLabel}>FEATURED BROADCASTS</Text>
                    </View>
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No videos found. Check back later.</Text>
                        </View>
                    ) : (
                        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
                    )
                }
            />

            {showScrollTop && (
                <TouchableOpacity
                    style={styles.scrollToTopButton}
                    onPress={scrollToTop}
                    activeOpacity={0.8}
                >
                    <ChevronUp size={24} color={colors.background} />
                </TouchableOpacity>
            )}

            <Modal
                visible={playingVideo !== null}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setPlayingVideo(null)}
            >
                <View style={styles.playerContainer}>
                    <View style={styles.playerHeader}>
                        <TouchableOpacity
                            onPress={() => setPlayingVideo(null)}
                            style={styles.closeButton}
                        >
                            <X size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.playerTitle} numberOfLines={1}>
                            {playingVideo?.title}
                        </Text>
                    </View>

                    <View style={styles.videoWrapper}>
                        {playingVideo && getYoutubeId(playingVideo.videoUrl) ? (
                            <YoutubePlayer
                                height={width * 9 / 16}
                                width={width}
                                play={true}
                                videoId={getYoutubeId(playingVideo.videoUrl)!}
                            />
                        ) : (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>Video format not supported in-app.</Text>
                            </View>
                        )}
                    </View>

                    <ScrollView style={styles.playerInfo}>
                        <Text style={styles.playerCategory}>{playingVideo?.category.toUpperCase()}</Text>
                        <Text style={styles.playerMainTitle}>{playingVideo?.title}</Text>
                        <Text style={styles.playerViews}>{playingVideo?.views} views • {playingVideo?.publishedDate}</Text>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    tabsContainer: {
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderDim,
    },
    tabsScroll: {
        paddingHorizontal: spacing.md,
    },
    tab: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        marginRight: spacing.sm,
    },
    activeTab: {
        borderBottomWidth: 3,
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
        paddingBottom: 40,
    },
    featuredHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: spacing.lg,
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
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderDim,
    },
    thumbnailContainer: {
        width: '100%',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    thumbnailOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    durationBadge: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    durationText: {
        color: 'white',
        fontSize: 12,
        fontFamily: 'Inter_600SemiBold',
    },
    videoInfo: {
        padding: spacing.lg,
    },
    videoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
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
        marginBottom: spacing.md,
    },
    videoActions: {
        flexDirection: 'row',
        gap: 20,
    },
    actionBtn: {
        padding: 4,
    },
    playerContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    playerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: spacing.lg,
        backgroundColor: '#000',
    },
    closeButton: {
        padding: 8,
        marginRight: 10,
    },
    playerTitle: {
        flex: 1,
        color: '#fff',
        fontFamily: 'Oswald_500Medium',
        fontSize: 16,
    },
    videoWrapper: {
        backgroundColor: '#000',
        justifyContent: 'center',
    },
    playerInfo: {
        flex: 1,
        padding: spacing.xl,
        backgroundColor: colors.background,
    },
    playerCategory: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12,
        color: colors.accent,
        letterSpacing: 1,
        marginBottom: 8,
    },
    playerMainTitle: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 24,
        color: colors.text,
        lineHeight: 32,
        marginBottom: 12,
    },
    playerViews: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: colors.textDim,
    },
    errorContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#fff',
        fontFamily: 'Inter_400Regular',
    },
    emptyContainer: {
        padding: spacing.xxl,
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: colors.textDim,
    },
    scrollToTopButton: {
        position: 'absolute',
        bottom: spacing.lg,
        right: spacing.lg,
        backgroundColor: colors.accent,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        zIndex: 100,
    },
});
