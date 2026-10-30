export type PresetAvatar = {
  id: string;
  label: string;
  stops: [string, string];
  inks: string;
};

// Katalog avatar bawaan. Semua digambar sebagai SVG di browser, jadi ringan
// dan tetap tajam di ukuran berapa pun. Nilai `id` dipakai dengan awalan
// "preset:" dan disimpan apa adanya di kolom avatar pengguna.
export const PRESET_AVATARS: PresetAvatar[] = [
  { id: "ap-1", label: "Buku", stops: ["#7b1e3a", "#b08a4a"], inks: "#fff6e8" },
  { id: "ap-2", label: "Kucing", stops: ["#f3b26b", "#e2703a"], inks: "#3a1f12" },
  { id: "ap-3", label: "Panda", stops: ["#e8edf2", "#b7c2cf"], inks: "#2a2f36" },
  { id: "ap-4", label: "Rubah", stops: ["#f07b3f", "#d94f2b"], inks: "#fff4e8" },
  { id: "ap-5", label: "Koala", stops: ["#c8d0d8", "#8f9aa6"], inks: "#2f3439" },
  { id: "ap-6", label: "Pinguin", stops: ["#3d5a80", "#1f3347"], inks: "#f4f9ff" },
  { id: "ap-7", label: "Katak", stops: ["#7cc576", "#3f8f52"], inks: "#143a22" },
  { id: "ap-8", label: "Gurita", stops: ["#8e6bbf", "#5a3d8a"], inks: "#f3eaff" },
  { id: "ap-9", label: "Roket", stops: ["#2f6fde", "#1b3f8f"], inks: "#eaf2ff" },
  { id: "ap-10", label: "Planet", stops: ["#b08a4a", "#7b1e3a"], inks: "#fff3d6" },
  { id: "ap-11", label: "Bintang", stops: ["#f3c85b", "#d99a2b"], inks: "#4a3208" },
  { id: "ap-12", label: "Bulan", stops: ["#5c6b8a", "#2d3650"], inks: "#f0f4ff" },
  { id: "ap-13", label: "Bunga", stops: ["#f78fb3", "#e0567f"], inks: "#fff3f7" },
  { id: "ap-14", label: "Daun", stops: ["#5cbf9a", "#2c7f63"], inks: "#e9fff6" },
  { id: "ap-15", label: "Api", stops: ["#ff8a3d", "#d6381f"], inks: "#fff2e0" },
  { id: "ap-16", label: "Awan", stops: ["#8fbfe8", "#4b7fb5"], inks: "#f2f9ff" },
  { id: "ap-17", label: "Kopi", stops: ["#a1754e", "#6b4728"], inks: "#fff1e0" },
  { id: "ap-18", label: "Pensil", stops: ["#f2d16b", "#c9a12b"], inks: "#443508" },
  { id: "ap-19", label: "Lampu", stops: ["#6fd3c7", "#2f8f86"], inks: "#effffd" },
  { id: "ap-20", label: "Berlian", stops: ["#9fd3ff", "#4b7fd6"], inks: "#f5faff" },
  { id: "ap-21", label: "Hati", stops: ["#f36b8a", "#c22a4e"], inks: "#fff2f5" },
  { id: "ap-22", label: "Gradien", stops: ["#7b1e3a", "#c9a7d6"], inks: "#ffffff" },
  { id: "ap-23", label: "Senja", stops: ["#ff9a62", "#8e5bb5"], inks: "#fff5ee" },
  { id: "ap-24", label: "Samudra", stops: ["#3fc9b0", "#1f6f9c"], inks: "#f0fffb" },
];

export function getPreset(id: string | null | undefined): PresetAvatar | null {
  if (!id || !id.startsWith("preset:")) return null;
  const key = id.slice("preset:".length);
  return PRESET_AVATARS.find((preset) => preset.id === key) ?? null;
}

function face(): string {
  return `<circle cx="34" cy="36" r="3" fill="currentColor"/><circle cx="66" cy="36" r="3" fill="currentColor"/>`;
}

function smile(): string {
  return `<path d="M38 58q12 12 24 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`;
}

function cat(): string {
  return `<path d="M24 34 20 14l18 12Z" fill="currentColor" opacity=".35"/><path d="M76 34 80 14 62 26Z" fill="currentColor" opacity=".35"/>${face()}${smile()}`;
}

function pandaEars(): string {
  return `<circle cx="26" cy="24" r="13" fill="currentColor" opacity=".35"/><circle cx="74" cy="24" r="13" fill="currentColor" opacity=".35"/>${face()}${smile()}`;
}

function foxEars(): string {
  return `<path d="M28 36 24 12l20 10Z" fill="currentColor" opacity=".4"/><path d="M72 36 76 12 56 22Z" fill="currentColor" opacity=".4"/>${face()}${smile()}`;
}

function penguin(): string {
  return `<ellipse cx="50" cy="52" rx="22" ry="24" fill="currentColor" opacity=".35"/>${face()}<path d="M50 52l-8 6 8 6 8-6Z" fill="currentColor" opacity=".7"/>`;
}

function glasses(): string {
  return `<circle cx="36" cy="38" r="9" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="64" cy="38" r="9" fill="none" stroke="currentColor" stroke-width="4"/><path d="M45 38h10" stroke="currentColor" stroke-width="4"/>${smile()}`;
}

function rocket(): string {
  return `<path d="M50 20 62 44 50 56 38 44Z" fill="currentColor" opacity=".75"/><circle cx="50" cy="38" r="6" fill="currentColor"/><path d="M38 46 30 62l14-6 6-10Z" fill="currentColor" opacity=".5"/><path d="M62 46 70 62l-14-6-6-10Z" fill="currentColor" opacity=".5"/>`;
}

