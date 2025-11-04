import React, { useContext, createContext, useState, useRef, useEffect, ReactNode } from "react";
import PopUp from "../components/generic/PopUps/PopUp";
import InfoPopUp from "../components/generic/PopUps/InfoPopUp";
import BottomSheet from "../components/generic/PopUps/BottomSheet";
import classBuilder from "../utils/classBuilder";

import "./Overlay.css"

export enum OverlayTypes {
	BOTTOM_SHEET,
	POP_UP,
	INFO_POP_UP
}

type OverlayCommonParams = {
	onClose?: () => void
	onClosing?: (timer: number) => void
	content: React.ReactNode
}

type OverlayParams =
	| OverlayCommonParams & {
		overlayType: OverlayTypes.BOTTOM_SHEET,
		props: Omit<React.ComponentProps<typeof BottomSheet>, "onClose" | "onClosing" | "children" | "forceClose">
	}
	| OverlayCommonParams & {
		overlayType: OverlayTypes.POP_UP,
		props: Omit<React.ComponentProps<typeof PopUp>, "onClose" | "onClosing" | "children" | "forceClose">
	}
	| OverlayCommonParams & {
		overlayType: OverlayTypes.INFO_POP_UP,
		props: Omit<React.ComponentProps<typeof InfoPopUp>, "onClose" | "onClosing" | "children" | "forceClose">
	};

type BottomSheetParams = Omit<Extract<OverlayParams, { overlayType: OverlayTypes.BOTTOM_SHEET }>, 'overlayType'>;
type PopUpParams = Omit<Extract<OverlayParams, { overlayType: OverlayTypes.POP_UP }>, 'overlayType'>;
type InfoPopUpParams = Omit<Extract<OverlayParams, { overlayType: OverlayTypes.INFO_POP_UP }>, 'overlayType'>;

type OverlayObject = OverlayParams & { overlayId: number, forceClose: boolean };

type OverlayContextType = {
	createOverlay: <T extends OverlayTypes>(overlayType: T, params: Omit<Extract<OverlayParams, { overlayType: T }>, 'overlayType'>) => number,
	createBottomSheet: (bottomSheetParams: BottomSheetParams) => number,
	createPopUp: (popUpParams: PopUpParams) => number,
	createInfoPopUp: (infoPopUpParams: InfoPopUpParams) => number,
	closeOverlay: (overlayId: number) => void
};

const OverlayContext = createContext<OverlayContextType | null>(null);

export function OverlayProvider({ children }: { children: ReactNode }) {
	const [overlayStack, setOverlayStack] = useState<OverlayObject[]>([]);
	const [shadow, setShadow] = useState(false);

	const activeOverlays = useRef(0);
	const nextOverlayId = useRef(0);

	function handleClosing() {
		activeOverlays.current--;
		if (activeOverlays.current === 0)
			setShadow(false);
	}

	function removeOverlay(targetOverlayId: number) {
		setOverlayStack((old) => old.filter(({ overlayId }) => overlayId != targetOverlayId));
	}

	function pushOverlay(overlayParams: OverlayParams) {
		const overlayId = nextOverlayId.current;
		nextOverlayId.current++;
		activeOverlays.current++;
		setShadow(true);
		setOverlayStack((previous) => {
			const next = [...previous];
			next.push({
				...overlayParams,
				overlayId: overlayId,
				onClose: () => {
					removeOverlay(overlayId);
					if (overlayParams.onClose)
						overlayParams.onClose();
				},
				onClosing: (timer: number) => {
					handleClosing();
					if (overlayParams.onClosing)
						overlayParams.onClosing(timer);
				},
				forceClose: false
			});
			return next;
		});
		return overlayId;
	}

	function closeOverlay(targetOverlayId: number) {
		setOverlayStack((previous) => {
			const next = [...previous];
			const targetOverlay = next.find((overlay) => overlay.overlayId === targetOverlayId)
			if (targetOverlay)
				targetOverlay.forceClose = true;
			return next;
		})
	}

	const overlayContextValue = {
		createOverlay: (overlayType: OverlayTypes, params: any) => pushOverlay({ ...params, overlayType }),
		createBottomSheet: (bottomSheetParams: BottomSheetParams) => pushOverlay({ ...bottomSheetParams, overlayType: OverlayTypes.BOTTOM_SHEET }),
		createPopUp: (popUpParams: PopUpParams) => pushOverlay({ ...popUpParams, overlayType: OverlayTypes.POP_UP }),
		createInfoPopUp: (popUpParams: InfoPopUpParams) => pushOverlay({ ...popUpParams, overlayType: OverlayTypes.INFO_POP_UP }),
		closeOverlay
	}

	return <OverlayContext.Provider value={overlayContextValue}>
		{children}
		<div className={classBuilder("overlay-shadow", { "active": shadow })}></div>
		{overlayStack.map(({ overlayId, overlayType, content, onClose, onClosing, forceClose, props }) => {
			switch (overlayType) {
				case OverlayTypes.BOTTOM_SHEET:
					return <BottomSheet key={overlayId} onClose={onClose} onClosing={onClosing} forceClose={forceClose} {...props} >{content}</BottomSheet>
				case OverlayTypes.POP_UP:
					return <PopUp key={overlayId} onClose={onClose} onClosing={onClosing} forceClose={forceClose} {...props} >{content}</PopUp>
				case OverlayTypes.INFO_POP_UP:
					return <InfoPopUp key={overlayId} onClose={onClose} onClosing={onClosing} forceClose={forceClose} {...props} >{content}</InfoPopUp>
			}
		})}
	</OverlayContext.Provider>
}

export function useOverlay() {
	const ctx = useContext(OverlayContext);
	if (!ctx)
		throw new Error("useOverlay() must be used within an OverlayProvider");
	return ctx;
}
