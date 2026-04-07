const DEFAULT_TIMEOUT_MS = 5000;

export const asyncElement = <T extends Element = Element>(
    selector: string,
    timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T | null> => {
    const existingElement = document.querySelector<T>(selector);
    if (existingElement) {
        return Promise.resolve(existingElement);
    }

    const root = document.body ?? document.documentElement;
    if (!root) {
        return Promise.resolve(null);
    }

    return new Promise((resolve) => {
        const cleanup = (element: T | null) => {
            window.clearTimeout(timeoutId);
            observer.disconnect();
            resolve(element);
        };

        const observer = new MutationObserver(() => {
            const nextElement = document.querySelector<T>(selector);
            if (nextElement) {
                cleanup(nextElement);
            }
        });

        const timeoutId = window.setTimeout(() => {
            cleanup(document.querySelector<T>(selector));
        }, timeoutMs);

        observer.observe(root, { childList: true, subtree: true });
    });
}