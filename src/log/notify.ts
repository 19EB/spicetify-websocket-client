// Notification port. Spicetify mode shows a snackbar, standalone mode writes to the
// console, which the CDP host mirrors to the terminal.

export type Notifier = (message: string, isError?: boolean) => void;

let notifier: Notifier = (message, isError) => {
    if (isError) console.error(message);
    else console.log(message);
};

export const setNotifier = (next: Notifier) => {
    notifier = next;
}

export const notify = (message: string, isError?: boolean) => {
    try {
        notifier(message, isError);
    } catch (error) {
        console.error("Notifier threw", error);
    }
}
