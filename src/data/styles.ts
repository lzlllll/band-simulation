import type { StyleProficiency } from "../types";

export const INITIAL_STYLES: StyleProficiency[] = [
  { style: "摇滚", level: 65, color: "#E8A33D" },
  { style: "朋克", level: 48, color: "#C5303A" },
  { style: "独立", level: 72, color: "#7BA05B" },
  { style: "电子", level: 40, color: "#6B8FB8" },
  { style: "民谣", level: 55, color: "#B88A6B" },
];

export const STYLE_LIST = INITIAL_STYLES.map((s) => s.style);
