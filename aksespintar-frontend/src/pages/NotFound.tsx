import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="state">
      <h1>404</h1>
      <p>Halaman yang kamu cari tidak ada.</p>
      <Link to="/" className="btn btn-primary">
        Kembali ke beranda
      </Link>
    </div>
  );
}
