export default function classBuilder(base, complements) {
	if (!base) base = "";
	for (const complementClass in complements) {
		if (complements[complementClass]) {
			base += " " + complementClass;
		}
	}
	return base;
}
