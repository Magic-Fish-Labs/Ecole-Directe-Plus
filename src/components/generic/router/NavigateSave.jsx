import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * @typedef {Object} NavigateSaveProps
 * @property {React.ReactNode} children - React component children
 * @property {string} to - Path to navigate to
 * @property {boolean} [saveQueryParams] - If set to true, the current queryParams will overwrite the queryParams of the `to` property
 * @property {boolean} [saveHash] - If set to true, the current hash will overwrite the hash of the `to` property
 */

/**
 * A component with a similar behavior as Navigate from react-router-dom but able to save the current hash/searchParams
 * @param {NavigateSaveProps} props
 */
export default function NavigateSave({to, saveQueryParams, saveHash, ...props}) {
	const location = useLocation();
	const destination = new URL(to, `${window.origin}${location.pathname}${location.search}${location.hash}`);
	
	if (saveQueryParams) {
		destination.search = location.search;
	}
	if (saveHash) {
		destination.hash = location.hash;
	}

	return <Navigate to={`${destination.pathname}${destination.search}${destination.hash}`} {...props} />
}
