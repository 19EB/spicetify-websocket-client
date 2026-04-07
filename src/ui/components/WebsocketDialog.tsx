import { WebsocketIcon, getStatusText } from "../icons/WebsocketIcon";
import { WebsocketConnectionStatus } from "../../websocket/types";
import { useWebsocketStatus } from "../hooks/useWebsocketStatus";

const { React } = Spicetify;
const { ButtonPrimary } = Spicetify.ReactComponent;

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
            <WebsocketIcon size={32} status={status} />
            <span>{getStatusText(status)}</span>
            <ButtonComponent colorSet={colorSet} buttonSize="lg" onClick={buttonFn}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    {confirmText}
                </div>
            </ButtonComponent>
        </div>
    );
}

export const WebsocketDialog = Spicetify.React.memo((props: DialogProps) => {
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
