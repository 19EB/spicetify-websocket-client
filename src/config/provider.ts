// Settings port. The Spicetify build backs this with spcr-settings, the standalone
// build with values read from an .ini file by the host.

export interface SettingsProvider {
    getFieldValue<T>(name: string): T | undefined;
}

let provider: SettingsProvider | null = null;

export const setSettingsProvider = (next: SettingsProvider) => {
    provider = next;
}

export const getSettingValue = <T>(name: string): T | undefined => {
    if (!provider) return undefined;
    try {
        return provider.getFieldValue<T>(name);
    } catch (error) {
        console.error(`Failed to read setting "${name}"`, error);
        return undefined;
    }
}

// Backs the standalone build: a flat object of values supplied at injection time.
export const createStaticSettingsProvider = (values: Record<string, unknown>): SettingsProvider => ({
    getFieldValue: <T>(name: string) => values[name] as T | undefined,
});
