import { WebsocketIcon, getStatusText } from "../icons/WebsocketIcon";
import { useState } from "react";
import { WebsocketConnectionStatus } from "../../websocket/types";
import { useWebsocketStatus } from "../hooks/useWebsocketStatus";
import { WebsocketDialog } from "./WebsocketDialog";
import { asyncElement } from "../../dom/await-element";
import { Platform } from "../../platform";

const { React } = Spicetify;
const { ButtonTertiary: Button, TooltipWrapper } = Spicetify.ReactComponent;

const scrollToSettings = async () => {
    const websocketSettings = await asyncElement<HTMLElement>("#spicetify-websocket-client");
    if (websocketSettings) {
        websocketSettings.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

export const WebsocketButton = () => {
    const [open, setOpen] = useState<boolean>(false);

    const status = useWebsocketStatus();
    const statusText = getStatusText(status);
    return (
        <React.Fragment>
            {open && <WebsocketDialog onConfirm={async () => {
                Platform.History.push("/preferences");
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
                        <WebsocketIcon status={status} />
                    </div>
                </Button>
            </TooltipWrapper>
        </React.Fragment>
    )
}