/**
 * Recursive type for labels which can be nested objects containing strings
 */
export type LabelData = {
	[key: string]: string | LabelData;
};
