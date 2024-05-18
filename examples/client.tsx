"use client";

import { useTranslations } from "next-intl";


export const MyComponent = () => {
	const t = useTranslations("MyComponent");

	const foobar = t("foobar");

	return (
		<div>
			<h1>{t("title")}</h1>
		</div>
	)
}

// Nested scope
export function MyOtherComponent = () => {
	const t = useTranslations("MyComponent");

	const content () => {
		const foobar = t("foodiebar");
		return (
			<div>
				<h1>{t("title")}</h1>
			</div>
		)
	}
	return content()
}
