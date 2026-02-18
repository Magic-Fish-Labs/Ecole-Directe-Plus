import ArchiveIcon from "../../../graphics/ArchiveIcon";
import DraftIcon from "../../../graphics/DraftIcon";
import FolderIcon from "../../../graphics/FolderIcon";
import InboxIcon from "../../../graphics/InboxIcon";
import SendIcon from "../../../graphics/SendIcon";

export function getMarkedFolderIcon(id: number) {
	switch (id) {

		case 0: return <InboxIcon className="folder-icon-tooltip" />;
		case -1: return <SendIcon className="folder-icon-tooltip" />;
		case -2: return <ArchiveIcon className="folder-icon-tooltip" />;
		case -4: return <DraftIcon className="folder-icon-tooltip" />;
		default: return <FolderIcon className="folder-icon-tooltip" />
	}
}
