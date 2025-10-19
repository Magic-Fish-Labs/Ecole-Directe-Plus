import React, { useContext, createContext, useState, ReactNode, useRef } from "react";
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
	content: React.ReactNode
}

type OverlayParams =
	| OverlayCommonParams & {
		overlayType: OverlayTypes.BOTTOM_SHEET,
		props: Omit<React.ComponentProps<typeof BottomSheet>, "onClose" | "children" | "forceClose">
	}
	| OverlayCommonParams & {
		overlayType: OverlayTypes.POP_UP,
		props: Omit<React.ComponentProps<typeof PopUp>, "onClose" | "children" | "forceClose">
	}
	| OverlayCommonParams & {
		overlayType: OverlayTypes.INFO_POP_UP,
		props: Omit<React.ComponentProps<typeof InfoPopUp>, "onClose" | "children" | "forceClose">
	};

type BottomSheetParams = Omit<Extract<OverlayParams, { overlayType: OverlayTypes.BOTTOM_SHEET }>, 'overlayType'>;
type PopUpParams = Omit<Extract<OverlayParams, { overlayType: OverlayTypes.POP_UP }>, 'overlayType'>;
type InfoPopUpParams = Omit<Extract<OverlayParams, { overlayType: OverlayTypes.INFO_POP_UP }>, 'overlayType'>;

type OverlayObject = OverlayParams & { overlayId: number, forceClose: boolean };

type OverlayContextType = {
	createOverlay: (overlayParams: OverlayParams) => number,
	createBottomSheet: (bottomSheetParams: BottomSheetParams) => number,
	createPopUp: (popUpParams: PopUpParams) => number,
	createInfoPopUp: (infoPopUpParams: InfoPopUpParams) => number,
	closeOverlay: (overlayId: number) => void
};

const OverlayContext = createContext<OverlayContextType | null>(null);

export function OverlayProvider({ children }: { children: ReactNode }) {
	const [overlayStack, setOverlayStack] = useState<OverlayObject[]>([]);

	const nextOverlayId = useRef(0);

	function removeOverlay(targetOverlayId: number) {
		setOverlayStack((old) => old.filter(({ overlayId }) => overlayId != targetOverlayId));
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

	function createOverlay(overlayParams: OverlayParams) {
		const overlayId = nextOverlayId.current;
		nextOverlayId.current++;
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
				forceClose: false
			});
			return next;
		});
		return overlayId;
	}

	function createBottomSheet(bottomSheetParams: BottomSheetParams) {
		return createOverlay({ ...bottomSheetParams, overlayType: OverlayTypes.BOTTOM_SHEET })
	}

	function createPopUp(popUpParams: PopUpParams) {
		return createOverlay({ ...popUpParams, overlayType: OverlayTypes.POP_UP })
	}

	function createInfoPopUp(popUpParams: InfoPopUpParams) {
		return createOverlay({ ...popUpParams, overlayType: OverlayTypes.INFO_POP_UP })
	}

	const overlayContextValue = {
		createOverlay,
		createBottomSheet,
		createPopUp,
		createInfoPopUp,
		closeOverlay
	}

	return <OverlayContext.Provider value={overlayContextValue}>
		{children}
		{(() => {console.log(overlayStack.length); return null;})()}
		<div className={classBuilder("overlay-shadow", { "active": overlayStack.length })}></div>
		{overlayStack.map(({ overlayId, overlayType, content, onClose, forceClose, props }) => {
			switch (overlayType) {
				case OverlayTypes.BOTTOM_SHEET:
					return <BottomSheet key={overlayId} onClose={onClose} forceClose={forceClose} {...props} >{content}</BottomSheet>
				case OverlayTypes.POP_UP:
					return <PopUp key={overlayId} onClose={onClose} forceClose={forceClose} {...props} >{content}</PopUp>
				case OverlayTypes.INFO_POP_UP:
					return <InfoPopUp key={overlayId} onClose={onClose} forceClose={forceClose} {...props} >{content}</InfoPopUp>
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
