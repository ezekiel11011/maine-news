import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CloudSun, MapPin, Wind, Droplets, AlertTriangle, Calendar } from 'lucide-react-native';
import { colors, spacing, typography } from '../constants/theme';
import { API_BASE_URL, fetchWeatherReport, WeatherReport, RegionForecast } from '../services/api';

function formatTemp(temp?: number, unit?: string) {
    if (temp === null || temp === undefined) return 'N/A';
    return unit ? `${temp}${unit}` : `${temp}`;
}

function formatWind(speed?: string, direction?: string) {
    if (!speed) return 'Wind: N/A';
    return direction ? `Wind: ${speed} ${direction}` : `Wind: ${speed}`;
}

function formatPrecip(probability?: number | null) {
    if (probability === null || probability === undefined) return 'Precip: N/A';
    return `Precip: ${Math.round(probability)}%`;
}

export default function WeatherScreen() {
    const [report, setReport] = useState<WeatherReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeRegionId, setActiveRegionId] = useState<string | null>(null);

    useEffect(() => {
        const loadReport = async () => {
            try {
                const data = await fetchWeatherReport();
                setReport(data);
            } catch (error) {
                console.error('Error loading weather report:', error);
            } finally {
                setLoading(false);
            }
        };

        loadReport();
    }, []);

    useEffect(() => {
        if (report?.regions?.length && !activeRegionId) {
            setActiveRegionId(report.regions[0].id);
        }
    }, [report, activeRegionId]);

    const activeRegion = useMemo<RegionForecast | null>(() => {
        if (!report?.regions?.length) return null;
        return report.regions.find(region => region.id === activeRegionId) || report.regions[0];
    }, [report, activeRegionId]);

    const snapshotRegion = useMemo(() => {
        if (!report?.regions?.length) return null;
        return report.regions.find(region => region.id === 'statewide' && region.status === 'ok')
            || report.regions.find(region => region.status === 'ok')
            || report.regions[0];
    }, [report]);

    const handleShare = async () => {
        if (!report) return;
        const shareUrl = `${API_BASE_URL}${report.permalinkPath}`;
        try {
            await Share.share({
                title: `Maine Weather Report - ${report.displayDate}`,
                message: shareUrl,
                url: shareUrl,
            });
        } catch (error) {
            console.error('Share failed:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                title: 'Maine Weather',
                headerTransparent: true,
                headerTintColor: '#fff',
                headerTitleStyle: { fontFamily: typography.heading }
            }} />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            ) : report ? (
                <ScrollView contentContainerStyle={styles.content}>
                    <LinearGradient
                        colors={['#0f172a', '#1e3a8a', '#0b1020']}
                        style={styles.heroGradient}
                    >
                        <View style={styles.heroContent}>
                            <Text style={styles.kicker}>Daily Maine Weather Brief</Text>
                            <Text style={styles.title}>Maine Weather Report</Text>
                            <View style={styles.metaRow}>
                                <Calendar size={14} color="rgba(255,255,255,0.8)" />
                                <Text style={styles.metaText}>
                                    {report.displayDate} · Updated {report.generatedAt}
                                </Text>
                            </View>
                            <Text style={styles.sourceText}>{report.source}</Text>

                            <View style={styles.snapshotCard}>
                                <View style={styles.snapshotHeader}>
                                    <MapPin size={16} color={colors.accent} />
                                    <Text style={styles.snapshotLabel}>{snapshotRegion?.label || 'Snapshot'}</Text>
                                </View>
                                <View style={styles.snapshotRow}>
                                    <CloudSun size={48} color="#fff" strokeWidth={1.5} />
                                    <View style={styles.snapshotText}>
                                        <Text style={styles.snapshotTemp}>
                                            {formatTemp(snapshotRegion?.today?.temperature, snapshotRegion?.today?.temperatureUnit)}
                                        </Text>
                                        <Text style={styles.snapshotSummary}>
                                            {snapshotRegion?.today?.shortForecast || 'Forecast details unavailable'}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.snapshotDetails}>
                                    {formatWind(snapshotRegion?.today?.windSpeed, snapshotRegion?.today?.windDirection)} · {formatPrecip(snapshotRegion?.today?.precipitationChance)}
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>

                    <View style={styles.shareCard}>
                        <Text style={styles.shareTitle}>Share this report</Text>
                        <Text style={styles.shareLink}>{API_BASE_URL}{report.permalinkPath}</Text>
                        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                            <Text style={styles.shareButtonText}>Share</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tabsWrapper}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
                            {report.regions.map(region => (
                                <TouchableOpacity
                                    key={region.id}
                                    onPress={() => setActiveRegionId(region.id)}
                                    style={[
                                        styles.tabButton,
                                        activeRegion?.id === region.id && styles.tabButtonActive
                                    ]}
                                >
                                    <Text style={[
                                        styles.tabButtonText,
                                        activeRegion?.id === region.id && styles.tabButtonTextActive
                                    ]}>
                                        {region.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {activeRegion ? (
                        <View style={styles.regionSection}>
                            <Text style={styles.regionTitle}>{activeRegion.label}</Text>
                            <Text style={styles.regionLocation}>{activeRegion.location}</Text>

                            {activeRegion.status === 'error' ? (
                                <View style={styles.errorCard}>
                                    <Text style={styles.errorText}>{activeRegion.errorMessage}</Text>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.cardRow}>
                                        {activeRegion.today && (
                                            <View style={styles.forecastCard}>
                                                <Text style={styles.cardLabel}>Today</Text>
                                                <Text style={styles.cardTemp}>
                                                    {formatTemp(activeRegion.today.temperature, activeRegion.today.temperatureUnit)}
                                                </Text>
                                                <Text style={styles.cardSummary}>{activeRegion.today.shortForecast}</Text>
                                                <View style={styles.cardMetaRow}>
                                                    <Wind size={14} color={colors.textDim} />
                                                    <Text style={styles.cardMetaText}>
                                                        {formatWind(activeRegion.today.windSpeed, activeRegion.today.windDirection)}
                                                    </Text>
                                                </View>
                                                <View style={styles.cardMetaRow}>
                                                    <Droplets size={14} color={colors.textDim} />
                                                    <Text style={styles.cardMetaText}>
                                                        {formatPrecip(activeRegion.today.precipitationChance)}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}

                                        {activeRegion.tonight && (
                                            <View style={styles.forecastCard}>
                                                <Text style={styles.cardLabel}>Tonight</Text>
                                                <Text style={styles.cardTemp}>
                                                    {formatTemp(activeRegion.tonight.temperature, activeRegion.tonight.temperatureUnit)}
                                                </Text>
                                                <Text style={styles.cardSummary}>{activeRegion.tonight.shortForecast}</Text>
                                                <View style={styles.cardMetaRow}>
                                                    <Wind size={14} color={colors.textDim} />
                                                    <Text style={styles.cardMetaText}>
                                                        {formatWind(activeRegion.tonight.windSpeed, activeRegion.tonight.windDirection)}
                                                    </Text>
                                                </View>
                                                <View style={styles.cardMetaRow}>
                                                    <Droplets size={14} color={colors.textDim} />
                                                    <Text style={styles.cardMetaText}>
                                                        {formatPrecip(activeRegion.tonight.precipitationChance)}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}

                                        {activeRegion.tomorrow && (
                                            <View style={styles.forecastCard}>
                                                <Text style={styles.cardLabel}>Tomorrow</Text>
                                                <Text style={styles.cardTemp}>
                                                    {formatTemp(activeRegion.tomorrow.temperature, activeRegion.tomorrow.temperatureUnit)}
                                                </Text>
                                                <Text style={styles.cardSummary}>{activeRegion.tomorrow.shortForecast}</Text>
                                                <View style={styles.cardMetaRow}>
                                                    <Wind size={14} color={colors.textDim} />
                                                    <Text style={styles.cardMetaText}>
                                                        {formatWind(activeRegion.tomorrow.windSpeed, activeRegion.tomorrow.windDirection)}
                                                    </Text>
                                                </View>
                                                <View style={styles.cardMetaRow}>
                                                    <Droplets size={14} color={colors.textDim} />
                                                    <Text style={styles.cardMetaText}>
                                                        {formatPrecip(activeRegion.tomorrow.precipitationChance)}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    {activeRegion.outlook.length > 0 && (
                                        <View style={styles.outlookSection}>
                                            <Text style={styles.sectionTitle}>7 Day Outlook</Text>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.outlookRow}>
                                                {activeRegion.outlook.map(day => (
                                                    <View key={day.name} style={styles.outlookCard}>
                                                        <Text style={styles.outlookLabel}>{day.name}</Text>
                                                        <Text style={styles.outlookTemp}>
                                                            {formatTemp(day.temperature, day.temperatureUnit)}
                                                        </Text>
                                                        <Text style={styles.outlookSummary}>{day.shortForecast}</Text>
                                                        <Text style={styles.outlookMeta}>{formatPrecip(day.precipitationChance)}</Text>
                                                    </View>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                    ) : null}

                    {report.alerts.length > 0 && (
                        <View style={styles.alertsSection}>
                            <View style={styles.alertHeader}>
                                <AlertTriangle size={18} color="#f87171" />
                                <Text style={styles.alertTitle}>Active Alerts</Text>
                            </View>
                            {report.alerts.map(alert => (
                                <View key={alert.id} style={styles.alertCard}>
                                    <Text style={styles.alertEvent}>{alert.event}</Text>
                                    <Text style={styles.alertHeadline}>{alert.headline}</Text>
                                    <Text style={styles.alertSeverity}>Severity: {alert.severity}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={styles.disclaimer}>
                        <Text style={styles.disclaimerText}>
                            Weather information is provided for general informational purposes only and is sourced from the National Weather Service (NOAA), a public-domain government resource. Maine News Now does not guarantee accuracy and is not responsible for decisions made based on this information.
                        </Text>
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.loadingContainer}>
                    <Text style={styles.errorText}>Weather data is currently unavailable.</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        paddingBottom: spacing.xxl,
    },
    heroGradient: {
        paddingTop: 100,
        paddingBottom: 32,
        paddingHorizontal: spacing.xl,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    heroContent: {
        gap: spacing.md,
    },
    kicker: {
        fontFamily: typography.heading,
        fontSize: 12,
        letterSpacing: 2,
        color: colors.accent,
        textTransform: 'uppercase',
    },
    title: {
        fontFamily: typography.heading,
        fontSize: 30,
        color: colors.text,
        textTransform: 'uppercase',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textMuted,
    },
    sourceText: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textDim,
    },
    snapshotCard: {
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.borderDim,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: spacing.md,
        gap: spacing.sm,
    },
    snapshotHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    snapshotLabel: {
        fontFamily: typography.bodySemiBold,
        fontSize: 13,
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    snapshotRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    snapshotText: {
        flex: 1,
    },
    snapshotTemp: {
        fontFamily: typography.heading,
        fontSize: 36,
        color: colors.text,
    },
    snapshotSummary: {
        fontFamily: typography.bodySemiBold,
        fontSize: 14,
        color: colors.text,
    },
    snapshotDetails: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textDim,
    },
    shareCard: {
        marginTop: spacing.lg,
        marginHorizontal: spacing.lg,
        padding: spacing.md,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.borderDim,
        backgroundColor: colors.cardBg,
        gap: spacing.sm,
    },
    shareTitle: {
        fontFamily: typography.heading,
        fontSize: 14,
        color: colors.text,
        textTransform: 'uppercase',
    },
    shareLink: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textDim,
    },
    shareButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.border,
    },
    shareButtonText: {
        fontFamily: typography.bodySemiBold,
        color: colors.text,
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    tabsWrapper: {
        marginTop: spacing.lg,
    },
    tabRow: {
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
    },
    tabButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.borderDim,
    },
    tabButtonActive: {
        borderColor: colors.accent,
        backgroundColor: 'rgba(191, 155, 48, 0.12)',
    },
    tabButtonText: {
        fontFamily: typography.bodySemiBold,
        fontSize: 12,
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    tabButtonTextActive: {
        color: colors.accent,
    },
    regionSection: {
        marginTop: spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    regionTitle: {
        fontFamily: typography.heading,
        fontSize: 22,
        color: colors.text,
        textTransform: 'uppercase',
    },
    regionLocation: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textDim,
        marginBottom: spacing.md,
    },
    cardRow: {
        gap: spacing.md,
    },
    forecastCard: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.borderDim,
        backgroundColor: colors.cardBg,
        padding: spacing.md,
        gap: spacing.xs,
    },
    cardLabel: {
        fontFamily: typography.heading,
        fontSize: 14,
        color: colors.accent,
        textTransform: 'uppercase',
    },
    cardTemp: {
        fontFamily: typography.heading,
        fontSize: 32,
        color: colors.text,
    },
    cardSummary: {
        fontFamily: typography.bodySemiBold,
        fontSize: 14,
        color: colors.text,
    },
    cardMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cardMetaText: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textDim,
    },
    outlookSection: {
        marginTop: spacing.lg,
    },
    sectionTitle: {
        fontFamily: typography.heading,
        fontSize: 16,
        color: colors.text,
        textTransform: 'uppercase',
        marginBottom: spacing.sm,
    },
    outlookRow: {
        gap: spacing.sm,
        paddingRight: spacing.lg,
    },
    outlookCard: {
        width: 150,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.borderDim,
        backgroundColor: colors.cardBg,
        padding: spacing.md,
        gap: spacing.xs,
    },
    outlookLabel: {
        fontFamily: typography.bodySemiBold,
        fontSize: 12,
        color: colors.textMuted,
        textTransform: 'uppercase',
    },
    outlookTemp: {
        fontFamily: typography.heading,
        fontSize: 20,
        color: colors.text,
    },
    outlookSummary: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.text,
    },
    outlookMeta: {
        fontFamily: typography.body,
        fontSize: 11,
        color: colors.textDim,
    },
    alertsSection: {
        marginTop: spacing.xl,
        marginHorizontal: spacing.lg,
        padding: spacing.md,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(248, 113, 113, 0.4)',
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
        gap: spacing.sm,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    alertTitle: {
        fontFamily: typography.heading,
        fontSize: 14,
        color: '#f87171',
        textTransform: 'uppercase',
    },
    alertCard: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(248, 113, 113, 0.3)',
        paddingTop: spacing.sm,
        gap: spacing.xs,
    },
    alertEvent: {
        fontFamily: typography.bodySemiBold,
        fontSize: 14,
        color: colors.text,
    },
    alertHeadline: {
        fontFamily: typography.body,
        fontSize: 12,
        color: colors.textMuted,
    },
    alertSeverity: {
        fontFamily: typography.body,
        fontSize: 11,
        color: colors.textDim,
    },
    disclaimer: {
        marginTop: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    disclaimerText: {
        fontFamily: typography.body,
        fontSize: 11,
        color: colors.textDim,
        lineHeight: 16,
    },
    errorCard: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.borderDim,
        backgroundColor: colors.cardBg,
        padding: spacing.md,
    },
    errorText: {
        fontFamily: typography.body,
        fontSize: 13,
        color: colors.textDim,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
