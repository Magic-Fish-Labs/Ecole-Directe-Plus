
export default function LinkableButton({ children, onClick, to, ...props }) {

	function handleLinkableClick(event) {
		event.preventDefault();
		if (typeof onClick === "function") {
			onClick(event);
		}
	}

	return <a onClick={handleLinkableClick} href={to} {...props}>
		{children}
	</a>
}
