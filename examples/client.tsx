"use client";

import { useTranslations } from "next-intl";

export const MyComponent = () => {
	const t = useTranslations("MyComponent");
	const t2 = useTranslations("MyComponent.Test");

	const foobar = t("foobar");

	return (
		<div>
			<h1>
				{t("title")}, {t2("foobar.test")}
			</h1>
		</div>
	);
};

// Nested scope
export function MyOtherComponent() {
	const t = useTranslations("MyComponent");

	const content = () => {
		const foobar = t("foodiebar3");
		return (
			<div>
				<h1>{t("title")}</h1>
			</div>
		);
	};
	return content();
}
