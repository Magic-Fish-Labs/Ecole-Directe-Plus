export default function classBuilder(complements: Record<string, boolean>): string;
export default function classBuilder(base: string, complements: Record<string, boolean>): string;
export default function classBuilder(arg1: string | Record<string, boolean>, arg2?: Record<string, boolean>): string {
	let base: string;
	let complements: Record<string, boolean>;

	if (typeof arg1 === "string" && arg2) {
		base = arg1;
		complements = arg2;
	} else {
		base = "";
		complements = arg1 as Record<string, boolean>;
	}

	const activeClasses = Object.keys(complements).filter(cls => complements[cls]);
	return [base, ...activeClasses].filter(Boolean).join(" ");
}
