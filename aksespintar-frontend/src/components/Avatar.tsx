import { getPreset, PresetAvatarSvg } from "../avatars";
import type { User } from "../types";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + second).toUpperCase();
}

const SIZES = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 64,
  xl: 120,
} as const;

export type AvatarSize = keyof typeof SIZES;

type AvatarProps = {
  user: Pick<User, "name" | "avatar">;
  size?: AvatarSize;
  className?: string;
};

// Avatar dapat berupa preset SVG, foto unggahan (data URL), atau inisial nama
// bila pengguna belum memilih apa pun.
export function Avatar({ user, size = "md", className }: AvatarProps) {
  const px = SIZES[size];
  const wrapperClass = `avatar avatar-${size}${className ? ` ${className}` : ""}`;
  const style = { width: px, height: px };

  const preset = getPreset(user.avatar);
  if (preset) {
    return (
      <span className={wrapperClass} style={style}>
        <PresetAvatarSvg preset={preset} />
      </span>
    );
  }

  if (user.avatar && user.avatar.startsWith("data:image/")) {
    return (
      <span className={wrapperClass} style={style}>
        <img src={user.avatar} alt={`Foto profil ${user.name}`} />
      </span>
    );
  }

  return (
    <span className={wrapperClass} style={style} aria-label={`Avatar ${user.name}`}>
      <span className="avatar-initials" aria-hidden="true">
        {initials(user.name)}
      </span>
    </span>
  );
}
