import { unstable_cache } from 'next/cache';

const NWS_HEADERS = {
    'User-Agent': 'MaineNewsNow/1.0 (info@mainenewsnow.com)',
    'Accept': 'application/geo+json',
};

const REGION_POINTS = [
    { id: 'statewide', label: 'Statewide', location: 'Augusta, Maine', lat: 44.3106, lon: -69.7795 },
    { id: 'northern', label: 'Northern Maine', location: 'Presque Isle, Maine', lat: 46.6812, lon: -68.0159 },
    { id: 'central', label: 'Central Maine', location: 'Bangor, Maine', lat: 44.8012, lon: -68.7778 },
    { id: 'southern', label: 'Southern / Coastal Maine', location: 'Portland, Maine', lat: 43.6591, lon: -70.2568 },
];

export interface ForecastSlice {
    name: string;
    shortForecast: string;
    detailedForecast: string;
    temperature?: number;
    temperatureUnit?: string;
    windSpeed?: string;
    windDirection?: string;
    precipitationChance?: number | null;
}

export interface OutlookDay {
    name: string;
    shortForecast: string;
    temperature?: number;
    temperatureUnit?: string;
    precipitationChance?: number | null;
}

export interface RegionForecast {
    id: string;
    label: string;
    location: string;
    status: 'ok' | 'error';
    errorMessage?: string;
    today?: ForecastSlice;
    tonight?: ForecastSlice;
    tomorrow?: ForecastSlice;
    outlook: OutlookDay[];
}

export interface WeatherAlert {
    id: string;
    event: string;
    headline: string;
    severity: string;
    description: string;
    effective?: string;
    ends?: string;
}

export interface WeatherReport {
    date: string;
    displayDate: string;
    generatedAt: string;
    permalinkPath: string;
    source: string;
    regions: RegionForecast[];
    alerts: WeatherAlert[];
}

interface NwsPointResponse {
    properties: {
        forecast: string;
        relativeLocation?: {
            properties?: {
                city?: string;
                state?: string;
            };
        };
    };
}

interface NwsForecastResponse {
    properties: {
        periods: Array<{
            name: string;
            startTime: string;
            isDaytime: boolean;
            temperature: number;
            temperatureUnit: string;
            windSpeed: string;
            windDirection: string;
            shortForecast: string;
            detailedForecast: string;
            probabilityOfPrecipitation?: { value: number | null };
        }>;
    };
}

interface NwsAlertsResponse {
    features: Array<{
        id: string;
        properties: {
            event: string;
            headline: string;
            severity: string;
            description: string;
            effective?: string;
            ends?: string;
        };
    }>;
}

export function getMaineDateString(date: Date = new Date()): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}

export function isValidDateParam(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatMaineDisplayDate(dateString: string): string {
    const safeDate = new Date(`${dateString}T12:00:00Z`);
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(safeDate);
}

function formatMaineTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
    }).format(date);
}

async function fetchJson<T>(url: string, revalidateSeconds = 1800): Promise<T> {
    const response = await fetch(url, {
        headers: NWS_HEADERS,
        next: { revalidate: revalidateSeconds },
    });

    if (!response.ok) {
        throw new Error(`NWS request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
}

function toForecastSlice(period?: NwsForecastResponse['properties']['periods'][number]): ForecastSlice | undefined {
    if (!period) return undefined;

    return {
        name: period.name,
        shortForecast: period.shortForecast,
        detailedForecast: period.detailedForecast,
        temperature: period.temperature,
        temperatureUnit: period.temperatureUnit,
        windSpeed: period.windSpeed,
        windDirection: period.windDirection,
        precipitationChance: period.probabilityOfPrecipitation?.value ?? null,
    };
}

function buildOutlook(periods: NwsForecastResponse['properties']['periods']): OutlookDay[] {
    return periods
        .filter(period => period.isDaytime)
        .slice(0, 7)
        .map(period => ({
            name: period.name,
            shortForecast: period.shortForecast,
            temperature: period.temperature,
            temperatureUnit: period.temperatureUnit,
            precipitationChance: period.probabilityOfPrecipitation?.value ?? null,
        }));
}

function pickForecastSlices(periods: NwsForecastResponse['properties']['periods']) {
    const today = periods[0];
    const tonightIndex = periods.findIndex((period, index) => index > 0 && period.name.toLowerCase().includes('tonight'));
    const fallbackTonight = periods.find((period, index) => index > 0 && !period.isDaytime);
    const tonight = tonightIndex >= 0 ? periods[tonightIndex] : fallbackTonight;

    const tomorrowStartIndex = tonightIndex >= 0 ? tonightIndex + 1 : 1;
    const tomorrow = periods.slice(tomorrowStartIndex).find(period => period.isDaytime) || periods[tomorrowStartIndex];

    return {
        today: toForecastSlice(today),
        tonight: toForecastSlice(tonight),
        tomorrow: toForecastSlice(tomorrow),
        outlook: buildOutlook(periods),
    };
}

async function fetchForecastForPoint(lat: number, lon: number) {
    const pointData = await fetchJson<NwsPointResponse>(`https://api.weather.gov/points/${lat},${lon}`);
    const forecastUrl = pointData.properties.forecast;
    const locationProps = pointData.properties.relativeLocation?.properties;
    const locationLabel = locationProps?.city && locationProps?.state
        ? `${locationProps.city}, ${locationProps.state}`
        : `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    const forecastData = await fetchJson<NwsForecastResponse>(forecastUrl);

    return {
        locationLabel,
        periods: forecastData.properties.periods || [],
    };
}

async function fetchAlerts(): Promise<WeatherAlert[]> {
    const alertData = await fetchJson<NwsAlertsResponse>('https://api.weather.gov/alerts/active?area=ME', 600);

    return (alertData.features || []).map(feature => ({
        id: feature.id,
        event: feature.properties.event,
        headline: feature.properties.headline,
        severity: feature.properties.severity,
        description: feature.properties.description,
        effective: feature.properties.effective,
        ends: feature.properties.ends,
    }));
}

export async function getWeatherReport(date: string, revalidateSeconds = 3600): Promise<WeatherReport> {
    const cacheKey = ['weather-report', date, String(revalidateSeconds)];
    const cached = unstable_cache(async () => {
        const [alerts, regions] = await Promise.all([
            fetchAlerts().catch(() => []),
            Promise.all(REGION_POINTS.map(async (region) => {
                try {
                    const forecast = await fetchForecastForPoint(region.lat, region.lon);
                    const slices = pickForecastSlices(forecast.periods);

                    return {
                        id: region.id,
                        label: region.label,
                        location: region.location,
                        status: 'ok' as const,
                        today: slices.today,
                        tonight: slices.tonight,
                        tomorrow: slices.tomorrow,
                        outlook: slices.outlook,
                    };
                } catch (error) {
                    console.error(`Failed to load forecast for ${region.label}:`, error);
                    return {
                        id: region.id,
                        label: region.label,
                        location: region.location,
                        status: 'error' as const,
                        errorMessage: 'Weather data is temporarily unavailable.',
                        outlook: [],
                    };
                }
            })),
        ]);

        return {
            date,
            displayDate: formatMaineDisplayDate(date),
            generatedAt: formatMaineTime(new Date()),
            permalinkPath: `/weather/${date}`,
            source: 'Forecast data sourced from the National Weather Service (NOAA).',
            regions,
            alerts,
        };
    }, cacheKey, { revalidate: revalidateSeconds });

    return cached();
}
