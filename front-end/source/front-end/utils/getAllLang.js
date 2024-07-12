async function getAllLang()
{
	const res = await fetch(`${location.origin}/language_file/language.json`);
	const AllLang = await res.json();
	return AllLang;
}

export const lang = await getAllLang();
