import { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
    Share,
    Image
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { fetchPostBySlug, getImageUrl } from '../../services/api';
import { colors, typography, spacing, fontSize } from '../../constants/theme';
import { Share2, Volume2, ArrowLeft, Type } from 'lucide-react-native';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');

const FONT_SIZES = {
    S: 16,
    M: 20,
    L: 24,
};

export default function ArticleDetail() {
    const { slug } = useLocalSearchParams();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [sizeKey, setSizeKey] = useState<'S' | 'M' | 'L'>('M');

    // Simple Markdoc Node Renderer for React Native
    const renderNode = (node: any, index: number) => {
        if (!node) return null;

        if (typeof node === 'string') {
            return <Text key={index} style={[styles.paragraph, { fontSize: FONT_SIZES[sizeKey] }]}>{node}</Text>;
        }

        // Handle Markdoc node structure
        const { type, children, attributes } = node;

        switch (type) {
            case 'document':
                return children.map((child: any, i: number) => renderNode(child, i));
            case 'paragraph':
                return (
                    <View key={index} style={styles.paragraphContainer}>
                        <Text style={[styles.paragraph, { fontSize: FONT_SIZES[sizeKey] }]}>
                            {children ? children.map((child: any, i: number) => renderNode(child, i)) : null}
                        </Text>
                    </View>
                );
            case 'text':
                return <Text key={index}>{attributes?.content || node.children?.[0] || ''}</Text>;
            case 'heading':
                const level = attributes?.level || 1;
                return (
                    <Text key={index} style={[styles.heading, level === 1 && styles.h1, level === 2 && styles.h2]}>
                        {children ? children.map((child: any, i: number) => renderNode(child, i)) : null}
                    </Text>
                );
            case 'list':
                return (
                    <View key={index} style={styles.list}>
                        {children ? children.map((child: any, i: number) => renderNode(child, i)) : null}
                    </View>
                );
            case 'item':
                return (
                    <View key={index} style={styles.listItem}>
                        <Text style={[styles.bullet, { fontSize: FONT_SIZES[sizeKey] }]}>• </Text>
                        <Text style={[styles.listItemText, { fontSize: FONT_SIZES[sizeKey] }]}>
                            {children ? children.map((child: any, i: number) => renderNode(child, i)) : null}
                        </Text>
                    </View>
                );
            case 'image':
                return null; // Skip body images to prevent layout distortion
            default:
                // Fallback: just try to join children text
                if (children) {
                    return <Text key={index}>{children.map((child: any, i: number) => renderNode(child, i))}</Text>;
                }
                return null;
        }
    };

    useEffect(() => {
        async function getPost() {
            if (typeof slug === 'string') {
                const data = await fetchPostBySlug(slug);
                setPost(data);
                setLoading(false);
            }
        }
        getPost();
    }, [slug]);

    const toggleTextSize = () => {
        const sequence: ('S' | 'M' | 'L')[] = ['S', 'M', 'L'];
        const nextIndex = (sequence.indexOf(sizeKey) + 1) % sequence.length;
        setSizeKey(sequence[nextIndex]);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `${post.title} - Maine News Today`,
                url: `https://mainenewstoday.com/article/${slug}`, // Fallback web URL
            });
        } catch (error) {
            console.error(error);
        }
    };

    const toggleSpeech = () => {
        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
        } else {
            // Simple logic to extract text from markdoc nodes
            const extractText = (node: any): string => {
                if (!node) return '';
                if (typeof node === 'string') return node;
                if (node.attributes?.content) return node.attributes.content;
                if (node.children) return node.children.map(extractText).join(' ');
                return '';
            };

            const fullText = `${post.title}. By ${post.author}. ${extractText(post.content)}`;
            Speech.speak(fullText, {
                onDone: () => setIsSpeaking(false),
                onStopped: () => setIsSpeaking(false),
                onError: () => setIsSpeaking(false),
            });
            setIsSpeaking(true);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    if (!post) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Article not found.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                title: '',
                headerRight: () => (
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={toggleTextSize} style={styles.headerIcon}>
                            <Type size={24} color={colors.text} />
                            <Text style={styles.sizeIndicator}>{sizeKey}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={toggleSpeech} style={styles.headerIcon}>
                            <Volume2 size={24} color={isSpeaking ? colors.accent : colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleShare} style={styles.headerIcon}>
                            <Share2 size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                )
            }} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{post.category.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.title}>{post.title}</Text>
                    <View style={styles.meta}>
                        <Text style={styles.author}>By {post.author}</Text>
                        <Text style={styles.separator}>///</Text>
                        <Text style={styles.date}>{new Date(post.publishedDate).toLocaleDateString('en-US', {
                            month: 'long', day: 'numeric', year: 'numeric'
                        })}</Text>
                    </View>
                </View>

                <Image
                    source={getImageUrl(post.image) ? { uri: getImageUrl(post.image)! } : require('../../assets/hero-fallback.jpeg')}
                    style={styles.heroImage}
                    resizeMode="cover"
                />

                <View style={styles.content}>
                    {renderNode(post.content, 0)}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerBranding}>MAINE NEWS TODAY</Text>
                    <Text style={styles.footerTagline}>Unbiased. Unafraid. Unfiltered.</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: spacing.xxl,
    },
    header: {
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderDim,
    },
    heroImage: {
        width: '100%',
        height: 250,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginRight: 8,
    },
    headerIcon: {
        padding: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    sizeIndicator: {
        fontSize: 10,
        color: colors.accent,
        fontWeight: 'bold',
        marginLeft: -4,
        marginTop: 8,
    },
    categoryBadge: {
        backgroundColor: colors.accent,
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 2,
        marginBottom: spacing.md,
    },
    categoryText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 10,
        color: colors.background,
    },
    title: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 32,
        color: colors.text,
        lineHeight: 38,
        marginBottom: spacing.md,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    author: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12,
        color: colors.text,
    },
    separator: {
        color: colors.accent,
        marginHorizontal: 10,
        fontSize: 12,
    },
    date: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: colors.textDim,
    },
    content: {
        padding: spacing.lg,
    },
    paragraphContainer: {
        marginBottom: spacing.lg,
    },
    paragraph: {
        fontFamily: 'Inter_400Regular',
        color: colors.textMuted,
        lineHeight: 28,
    },
    heading: {
        fontFamily: 'Oswald_700Bold',
        color: colors.text,
        marginTop: spacing.lg,
        marginBottom: spacing.md,
    },
    imageContainer: {
        marginVertical: spacing.lg,
    },
    inlineImage: {
        width: '100%',
        height: 200,
        backgroundColor: colors.borderDim,
        borderRadius: 4,
    },
    imageCaption: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: colors.textDim,
        marginTop: 4,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    h1: { fontSize: 28 },
    h2: { fontSize: 24 },
    list: {
        marginBottom: spacing.lg,
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
        paddingLeft: spacing.md,
    },
    bullet: {
        color: colors.accent,
    },
    listItemText: {
        fontFamily: 'Inter_400Regular',
        color: colors.textMuted,
        flex: 1,
    },
    footer: {
        marginTop: spacing.xxl,
        padding: spacing.xxl,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.borderDim,
    },
    footerBranding: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 20,
        color: colors.text,
        letterSpacing: 1,
    },
    footerTagline: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: colors.accent,
        marginTop: 4,
    },
    errorText: {
        color: colors.textDim,
        fontFamily: 'Inter_400Regular',
    }
});
