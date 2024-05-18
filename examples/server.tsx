import { getTranslations } from "next-intl/server";

export const MyComponent = async () => {
	const t = await getTranslations({ namespace: "ProductListing", locale });
	const t2 = await getTranslations({
		namespace: "ProductListing.Second",
		locale,
	});

	const foobar = t("foobar");

	return (
		<div>
			<h1>{t("title")}</h1>
			<div>
				{t2("results", {
					total: products.total,
				})}
			</div>
		</div>
	);
};
