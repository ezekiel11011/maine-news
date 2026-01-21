'use client';

import { useMemo, useState } from 'react';
import { CloudSun, Droplets, Moon, Sunrise, Sun, Wind } from 'lucide-react';
import type { RegionForecast } from '@/lib/weather';
import styles from './WeatherReport.module.css';

interface WeatherRegionsProps {
    regions: RegionForecast[];
}

function formatPrecip(probability?: number | null) {
    if (probability === null || probability === undefined) return 'Precip: N/A';
    return `Precip: ${Math.round(probability)}%`;
}

function formatWind(speed?: string, direction?: string) {
    if (!speed) return 'Wind: N/A';
    return direction ? `Wind: ${speed} ${direction}` : `Wind: ${speed}`;
}

function formatTemp(temp?: number, unit?: string) {
    if (temp === null || temp === undefined) return 'N/A';
    return unit ? `${temp}${unit}` : `${temp}`;
}

export default function WeatherRegions({ regions }: WeatherRegionsProps) {
    const [activeRegionId, setActiveRegionId] = useState(regions[0]?.id);

    const activeRegion = useMemo(() => {
        return regions.find(region => region.id === activeRegionId) || regions[0];
    }, [activeRegionId, regions]);

    if (!activeRegion) {
        return null;
    }

    return (
        <section>
            <div className={styles.tabRow} role="tablist" aria-label="Regional forecast tabs">
                {regions.map(region => (
                    <button
                        key={region.id}
                        type="button"
                        role="tab"
                        aria-selected={activeRegionId === region.id}
                        aria-controls={`region-${region.id}`}
                        id={`tab-${region.id}`}
                        className={`${styles.tabButton} ${activeRegionId === region.id ? styles.tabButtonActive : ''}`}
                        onClick={() => setActiveRegionId(region.id)}
                    >
                        {region.label}
                    </button>
                ))}
            </div>

            <div id={`region-${activeRegion.id}`} role="tabpanel" aria-labelledby={`tab-${activeRegion.id}`}>
                <div className={styles.regionHeader}>
                    <div className={styles.regionName}>{activeRegion.label}</div>
                    <div className={styles.regionLocation}>{activeRegion.location}</div>
                </div>

                {activeRegion.status === 'error' ? (
                    <div className={styles.errorState}>{activeRegion.errorMessage}</div>
                ) : (
                    <>
                        <div className={styles.forecastGrid}>
                            {activeRegion.today && (
                                <div className={styles.forecastCard}>
                                    <div className={styles.forecastLabelRow}>
                                        <Sun size={16} className={styles.forecastIcon} />
                                        <span>Today</span>
                                    </div>
                                    <div className={styles.forecastTemp}>
                                        {formatTemp(activeRegion.today.temperature, activeRegion.today.temperatureUnit)}
                                    </div>
                                    <div className={styles.forecastSummary}>{activeRegion.today.shortForecast}</div>
                                    <div className={styles.forecastDetails}>
                                        <span className={styles.detailItem}>
                                            <Wind size={14} />
                                            {formatWind(activeRegion.today.windSpeed, activeRegion.today.windDirection)}
                                        </span>
                                        <span className={styles.detailItem}>
                                            <Droplets size={14} />
                                            {formatPrecip(activeRegion.today.precipitationChance)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {activeRegion.tonight && (
                                <div className={styles.forecastCard}>
                                    <div className={styles.forecastLabelRow}>
                                        <Moon size={16} className={styles.forecastIcon} />
                                        <span>Tonight</span>
                                    </div>
                                    <div className={styles.forecastTemp}>
                                        {formatTemp(activeRegion.tonight.temperature, activeRegion.tonight.temperatureUnit)}
                                    </div>
                                    <div className={styles.forecastSummary}>{activeRegion.tonight.shortForecast}</div>
                                    <div className={styles.forecastDetails}>
                                        <span className={styles.detailItem}>
                                            <Wind size={14} />
                                            {formatWind(activeRegion.tonight.windSpeed, activeRegion.tonight.windDirection)}
                                        </span>
                                        <span className={styles.detailItem}>
                                            <Droplets size={14} />
                                            {formatPrecip(activeRegion.tonight.precipitationChance)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {activeRegion.tomorrow && (
                                <div className={styles.forecastCard}>
                                    <div className={styles.forecastLabelRow}>
                                        <Sunrise size={16} className={styles.forecastIcon} />
                                        <span>Tomorrow</span>
                                    </div>
                                    <div className={styles.forecastTemp}>
                                        {formatTemp(activeRegion.tomorrow.temperature, activeRegion.tomorrow.temperatureUnit)}
                                    </div>
                                    <div className={styles.forecastSummary}>{activeRegion.tomorrow.shortForecast}</div>
                                    <div className={styles.forecastDetails}>
                                        <span className={styles.detailItem}>
                                            <Wind size={14} />
                                            {formatWind(activeRegion.tomorrow.windSpeed, activeRegion.tomorrow.windDirection)}
                                        </span>
                                        <span className={styles.detailItem}>
                                            <Droplets size={14} />
                                            {formatPrecip(activeRegion.tomorrow.precipitationChance)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {activeRegion.outlook.length > 0 && (
                            <div className={styles.outlook}>
                                <h2 className={styles.sectionTitle}>7 Day Outlook</h2>
                                <div className={styles.outlookGrid}>
                                    {activeRegion.outlook.map(day => (
                                        <div key={day.name} className={styles.outlookCard}>
                                            <div className={styles.outlookLabelRow}>
                                                <CloudSun size={14} className={styles.forecastIcon} />
                                                <span>{day.name}</span>
                                            </div>
                                            <div className={styles.outlookTemp}>
                                                {formatTemp(day.temperature, day.temperatureUnit)}
                                            </div>
                                            <div className={styles.outlookSummary}>{day.shortForecast}</div>
                                            <div className={styles.forecastDetails}>
                                                <span className={styles.detailItem}>
                                                    <Droplets size={14} />
                                                    {formatPrecip(day.precipitationChance)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