function planet(): string {
  return `<circle cx="50" cy="48" r="20" fill="currentColor" opacity=".55"/><ellipse cx="50" cy="50" rx="34" ry="9" fill="none" stroke="currentColor" stroke-width="4" opacity=".8" transform="rotate(-18 50 50)"/>`;
}

function star(): string {
  return `<path d="m50 22 8 17 19 2-14 13 4 19-17-9-17 9 4-19L23 41l19-2Z" fill="currentColor" opacity=".7"/>`;
}

function moon(): string {
  return `<path d="M62 24a26 26 0 1 0 0 48 20 20 0 1 1 0-48Z" fill="currentColor" opacity=".8"/>`;
}

function flower(): string {
  return `<circle cx="50" cy="50" r="11" fill="currentColor" opacity=".9"/><circle cx="50" cy="27" r="12" fill="currentColor" opacity=".55"/><circle cx="73" cy="50" r="12" fill="currentColor" opacity=".55"/><circle cx="50" cy="73" r="12" fill="currentColor" opacity=".55"/><circle cx="27" cy="50" r="12" fill="currentColor" opacity=".55"/>`;
}

function leaf(): string {
  return `<path d="M28 74C28 44 48 24 76 24c0 28-20 50-48 50Z" fill="currentColor" opacity=".55"/><path d="M30 72 64 38" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`;
}

function flame(): string {
  return `<path d="M50 20c12 14 6 22 16 30 8 6 6 20-4 26-10 6-24 0-26-12-2-10 8-16 8-26 2-8 2-14 6-18Z" fill="currentColor" opacity=".6"/>`;
}

function cloud(): string {
  return `<path d="M32 62a12 12 0 0 1-2-24 16 16 0 0 1 30-6 14 14 0 0 1 16 14 11 11 0 0 1-2 22Z" fill="currentColor" opacity=".7"/>`;
}

function coffee(): string {
  return `<path d="M30 38h34v18a12 12 0 0 1-12 12H42a12 12 0 0 1-12-12Z" fill="currentColor" opacity=".55"/><path d="M64 42h6a8 8 0 0 1 0 16h-6" fill="none" stroke="currentColor" stroke-width="4"/><path d="M42 30q-4-6 0-12M52 30q-4-6 0-12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
}

function pencil(): string {
  return `<path d="M32 70l6-18 30-30 12 12-30 30Z" fill="currentColor" opacity=".55"/><path d="M32 70l6-18 8 8Z" fill="currentColor"/><path d="M64 26l10-2-2 10Z" fill="currentColor" opacity=".8"/>`;
}

function bulb(): string {
  return `<circle cx="50" cy="40" r="17" fill="currentColor" opacity=".55"/><rect x="42" y="58" width="16" height="8" rx="2" fill="currentColor"/><path d="M45 70h10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M50 44v10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`;
}

function diamond(): string {
  return `<path d="m50 24 22 14-22 32-22-32Z" fill="currentColor" opacity=".55"/><path d="M28 38h44M50 24v46" stroke="currentColor" stroke-width="3" opacity=".6"/>`;
}

function heart(): string {
  return `<path d="M50 72C34 60 24 50 24 40a13 13 0 0 1 26-5 13 13 0 0 1 26 5c0 10-10 20-26 32Z" fill="currentColor" opacity=".65"/>`;
}

function sparkle(): string {
  return `<path d="m50 22 7 18 18 7-18 7-7 18-7-18-18-7 18-7Z" fill="currentColor" opacity=".75"/><circle cx="26" cy="30" r="4" fill="currentColor" opacity=".6"/><circle cx="74" cy="68" r="5" fill="currentColor" opacity=".6"/>`;
}

const SHAPES: Record<string, string> = {
  "ap-1": `${face()}${smile()}<path d="M26 30h20V24H26ZM54 30h20V24H54Z" fill="currentColor" opacity=".3"/><path d="M50 24v4" stroke="currentColor" stroke-width="3"/>`,
  "ap-2": cat(),
  "ap-3": pandaEars(),
  "ap-4": foxEars(),
  "ap-5": `${cat()}<circle cx="34" cy="42" r="8" fill="currentColor" opacity=".25"/><circle cx="66" cy="42" r="8" fill="currentColor" opacity=".25"/>`,
  "ap-6": penguin(),
  "ap-7": `${face()}${smile()}<circle cx="32" cy="30" r="5" fill="currentColor" opacity=".4"/>`,
  "ap-8": `${glasses()}<path d="M30 72q-8 10-4 4M42 74v6M50 74v8M58 74v6M70 72q8 10 4 4" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity=".7"/>`,
  "ap-9": rocket(),
  "ap-10": planet(),
  "ap-11": star(),
  "ap-12": moon(),
  "ap-13": flower(),
  "ap-14": leaf(),
  "ap-15": flame(),
  "ap-16": cloud(),
  "ap-17": coffee(),
  "ap-18": pencil(),
  "ap-19": bulb(),
  "ap-20": diamond(),
  "ap-21": heart(),
  "ap-22": sparkle(),
  "ap-23": `${face()}${smile()}<circle cx="50" cy="76" r="6" fill="currentColor" opacity=".4"/>`,
  "ap-24": `${cat()}${smile()}`,
};

export function PresetAvatarSvg({ preset }: { preset: PresetAvatar }) {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={`Avatar ${preset.label}`}>
      <defs>
        <linearGradient id={`grad-${preset.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={preset.stops[0]} />
          <stop offset="1" stopColor={preset.stops[1]} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill={`url(#grad-${preset.id})`} />
      <g style={{ color: preset.inks }}>{SHAPES[preset.id] ?? SHAPES["ap-22"]}</g>
    </svg>
  );
}
