import { Request } from "express";

// Netlify Functions menaruh IP pengunjung di x-nf-client-connection-ip,
// sedangkan proxy lain memakai x-forwarded-for. Keduanya dibaca lebih dulu.
export function getClientIp(req: Request): string | null {
  const header = (name: string) => {
    const value = req.headers[name];
    return Array.isArray(value) ? value[0] : value;
  };

  const forwarded = header("x-forwarded-for");
  const candidate =
    header("x-nf-client-connection-ip") ??
    (forwarded ? forwarded.split(",")[0]?.trim() : undefined) ??
    req.ip ??
    req.socket.remoteAddress;

  if (!candidate) return null;
  return candidate.replace(/^::ffff:/, "").slice(0, 64);
}

export function getClientUserAgent(req: Request): string | null {
  const value = req.headers["user-agent"];
  const ua = Array.isArray(value) ? value[0] : value;
  if (!ua) return null;
  return ua.slice(0, 255);
}
