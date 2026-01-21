import type { WeatherReport as WeatherReportData } from '@/lib/weather';
import WeatherRegions from './WeatherRegions';
import ShareTools from './ShareTools';
import styles from './WeatherReport.module.css';

interface WeatherReportProps {
    report: WeatherReportData | null;
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

function formatAlertTime(value?: string) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('en-US', { timeZone: 'America/New_York' });
}

export default function WeatherReport({ report }: WeatherReportProps) {
    if (!report) {
        return (
            <main className={`container ${styles.page}`}>
                <div className={styles.errorState}>
                    Weather data is currently unavailable. Please check back soon.
                </div>
            </main>
        );
    }

    const headlineRegion = report.regions.find(region => region.id === 'statewide' && region.status === 'ok')
        || report.regions.find(region => region.status === 'ok');
    const headlineForecast = headlineRegion?.today;
    const headlineLabel = headlineRegion?.id === 'statewide'
        ? 'Statewide Snapshot'
        : `${headlineRegion?.label || 'Forecast'} Snapshot`;

    return (
        <main className={`container ${styles.page}`}>
            <section className={styles.hero}>
                <div className={styles.heroRow}>
                    <div>
                        <div className={styles.kicker}>Daily Maine Weather Brief</div>
                        <h1 className={styles.title}>Maine Weather Report</h1>
                        <div className={styles.meta}>
                            {report.displayDate} · Updated {report.generatedAt}
                        </div>
                        <div className={styles.source}>{report.source}</div>
                    </div>

                    <div className={styles.heroCard}>
                        <div className={styles.heroCardLabel}>{headlineLabel}</div>
                        {headlineForecast ? (
                            <>
                                <div className={styles.heroTemp}>
                                    {formatTemp(headlineForecast.temperature, headlineForecast.temperatureUnit)}
                                </div>
                                <div className={styles.heroSummary}>{headlineForecast.shortForecast}</div>
                                <div className={styles.heroDetails}>
                                    {formatWind(headlineForecast.windSpeed, headlineForecast.windDirection)} · {formatPrecip(headlineForecast.precipitationChance)}
                                </div>
                            </>
                        ) : (
                            <div className={styles.heroSummary}>Forecast details are unavailable.</div>
                        )}
                    </div>
                </div>
            </section>

            <ShareTools
                permalinkPath={report.permalinkPath}
                title={`Maine Weather Report - ${report.displayDate}`}
            />

            <WeatherRegions regions={report.regions} />

            {report.alerts.length > 0 && (
                <section className={styles.alerts}>
                    <h2 className={styles.sectionTitle}>Active Alerts</h2>
                    {report.alerts.map(alert => (
                        <div key={alert.id} className={styles.alertItem}>
                            <div className={styles.alertTitle}>{alert.event}</div>
                            <div className={styles.alertHeadline}>{alert.headline}</div>
                            <div className={styles.alertMeta}>
                                Severity: {alert.severity}
                                {alert.effective ? ` · Effective: ${formatAlertTime(alert.effective)}` : ''}
                                {alert.ends ? ` · Ends: ${formatAlertTime(alert.ends)}` : ''}
                            </div>
                        </div>
                    ))}
                </section>
            )}

            <section className={styles.disclaimer}>
                Weather information is provided for general informational purposes only and is sourced from the National Weather Service (NOAA), a public-domain government resource. Maine News Now does not guarantee accuracy and is not responsible for decisions made based on this information.
            </section>
        </main>
    );
}
