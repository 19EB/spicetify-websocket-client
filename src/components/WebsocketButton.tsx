import { ConnectionStatus, getStatusText, GetWebsocketStatusIcon, WebsocketConnectionStatus } from "../svg/WebsocketSvg";
import { createElement, useState } from "react";
import { useWebsocketStatus } from "./useWebsocketStatus";

const { React } = Spicetify;
const { ButtonTertiary: Button, ButtonPrimary, TooltipWrapper } = Spicetify.ReactComponent;

type DialogProps = {
    isOpen?: boolean;
    allowHTML?: boolean;
    titleText: string;
    descriptionText?: string;
    confirmText?: string;
    cancelText?: string;
    confirmLabel?: string;
    onConfirm?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
    onOpen?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
    onClose?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
    onOutside?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
};

const DialogContent = () => {
    const status = useWebsocketStatus();
    const websocketClient = globalThis.websocketClient;

    const confirmText = status === WebsocketConnectionStatus.CONNECTED ? "Disconnect" : "Connect";

    const ButtonComponent = ButtonPrimary;
    const colorSet = status === WebsocketConnectionStatus.CONNECTED ? "negative" : "announcement";
    const buttonFn = status === WebsocketConnectionStatus.CONNECTED ? () => websocketClient.disconnect() : () => websocketClient.connect();

    return (
        <div style={{ marginTop: 48, marginBottom: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <ConnectionStatus size={32} status={status} />
            <span>{getStatusText(status)}</span>

            <ButtonComponent colorSet={colorSet} buttonSize="lg" onClick={buttonFn}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    {confirmText}
                </div>
            </ButtonComponent>


        </div>
    );
}

const Dialog = Spicetify.React.memo((props: DialogProps) => {
    const [state, setState] = Spicetify.React.useState(true);
    const self = document.querySelector(".ReactModalPortal:last-of-type")!;
    const ConfirmDialog = Spicetify.ReactComponent.ConfirmDialog;
    const isForwardRef = typeof ConfirmDialog === "function";

    const commonProps = {
        ...props,
        isOpen: state,
        confirmText: "Settings",
        cancelText: "Close",
        descriptionText: <DialogContent />,
        onClose: () => {
            setState(false);
            props.onClose?.();
            self.remove();
        },
        onConfirm: () => {
            setState(false);
            props.onConfirm?.();
            self.remove();
        }
    };

    Spicetify.React.useEffect(() => {
        if (state) {
            props.onOpen?.();
        }
    }, [state]);

    return isForwardRef ? ConfirmDialog(commonProps) : Spicetify.React.createElement(ConfirmDialog, commonProps);
});

const scrollToSettings = async () => {
    const websocketSettings = document.querySelector("#spicetify-websocket-client");
    let iterations = 0;
    while (!websocketSettings) {
        iterations++;
        if (iterations > 250) {
            console.error("Could not find websocket settings element");
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (websocketSettings) {
        websocketSettings.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

export const WebsocketButton = () => {

    const preferences = document.createElement("a");
    preferences.href = "/preferences";
    preferences.style.display = "none";

    const [open, setOpen] = useState<boolean>(false);

    const status = useWebsocketStatus();
    const statusText = getStatusText(status);
    return (
        <React.Fragment>
            {open && <Dialog onConfirm={async () => {
                Spicetify.Platform.History.push("/preferences");
                setTimeout(() => {
                    scrollToSettings();
                }, 500);
                setOpen(false);
            }} onClose={() => setOpen(false)} titleText="Websocket client" />}
            <TooltipWrapper label={statusText}>
                <Button buttonSize="sm" onClick={() => {
                    if (status !== WebsocketConnectionStatus.CONNECTING) {
                        setOpen(true);
                    }
                }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <ConnectionStatus status={status} />
                    </div>
                </Button>
            </TooltipWrapper>
        </React.Fragment>
    )
}