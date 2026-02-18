import ContentLoader from "react-content-loader";
import { AppContext, SettingsContext } from "../../../App";
import { useContext } from "react";

export default function MessageReaderLoader() {
	const { usedDisplayTheme } = useContext(AppContext);

	const settings = useContext(SettingsContext)
	const {
		displayMode: { value: displayMode }
	} = settings.user;

	const isDisplayModeQuality = displayMode === "quality";

	return <ContentLoader
		className="message-content"
		animate={isDisplayModeQuality}
		speed={1}
		backgroundColor={usedDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
		foregroundColor={usedDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
		style={{ display: "block", width: "min(800px, 100%)", margin: "0 auto", height: "575px" }}
	>
		<rect x="0" y="0" rx="8" ry="8" width="30%" height="20px" />

		<rect x="0" y="60" rx="8" ry="8" width="100%" height="20px" />
		<rect x="0" y="90" rx="8" ry="8" width="70%" height="20px" />

		<rect x="0" y="150" rx="8" ry="8" width="100%" height="20px" />
		<rect x="0" y="180" rx="8" ry="8" width="100%" height="20px" />
		<rect x="0" y="210" rx="8" ry="8" width="100%" height="20px" />
		<rect x="0" y="240" rx="8" ry="8" width="50%" height="20px" />

		<rect x="0" y="300" rx="8" ry="8" width="100%" height="20px" />
		<rect x="0" y="330" rx="8" ry="8" width="40%" height="20px" />

		<rect x="0" y="390" rx="8" ry="8" width="40%" height="20px" />
		<rect x="0" y="420" rx="8" ry="8" width="60%" height="20px" />
		<rect x="0" y="450" rx="8" ry="8" width="30%" height="20px" />

		<rect x="0" y="510" rx="8" ry="8" width="20%" height="20px" />
	</ContentLoader>
}