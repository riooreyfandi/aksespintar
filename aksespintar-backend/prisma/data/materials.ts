import { advancedMaterials, toolMaterials } from "./materials-extra";

export type SeedDifficulty = "beginner" | "intermediate" | "advanced";

export type CategorySeed = {
  name: string;
  slug: string;
  description: string;
};

export type MaterialSeed = {
  categorySlug: string;
  title: string;
  slug: string;
  summary: string;
  difficulty: SeedDifficulty;
  estimatedMinutes: number;
  content: string;
};

// Blok kode ditulis di antara ``` sehingga bisa ditampilkan sebagai blok monospace.
const code = (lang: string, body: string) => ["```" + lang, body.trim(), "```"].join("\n");

// Setiap argumen menjadi satu paragraf; baris baru di dalam satu argumen dipertahankan.
const doc = (...blocks: string[]) => blocks.join("\n\n");

export const categories: CategorySeed[] = [
  { name: "HTML dan CSS", slug: "html-css", description: "Membuat struktur dan menata tampilan halaman web." },
  { name: "Python", slug: "python", description: "Bahasa serbaguna untuk pemula, analisis data, dan otomasi." },
  { name: "JavaScript", slug: "javascript", description: "Bahasa web interaktif, juga berjalan di server lewat Node.js." },
  { name: "C++", slug: "cpp", description: "Bahasa terkompilasi untuk program yang cepat dan efisien." },
  { name: "SQL", slug: "sql", description: "Bahasa untuk mengambil dan mengolah data di basis data relasional." },
  { name: "Matematika Diskrit", slug: "matematika-diskrit", description: "Logika, himpunan, kombinatorika, relasi, dan graf." },
  { name: "Aljabar Linier", slug: "aljabar-linier", description: "Vektor, matriks, sistem persamaan linier, dan nilai eigen." },
  { name: "Fisika Dasar", slug: "fisika-dasar", description: "Gerak, gaya, energi, momentum, fluida, dan listrik dasar." },
  { name: "Alat Pengembangan", slug: "alat-dev", description: "Editor kode, format data, dan pengendali versi yang dipakai sehari-hari." },
];

// Kategori lama yang tidak lagi dipakai dan tidak punya isi akan dibersihkan saat seeding.
export const legacyCategorySlugs = ["matematika", "dasar-pemrograman"];

export const materials: MaterialSeed[] = [
  {
    categorySlug: "python",
    title: "Python Dasar: Variabel, Kontrol, Fungsi, dan Struktur Data",
    slug: "python-dasar",
    summary: "Mulai Python dari nol: tipe data, percabangan, perulangan, fungsi, list, dan dict lengkap dengan contoh.",
    difficulty: "beginner",
    estimatedMinutes: 25,
    content: doc(
      "Python adalah bahasa pemrograman tingkat tinggi yang dibuat oleh Guido van Rossum dan dirilis pertama kali pada 1991. Python dirancang agar mudah dibaca: blok kode ditandai dengan indentasi, bukan kurung kurawal. Sintaksnya ringkas sehingga sering dipakai sebagai bahasa pertama untuk belajar pemrograman, lalu berkembang ke analisis data, kecerdasan buatan, pengembangan web (Django, Flask), dan otomasi pekerjaan sehari-hari.",
      "Python adalah bahasa interpreted: kode dijalankan oleh interpreter baris per baris, jadi tidak perlu kompilasi manual. Python juga dynamically typed, artinya tipe data ditentukan saat program berjalan dan tidak wajib dituliskan di depan variabel.",
      "Contoh 1 — variabel dan tipe data dasar:",
      code(
        "python",
        `
nama = "Rani"
umur = 17
tinggi = 158.5
sudah_lulus = False

print(f"Halo, {nama}. Umurmu {umur} tahun.")
print(type(umur), type(tinggi), type(sudah_lulus))
`,
      ),
      "Tipe data yang paling sering dipakai: int (bilangan bulat), float (bilangan desimal), str (teks), bool (True/False), list (daftar yang bisa diubah), tuple (daftar tetap), dict (pasangan kunci-nilai), dan set (kumpulan nilai unik).",
      "Contoh 2 — percabangan dengan if, elif, dan else. Perhatikan titik dua dan indentasi empat spasi yang harus konsisten.",
      code(
        "python",
        `
nilai = 82

if nilai >= 85:
    predikat = "A"
elif nilai >= 70:
    predikat = "B"
else:
    predikat = "C"

print(predikat)  # B
`,
      ),
      "Contoh 3 — perulangan. for dipakai untuk menelusuri urutan, while dipakai untuk mengulang selama kondisi masih benar.",
      code(
        "python",
        `
for i in range(1, 6):
    print("Baris", i)

total = 0
angka = 1
while angka <= 10:
    total += angka
    angka += 1

print("Jumlah 1 sampai 10:", total)
`,
      ),
      "Contoh 4 — fungsi dengan nilai bawaan (default parameter). Fungsi membuat kode bisa dipakai berulang tanpa menyalin logika.",
      code(
        "python",
        `
def rata_rata(daftar_nilai, pembulatan=2):
    """Kembalikan rata-rata dari sebuah daftar nilai."""
    if not daftar_nilai:
        return 0
    hasil = sum(daftar_nilai) / len(daftar_nilai)
    return round(hasil, pembulatan)

print(rata_rata([80, 90, 75]))      # 81.67
print(rata_rata([80, 90, 75], 0))   # 82.0
`,
      ),
      "Contoh 5 — list dan dict. List menyimpan data berurutan, dict menyimpan data berlabel sehingga lebih mudah dibaca.",
      code(
        "python",
        `
siswa = {
    "nama": "Budi",
    "nilai": [80, 85, 90],
}

siswa["nilai"].append(95)
rata = sum(siswa["nilai"]) / len(siswa["nilai"])

print(siswa["nama"], "mendapat rata-rata", rata)
`,
      ),
      "Poin Penting:",
      `1. Indentasi adalah bagian dari sintaks. Mencampur tab dan spasi memicu IndentationError.
2. Gunakan snake_case untuk variabel dan fungsi, serta PascalCase untuk nama kelas.
3. List bersifat mutable, tuple immutable. Pakai tuple untuk data yang tidak boleh berubah.
4. Jangan memakai nama bawaan seperti list, dict, atau sum sebagai nama variabel.
5. Buka file dengan with open(...) agar file otomatis tertutup walau terjadi error.
6. Tangani kegagalan dengan try/except, jangan biarkan program berhenti mendadak.
7. Pisahkan dependensi tiap proyek dengan virtual environment (python -m venv .venv).`,
      "Kesalahan yang sering terjadi pada pemula:",
      `1. Lupa menulis titik dua setelah if, for, def, atau else.
2. Memakai = (penugasan) padahal maksudnya == (perbandingan).
3. Mengubah list saat sedang diiterasi sehingga ada item yang terlewat.
4. Memakai list atau dict sebagai nilai default parameter. Nilai default hanya dibuat sekali, sehingga perubahan dari pemanggilan sebelumnya ikut terbawa.
5. Membandingkan float dengan == tanpa toleransi, misalnya 0.1 + 0.2 == 0.3 bernilai False.`,
      "Latihan: buat fungsi yang menerima daftar nilai, mengembalikan predikat A/B/C, lalu mencetak semua nilai yang berada di atas rata-rata. Setelah itu tambahkan penanganan error ketika daftar kosong.",
    ),
  },
  {
    categorySlug: "javascript",
    title: "JavaScript Dasar: Variabel, Fungsi, DOM, dan Async",
    slug: "javascript-dasar",
    summary: "Dasar JavaScript modern: let/const, arrow function, array method, manipulasi DOM, dan fetch async/await.",
    difficulty: "beginner",
    estimatedMinutes: 25,
    content: doc(
      "JavaScript adalah bahasa pemrograman yang berjalan di dalam browser dan menjadi satu-satunya bahasa yang dipahami browser secara langsung untuk membuat halaman interaktif. Berkat Node.js, JavaScript juga dipakai di sisi server, sehingga satu bahasa bisa dipakai untuk frontend maupun backend.",
      "JavaScript bersifat single-threaded namun non-blocking. Operasi lambat seperti permintaan jaringan tidak menghentikan program karena diselesaikan lewat event loop: tugas yang menunggu diletakkan di antrean, lalu dijalankan ketika tumpukan pemanggilan kosong.",
      "Contoh 1 — variabel dan fungsi. Gunakan const untuk nilai yang tidak diganti dan let untuk nilai yang berubah. Hindari var karena cakupannya membingungkan.",
      code(
        "javascript",
        `
const nama = "Sari";
let skor = 0;

function tambahPoin(nilai) {
  skor = skor + nilai;
  return skor;
}

console.log(nama + " punya " + tambahPoin(10) + " poin");
`,
      ),
      "Tipe data utama: number, string, boolean, null, undefined, object, dan array. Operator typeof membantu memeriksa tipe saat proses debugging.",
      "Contoh 2 — arrow function dan array method. filter menyaring, map mengubah tiap elemen, reduce menggabungkan seluruh elemen menjadi satu nilai.",
      code(
        "javascript",
        `
const nilai = [80, 92, 67, 75];

const lulus = nilai.filter((n) => n >= 75);
const dibulatkan = nilai.map((n) => Math.round(n / 10) * 10);
const total = nilai.reduce((jumlah, n) => jumlah + n, 0);

console.log(lulus);                 // [80, 92, 75]
console.log(dibulatkan);            // [80, 90, 70, 80]
console.log(total / nilai.length);  // 78.5
`,
      ),
      "Contoh 3 — object dan destructuring. Destructuring mempersingkat pengambilan properti menjadi variabel terpisah.",
      code(
        "javascript",
        `
const materi = { judul: "JavaScript", level: "pemula", durasi: 20 };
const { judul, durasi } = materi;

console.log(judul + " butuh " + durasi + " menit");
`,
      ),
      "Contoh 4 — memanipulasi DOM. Ambil elemen dengan querySelector, lalu pasang pendengar kejadian dengan addEventListener.",
      code(
        "javascript",
        `
const tombol = document.querySelector("#simpan");
const status = document.querySelector("#status");

tombol.addEventListener("click", () => {
  status.textContent = "Tersimpan!";
});
`,
      ),
      "Contoh 5 — mengambil data dari API dengan async/await. Selalu periksa res.ok karena fetch tidak melempar error untuk status 4xx atau 5xx.",
      code(
        "javascript",
        `
async function ambilMateri() {
  try {
    const res = await fetch("/api/v1/materials");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    return data.items;
  } catch (err) {
    console.error("Gagal memuat materi:", err.message);
    return [];
  }
}
`,
      ),
      "Poin Penting:",
      `1. Selalu pakai === dan !== agar tidak terjadi konversi tipe otomatis yang mengejutkan.
2. const mencegah penugasan ulang variabel, bukan mencegah perubahan isi object atau array.
3. Arrow function tidak punya this sendiri. Untuk method objek, gunakan function biasa.
4. Fungsi yang mengubah data di luar dirinya disebut memiliki efek samping. Usahakan membuat fungsi murni.
5. await hanya boleh dipakai di dalam fungsi async (atau top-level module).
6. JSON.parse dan JSON.stringify dipakai untuk mengubah string menjadi object dan sebaliknya.
7. Perhitungan desimal bisa tidak presisi: 0.1 + 0.2 menghasilkan 0.30000000000000004.`,
      "Kesalahan yang sering terjadi:",
      `1. Memakai == sehingga "0" == 0 bernilai true.
2. Lupa await sehingga yang dipakai adalah Promise, bukan hasil akhirnya.
3. Mengubah array asli tanpa sadar dengan sort atau splice.
4. Mengakses properti dari nilai null atau undefined lalu mendapat TypeError.
5. Memakai var di dalam loop dengan callback sehingga nilainya sudah berubah saat callback berjalan.`,
      "Latihan: buat daftar materi, saring hanya yang tingkatnya pemula, urutkan berdasarkan durasi, lalu tampilkan ke halaman dengan membuat elemen DOM melalui document.createElement.",
    ),
  },
  {
    categorySlug: "html-css",
    title: "CSS Dasar: Selector, Box Model, Flexbox, Grid, dan Responsif",
    slug: "css-dasar",
    summary: "Menata halaman web dengan CSS: selector, box model, flexbox, grid, variabel, dan media query.",
    difficulty: "beginner",
    estimatedMinutes: 22,
    content: doc(
      "CSS (Cascading Style Sheets) mengatur tampilan halaman web: warna, ukuran, jarak, tata letak, dan animasi. HTML menyediakan struktur, sedangkan CSS menentukan bagaimana struktur itu terlihat. Karena sifatnya cascading, aturan yang lebih spesifik atau ditulis lebih akhir akan menimpa aturan sebelumnya.",
      "Selector menentukan elemen mana yang diberi gaya. Selector tag menargetkan semua elemen sejenis, titik untuk class, pagar untuk id, dan tanda kurung siku untuk atribut.",
      code(
        "css",
        `
p { color: #333; }

.card { padding: 1rem; }

#utama { max-width: 720px; }

input[type="email"] { border-color: #7b1e3a; }
`,
      ),
      "Box model adalah inti tata letak CSS. Setiap elemen terdiri dari content, padding, border, dan margin. Dengan box-sizing: border-box, lebar elemen sudah mencakup padding dan border sehingga perhitungan lebih mudah.",
      code(
        "css",
        `
* {
  box-sizing: border-box;
}

.card {
  width: 320px;
  padding: 1.25rem;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  margin-bottom: 1rem;
  background: #ffffff;
}
`,
      ),
      "Flexbox cocok untuk menyusun elemen dalam satu baris atau satu kolom, misalnya navigasi dan tombol. Properti utama: display, justify-content untuk sumbu utama, align-items untuk sumbu silang, dan gap untuk jarak antar item.",
      code(
        "css",
        `
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
`,
      ),
      "Grid cocok untuk tata letak dua dimensi. Pola repeat(auto-fit, minmax(...)) membuat jumlah kolom menyesuaikan lebar layar tanpa media query tambahan.",
      code(
        "css",
        `
.material-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}
`,
      ),
      "Variabel CSS membuat nilai warna dan jarak bisa dipakai ulang. Variabel juga memudahkan penerapan mode gelap: cukup ganti nilai variabel pada selector yang berbeda.",
      code(
        "css",
        `
:root {
  --brand: #7b1e3a;
  --space: 1rem;
  --bg: #ffffff;
  --text: #241318;
}

[data-theme="dark"] {
  --bg: #100b0e;
  --text: #f6edf0;
}

body {
  background: var(--bg);
  color: var(--text);
}
`,
      ),
      "Media query menyesuaikan tampilan berdasarkan ukuran layar. Pendekatan mobile first menulis gaya dasar untuk layar kecil, lalu menambahkan aturan untuk layar lebar.",
      code(
        "css",
        `
@media (max-width: 600px) {
  .navbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .material-grid {
    grid-template-columns: 1fr;
  }
}
`,
      ),
      "Poin Penting:",
      `1. Urutan kekuatan selector: gaya inline, id, class, lalu tag. Hindari !important karena membuat aturan sulit ditimpa.
2. Gunakan satuan rem untuk teks dan jarak agar menghormati pengaturan ukuran font pengguna.
3. Jangan menentukan tinggi tetap pada elemen berisi teks panjang; biarkan konten menentukan tinggi.
4. Pastikan kontras warna teks dan latar memadai agar tetap terbaca, termasuk bagi pengguna low vision.
5. Beri outline atau gaya focus-visible pada elemen interaktif agar bisa dipakai dengan keyboard.
6. Susun class secara semantik, misalnya .material-card, bukan .kotak-merah-besar.
7. Uji tampilan pada lebar 360px, 768px, dan 1280px sebelum dianggap selesai.`,
      "Kesalahan yang sering terjadi:",
      `1. Lupa box-sizing: border-box sehingga lebar elemen melebar melebihi perkiraan.
2. Memakai margin untuk merapikan tata letak padahal flex atau grid lebih tepat.
3. Menimpa gaya dengan !important berulang kali hingga sulit dilacak.
4. Menentukan ukuran font dalam piksel sehingga tidak ikut membesar saat pengguna memperbesar teks.
5. Menyembunyikan konten dengan display: none padahal masih dibutuhkan pembaca layar; gunakan visually-hidden jika hanya ingin menyembunyikan secara visual.`,
      "Latihan: buat kartu materi berisi judul, ringkasan, dan badge tingkat kesulitan. Susun tiga kartu sejajar dengan grid, lalu ubah menjadi satu kolom ketika lebar layar di bawah 600px.",
    ),
  },
  {
    categorySlug: "cpp",
    title: "C++ Dasar: Struktur Program, Tipe Data, Fungsi, dan Memori",
    slug: "cpp-dasar",
    summary: "Belajar C++ dari struktur program, input/output, vector, fungsi dengan reference, sampai pointer dan memory.",
    difficulty: "intermediate",
    estimatedMinutes: 30,
    content: doc(
      "C++ adalah bahasa pemrograman terkompilasi yang dikembangkan dari C oleh Bjarne Stroustrup. Kode C++ diubah menjadi kode mesin oleh compiler sebelum dijalankan, sehingga hasilnya cepat dan efisien. C++ banyak dipakai untuk game engine, sistem operasi, aplikasi desktop, perangkat keras tertanam, dan olimpiade informatika.",
      "C++ bersifat statically typed: tipe setiap variabel diketahui saat kompilasi. Kesalahan tipe yang tidak sengaja akan tertangkap lebih awal, tetapi penulisan kode menjadi lebih ketat dibanding Python atau JavaScript.",
      "Contoh 1 — struktur program, input, dan output. Setiap program C++ memiliki fungsi main yang menjadi titik awal eksekusi.",
      code(
        "cpp",
        `
#include <iostream>
#include <string>

int main() {
    std::string nama;
    std::cout << "Nama kamu: ";
    std::cin >> nama;
    std::cout << "Halo, " << nama << "!\\n";
    return 0;
}
`,
      ),
      "Contoh 2 — vector dan perulangan. std::vector adalah array dinamis yang ukurannya bisa bertambah, jauh lebih aman daripada array gaya C.",
      code(
        "cpp",
        `
#include <iostream>
#include <vector>

int main() {
    std::vector<int> nilai = {80, 90, 75};
    int total = 0;

    for (int n : nilai) {
        total += n;
    }

    double rata = static_cast<double>(total) / nilai.size();
    std::cout << "Rata-rata: " << rata << "\\n";
    return 0;
}
`,
      ),
      "Contoh 3 — fungsi dengan parameter reference. Tanda & membuat fungsi menerima variabel asli, sehingga perubahan di dalam fungsi ikut mengubah nilai di pemanggil.",
      code(
        "cpp",
        `
#include <iostream>

void tambah(int& nilai, int delta) {
    nilai += delta;
}

int main() {
    int skor = 10;
    tambah(skor, 5);
    std::cout << skor << "\\n"; // 15
    return 0;
}
`,
      ),
      "Contoh 4 — pointer. Pointer menyimpan alamat memori. Operator & mengambil alamat, sedangkan * mengakses nilai pada alamat tersebut. Pointer adalah sumber bug yang serius, jadi gunakan reference bila memungkinkan.",
      code(
        "cpp",
        `
#include <iostream>

int main() {
    int x = 10;
    int* p = &x;
    *p = 20;
    std::cout << x << "\\n"; // 20
    return 0;
}
`,
      ),
      "Contoh 5 — vector of struct untuk menyimpan data berlabel, pola yang sering dipakai untuk daftar siswa atau barang.",
      code(
        "cpp",
        `
#include <iostream>
#include <string>
#include <vector>

struct Siswa {
    std::string nama;
    int nilai;
};

int main() {
    std::vector<Siswa> daftar = {
        {"Budi", 85},
        {"Sari", 92},
    };

    for (const Siswa& s : daftar) {
        std::cout << s.nama << ": " << s.nilai << "\\n";
    }

    return 0;
}
`,
      ),
      "Poin Penting:",
      `1. Kompilasi dengan standar modern, misalnya g++ -std=c++17 -Wall -Wextra main.cpp -o main.
2. Akhiri setiap pernyataan dengan titik koma, dan ingat bahwa indeks vector dimulai dari 0.
3. Pembagian dua bilangan bulat menghasilkan bilangan bulat. Gunakan static_cast<double> agar hasilnya desimal.
4. std::vector lebih aman daripada array mentah karena ukurannya diketahui dan bisa bertambah.
5. Gunakan reference const (const T&) untuk parameter besar yang tidak diubah agar tidak menyalin data.
6. Hindari new dan delete manual. Manfaatkan RAII: objek mengelola sumber dayanya sendiri, misalnya std::vector dan std::string.
7. Perilaku undefined (misalnya membaca elemen di luar batas) tidak selalu error saat dijalankan, tetapi hasilnya tidak bisa dipercaya.`,
      "Kesalahan yang sering terjadi:",
      `1. Lupa titik koma atau salah menutup kurung kurawal.
2. Mengakses vector di luar batas dengan operator [] tanpa pemeriksaan; gunakan at() saat ingin validasi.
3. Memakai variabel yang belum diinisialisasi sehingga nilainya acak.
4. Mengira sizeof(vector) adalah jumlah elemen; yang benar adalah vector.size().
5. Mengembalikan pointer ke variabel lokal yang sudah tidak berlaku setelah fungsi selesai.`,
      "Latihan: buat program yang membaca jumlah siswa, menyimpan nama dan nilainya dalam vector of struct, lalu mencetak rata-rata kelas serta nama siswa dengan nilai tertinggi.",
    ),
  },
  {
    categorySlug: "sql",
    title: "SQL Dasar: SELECT, JOIN, Agregasi, dan Perubahan Data",
    slug: "sql-dasar",
    summary: "Menguasai query SQL: filter, urutkan, gabung tabel, agregasi, serta INSERT, UPDATE, dan DELETE dengan aman.",
    difficulty: "beginner",
    estimatedMinutes: 24,
    content: doc(
      "SQL (Structured Query Language) adalah bahasa standar untuk mengelola data pada basis data relasional seperti PostgreSQL, MySQL, dan SQLite. Data disimpan dalam tabel yang terdiri atas baris (record) dan kolom (field). Setiap tabel biasanya memiliki primary key, dan hubungan antar tabel dijaga dengan foreign key.",
      "Contoh 1 — mengambil data dengan SELECT. WHERE menyaring baris, ORDER BY mengurutkan, dan LIMIT membatasi jumlah hasil.",
      code(
        "sql",
        `
SELECT title, difficulty, published_at
FROM learning_materials
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 10;
`,
      ),
      "Contoh 2 — pencarian teks. ILIKE pada PostgreSQL melakukan pencocokan tanpa membedakan huruf besar dan kecil, sedangkan % adalah wildcard.",
      code(
        "sql",
        `
SELECT title, summary
FROM learning_materials
WHERE status = 'published'
  AND (title ILIKE '%html%' OR summary ILIKE '%html%')
ORDER BY title;
`,
      ),
      "Contoh 3 — JOIN. JOIN menggabungkan baris dari dua tabel berdasarkan kolom penghubung. LEFT JOIN tetap menampilkan tabel kiri walau tidak ada pasangannya di tabel kanan.",
      code(
        "sql",
        `
SELECT m.title, c.name AS kategori, u.name AS penulis
FROM learning_materials m
JOIN categories c ON c.id = m.category_id
JOIN users u ON u.id = m.author_id
WHERE m.status = 'published'
ORDER BY m.published_at DESC;
`,
      ),
      "Contoh 4 — agregasi dengan GROUP BY dan HAVING. WHERE menyaring baris sebelum dikelompokkan, sedangkan HAVING menyaring setelah agregasi dihitung.",
      code(
        "sql",
        `
SELECT c.name AS kategori, COUNT(m.id) AS jumlah_materi
FROM categories c
LEFT JOIN learning_materials m
  ON m.category_id = c.id AND m.status = 'published'
GROUP BY c.id, c.name
HAVING COUNT(m.id) > 0
ORDER BY jumlah_materi DESC;
`,
      ),
      "Contoh 5 — mengubah data. INSERT menambah baris, UPDATE mengubah baris yang sudah ada, dan DELETE menghapus baris. Selalu tulis WHERE dengan hati-hati; tanpa WHERE, seluruh isi tabel ikut terpengaruh.",
      code(
        "sql",
        `
INSERT INTO categories (id, name, slug, description)
VALUES (gen_random_uuid(), 'Go', 'go', 'Bahasa sederhana untuk layanan jaringan.');

UPDATE learning_materials
SET status = 'published', published_at = NOW()
WHERE slug = 'pengenalan-html';

DELETE FROM learning_materials
WHERE slug = 'draf-lama' AND status = 'draft';
`,
      ),
      "Poin Penting:",
      `1. Selalu gunakan query berparameter (prepared statement) ketika nilai berasal dari input pengguna untuk mencegah SQL injection.
2. NULL bukan nilai kosong, melainkan ketiadaan nilai. Gunakan IS NULL atau IS NOT NULL, bukan = NULL.
3. Bungkus beberapa perubahan yang saling bergantung dalam transaksi (BEGIN ... COMMIT) agar bisa dibatalkan bersama.
4. Index mempercepat pembacaan kolom yang sering difilter atau diurutkan, tetapi memperlambat penulisan dan menambah ukuran penyimpanan.
5. Normalisasi mengurangi duplikasi data, tetapi denormalisasi kadang diperlukan untuk performa pembacaan.
6. Gunakan EXPLAIN untuk melihat rencana eksekusi ketika query mulai lambat.
7. COUNT(*) menghitung semua baris, sedangkan COUNT(kolom) mengabaikan nilai NULL.`,
      "Kesalahan yang sering terjadi:",
      `1. Menjalankan UPDATE atau DELETE tanpa WHERE sehingga seluruh tabel berubah.
2. Menggabungkan tabel tanpa kondisi JOIN sehingga hasilnya menjadi perkalian baris (kartesian).
3. Membandingkan kolom dengan NULL memakai = sehingga hasilnya selalu kosong.
4. Memakai SELECT * di kode produksi sehingga data yang tidak dibutuhkan ikut terkirim.
5. Menyusun query dengan penggabungan string dari input pengguna sehingga rentan SQL injection.`,
      "Latihan: tulis query untuk menampilkan setiap kategori beserta jumlah materi terbitnya, lalu tampilkan lima materi terbaru beserta nama penulisnya.",
    ),
  },
  {
    categorySlug: "matematika-diskrit",
    title: "Matematika Diskrit: Logika, Himpunan, Kombinatorika, dan Graf",
    slug: "matematika-diskrit",
    summary: "Logika proposisi, himpunan, kombinatorika, relasi, graf, dan induksi matematika lengkap dengan contoh soal dan pembahasan.",
    difficulty: "intermediate",
    estimatedMinutes: 35,
    content: doc(
      "Matematika diskrit mempelajari objek yang terpisah-pisah dan dapat dihitung, seperti bilangan bulat, himpunan, graf, dan barisan. Materi ini menjadi dasar ilmu komputer: analisis algoritma, basis data relasional, kriptografi, dan teori bahasa.",
      "Logika proposisi memakai perangkai dasar: ¬ (negasi), ∧ (dan), ∨ (atau), → (implikasi), dan ↔ (bikondisional). Sebuah proposisi selalu bernilai benar (B) atau salah (S). Implikasi p → q hanya bernilai salah ketika p benar tetapi q salah.",
      "Contoh Soal 1 — Tunjukkan bahwa p → q ekuivalen dengan ¬p ∨ q.",
      "Pembahasan: susun tabel kebenaran untuk kedua bentuk, lalu bandingkan kolom terakhirnya.",
      code(
        "text",
        `
p | q | p -> q | ~p v q
B | B |   B    |   B
B | S |   S    |   S
S | B |   B    |   B
S | S |   B    |   B
`,
      ),
      "Karena kolom p → q dan ¬p ∨ q identik pada semua baris, kedua pernyataan terbukti ekuivalen. Ekuivalensi ini penting saat menyederhanakan kondisi pada program.",
      "Himpunan adalah kumpulan objek berbeda. Operasi utamanya: gabungan (∪), irisan (∩), selisih (\\), dan komplemen. Hukum De Morgan menyatakan (A ∪ B)ᶜ = Aᶜ ∩ Bᶜ dan (A ∩ B)ᶜ = Aᶜ ∪ Bᶜ.",
      "Contoh Soal 2 — Dari 100 mahasiswa, 60 menyukai matematika, 45 menyukai fisika, dan 25 menyukai keduanya. Berapa mahasiswa yang menyukai minimal satu mata kuliah, dan berapa yang tidak menyukai keduanya?",
      `Pembahasan:
|A ∪ B| = |A| + |B| − |A ∩ B| = 60 + 45 − 25 = 80.
Jadi 80 mahasiswa menyukai minimal satu mata kuliah.
Yang tidak menyukai keduanya: 100 − 80 = 20 mahasiswa.`,
      "Kombinatorika membahas cara menghitung banyaknya susunan. Aturan perkalian: jika ada m pilihan lalu n pilihan, totalnya m × n. Permutasi memperhatikan urutan, P(n, r) = n! / (n − r)!. Kombinasi tidak memperhatikan urutan, C(n, r) = n! / (r! (n − r)!).",
      "Contoh Soal 3 — Berapa banyak susunan berbeda dari huruf-huruf kata MATEMATIKA?",
      `Pembahasan:
Kata MATEMATIKA memiliki 10 huruf dengan pengulangan:
M = 2, A = 3, T = 2, E = 1, I = 1, K = 1.
Banyak susunan = 10! / (2! · 3! · 2!)
= 3.628.800 / (2 · 6 · 2)
= 3.628.800 / 24
= 151.200 susunan.`,
      "Contoh Soal 4 — Dari 8 siswa akan dipilih 3 untuk mewakili kelas. Berapa banyak cara memilih jika urutan tidak diperhatikan?",
      `Pembahasan:
Karena urutan tidak diperhatikan, gunakan kombinasi.
C(8, 3) = 8! / (3! · 5!) = (8 · 7 · 6) / (3 · 2 · 1) = 336 / 6 = 56 cara.`,
      "Relasi menghubungkan anggota dua himpunan. Relasi pada himpunan disebut refleksif jika setiap anggota berelasi dengan dirinya, simetris jika aRb berakibat bRa, dan transitif jika aRb serta bRc berakibat aRc. Relasi yang memenuhi ketiganya adalah relasi ekuivalen.",
      "Graf terdiri atas simpul (vertex) dan sisi (edge). Lemma jabat tangan menyatakan jumlah derajat semua simpul sama dengan dua kali jumlah sisi: Σdeg(v) = 2|E|. Akibatnya, jumlah simpul berderajat ganjil selalu genap.",
      "Contoh Soal 5 — Sebuah graf memiliki 5 simpul dengan derajat 3, 3, 2, 2, dan 2. Berapa jumlah sisinya?",
      `Pembahasan:
Σdeg(v) = 3 + 3 + 2 + 2 + 2 = 12.
Karena Σdeg(v) = 2|E|, maka |E| = 12 / 2 = 6 sisi.`,
      "Pohon adalah graf terhubung tanpa siklus. Setiap pohon dengan n simpul selalu memiliki tepat n − 1 sisi. Struktur ini dipakai pada struktur data tree, pohon keputusan, dan algoritma pencarian.",
      "Induksi matematika dipakai untuk membuktikan pernyataan yang berlaku untuk semua bilangan asli. Ada tiga langkah: basis (buktikan untuk n terkecil), hipotesis (anggap benar untuk n = k), dan langkah induktif (buktikan benar untuk n = k + 1).",
      "Contoh Soal 6 — Buktikan bahwa 1 + 2 + ... + n = n(n + 1) / 2 untuk setiap n ≥ 1.",
      `Pembahasan:
Basis: untuk n = 1, ruas kiri = 1 dan ruas kanan = 1 · 2 / 2 = 1. Benar.
Hipotesis: anggap benar untuk n = k, yaitu 1 + 2 + ... + k = k(k + 1) / 2.
Langkah induktif: untuk n = k + 1,
1 + 2 + ... + k + (k + 1)
= k(k + 1)/2 + (k + 1)
= (k + 1)(k + 2)/2.
Bentuk terakhir sama dengan rumus untuk n = k + 1. Terbukti.`,
      "Poin Penting:",
      `1. Implikasi p → q hanya salah saat p benar dan q salah. Jangan tertukar dengan q → p.
2. Gunakan prinsip inklusi-eksklusi saat menghitung gabungan himpunan yang saling beririsan.
3. Permutasi dipakai ketika urutan penting, kombinasi ketika urutan tidak penting.
4. Untuk objek berulang, bagi faktorial total dengan faktorial banyaknya pengulangan.
5. Lemma jabat tangan adalah cara cepat memeriksa apakah derajat sebuah graf masuk akal.
6. Induksi bukan sekadar contoh; basis dan langkah induktif wajib ditulis lengkap.
7. Periksa hasil dengan kasus kecil untuk memastikan rumus tidak tertukar.`,
      "Latihan: buktikan dengan induksi bahwa 2 + 4 + 6 + ... + 2n = n(n + 1), lalu hitung banyak cara memilih ketua dan wakil ketua dari 10 siswa (petunjuk: urutan jabatan diperhatikan).",
    ),
  },
  {
    categorySlug: "aljabar-linier",
    title: "Aljabar Linier: Vektor, Matriks, Determinan, SPL, dan Eigen",
    slug: "aljabar-linier",
    summary: "Operasi matriks, determinan, invers, penyelesaian sistem persamaan linier, rank, dan nilai eigen dengan contoh soal.",
    difficulty: "intermediate",
    estimatedMinutes: 35,
    content: doc(
      "Aljabar linier mempelajari vektor, matriks, dan transformasi linier. Materi ini menjadi fondasi grafik komputer, pembelajaran mesin, analisis data, dan penyelesaian sistem persamaan. Ide utamanya sederhana: banyak masalah rumit bisa ditulis sebagai kombinasi linier dari beberapa vektor.",
      "Vektor adalah besaran yang memiliki arah dan besar, ditulis sebagai pasangan atau tripel bilangan. Operasi dasar: penjumlahan, perkalian dengan skalar, dan perkalian titik (dot product) yang menghasilkan skalar.",
      code(
        "text",
        `
u = (2, 3), v = (4, -1)
u + v = (6, 2)
3u = (6, 9)
u · v = 2(4) + 3(-1) = 5
|u| = akar(2^2 + 3^2) = akar(13) = 3,61
`,
      ),
      "Matriks adalah susunan bilangan dalam baris dan kolom. Penjumlahan dilakukan antarelemen yang seposisi. Perkalian matriks A (m × n) dengan B (n × p) menghasilkan matriks m × p, dengan elemen hasil berupa jumlah perkalian baris A dan kolom B.",
      "Determinan hanya didefinisikan untuk matriks persegi. Untuk matriks 2 × 2, det [[a, b], [c, d]] = ad − bc. Jika determinan bernilai nol, matriks tidak memiliki invers dan baris-barisnya bergantung linier.",
      "Contoh Soal 1 — Hitung determinan A = [[1, 2, 3], [4, 5, 6], [7, 8, 10]].",
      `Pembahasan (ekspansi kofaktor pada baris pertama):
det A = 1 · (5 · 10 − 6 · 8) − 2 · (4 · 10 − 6 · 7) + 3 · (4 · 8 − 5 · 7)
= 1 · (50 − 48) − 2 · (40 − 42) + 3 · (32 − 35)
= 2 + 4 − 9
= −3.`,
      "Invers matriks 2 × 2: jika A = [[a, b], [c, d]] dan det A = ad − bc ≠ 0, maka A⁻¹ = (1 / det A) · [[d, −b], [−c, a]]. Perkalian A · A⁻¹ menghasilkan matriks identitas.",
      "Contoh Soal 2 — Tentukan invers dari A = [[4, 7], [2, 6]].",
      `Pembahasan:
det A = 4(6) − 7(2) = 24 − 14 = 10.
A^(-1) = (1/10) · [[6, -7], [-2, 4]]
= [[0,6 ; -0,7], [-0,2 ; 0,4]].
Periksa: A · A^(-1) = [[1, 0], [0, 1]]. Benar.`,
      "Sistem persamaan linier (SPL) dapat diselesaikan dengan eliminasi Gauss: susun matriks diperbesar, lalu lakukan operasi baris elementer hingga berbentuk eselon. SPL punya solusi tunggal jika banyak persamaan bebas sama dengan banyak variabel.",
      "Contoh Soal 3 — Selesaikan sistem berikut dengan eliminasi Gauss.",
      code(
        "text",
        `
2x +  y -  z =   8
-3x - y + 2z = -11
-2x + y + 2z =  -3
`,
      ),
      `Pembahasan:
Eliminasi x dari persamaan kedua: R2 + (3/2)R1 menghasilkan 0,5y + 0,5z = 1, yaitu y + z = 2.
Eliminasi x dari persamaan ketiga: R3 + R1 menghasilkan 2y + z = 5.
Kurangkan kedua hasil: (2y + z) − (y + z) = 5 − 2, sehingga y = 3.
Substitusi ke y + z = 2 menghasilkan z = −1.
Substitusi ke 2x + y − z = 8: 2x + 3 + 1 = 8, sehingga 2x = 4 dan x = 2.
Jadi solusinya x = 2, y = 3, z = −1.`,
      "Rank matriks adalah banyaknya baris tak nol pada bentuk eselon baris. Rank menunjukkan banyaknya vektor baris yang bebas linier. Jika rank sama dengan jumlah variabel, solusi SPL tunggal; jika lebih kecil, ada variabel bebas sehingga solusinya tak hingga.",
      "Nilai eigen (eigenvalue) λ adalah skalar yang memenuhi A·v = λ·v untuk vektor tak nol v. Nilai eigen dicari dari persamaan karakteristik det(A − λI) = 0, lalu vektor eigen diperoleh dengan menyelesaikan (A − λI)·v = 0.",
      "Contoh Soal 4 — Tentukan nilai eigen dan vektor eigen dari A = [[2, 1], [1, 2]].",
      `Pembahasan:
det(A − λI) = (2 − λ)(2 − λ) − 1 = λ² − 4λ + 3 = (λ − 1)(λ − 3).
Jadi nilai eigennya λ = 1 dan λ = 3.
Untuk λ = 1: (A − I)v = 0 memberi v1 + v2 = 0, sehingga v = (1, −1).
Untuk λ = 3: (A − 3I)v = 0 memberi −v1 + v2 = 0, sehingga v = (1, 1).`,
      "Poin Penting:",
      `1. Perkalian matriks tidak komutatif: A·B umumnya tidak sama dengan B·A.
2. Determinan nol berarti matriks singular, tidak punya invers, dan barisnya bergantung linier.
3. Untuk matriks 3 × 3, ekspansi kofaktor biasanya lebih aman daripada aturan Sarrus yang mudah salah tanda.
4. Operasi baris elementer tidak mengubah solusi SPL, tetapi mengubah nilai determinan.
5. Rank menentukan apakah SPL punya solusi tunggal, tak hingga, atau tidak punya solusi.
6. Jumlah nilai eigen (dengan multiplisitas) sama dengan ukuran matriks.
7. Selalu periksa hasil invers dengan mengalikannya kembali ke matriks asal.`,
      "Latihan: selesaikan SPL x + y = 5 dan 2x − y = 1 dengan eliminasi, lalu tentukan determinan dan invers dari [[3, 1], [2, 4]].",
    ),
  },
  {
    categorySlug: "fisika-dasar",
    title: "Fisika Dasar: Kinematika, Newton, Energi, Momentum, dan Listrik",
    slug: "fisika-dasar",
    summary: "Hukum gerak, gaya, energi, momentum, tekanan fluida, dan listrik dasar dengan contoh soal serta pembahasan langkah demi langkah.",
    difficulty: "beginner",
    estimatedMinutes: 30,
    content: doc(
      "Fisika dasar mempelajari hubungan antara besaran-besaran alam seperti panjang, waktu, massa, dan arus listrik. Besaran pokok dalam SI meliputi meter, kilogram, sekon, ampere, kelvin, mol, dan kandela. Besaran turunan seperti kecepatan dan gaya dibentuk dari besaran pokok tersebut.",
      "Kinematika membahas gerak tanpa memperhatikan penyebabnya. Untuk gerak lurus dengan percepatan tetap berlaku v = v₀ + a·t, s = v₀·t + ½·a·t², dan v² = v₀² + 2·a·s.",
      "Contoh Soal 1 — Sebuah mobil bergerak dari keadaan diam dengan percepatan 2 m/s² selama 5 sekon. Berapa kecepatan akhir dan jarak yang ditempuh?",
      `Pembahasan:
Diketahui v0 = 0, a = 2 m/s², t = 5 s.
Kecepatan akhir: v = v0 + a·t = 0 + 2(5) = 10 m/s.
Jarak: s = v0·t + ½·a·t² = 0 + ½(2)(25) = 25 m.`,
      "Hukum Newton menjadi dasar dinamika. Hukum I menyatakan benda cenderung mempertahankan keadaannya. Hukum II menyatakan ΣF = m·a. Hukum III menyatakan setiap aksi menimbulkan reaksi yang sama besar dan berlawanan arah.",
      "Contoh Soal 2 — Balok bermassa 5 kg ditarik dengan gaya 20 N mendatar. Jika gaya gesek yang bekerja 5 N, berapa percepatan balok?",
      `Pembahasan:
Gaya total: ΣF = 20 − 5 = 15 N.
Percepatan: a = ΣF / m = 15 / 5 = 3 m/s².`,
      "Usaha dan energi saling terkait. Usaha W = F·s·cos θ. Energi kinetik Ek = ½·m·v², energi potensial gravitasi Ep = m·g·h. Jika hanya gaya konservatif yang bekerja, energi mekanik total kekal.",
      "Contoh Soal 3 — Benda 2 kg dilepaskan dari ketinggian 5 m tanpa kecepatan awal. Dengan g = 10 m/s², berapa energi potensial awalnya dan kecepatan saat menyentuh tanah?",
      `Pembahasan:
Energi potensial awal: Ep = m·g·h = 2(10)(5) = 100 J.
Saat menyentuh tanah, seluruh Ep berubah menjadi Ek:
½·m·v² = 100, sehingga v² = 2(100)/2 = 100 dan v = 10 m/s.
Cek dengan rumus: v = akar(2gh) = akar(2 · 10 · 5) = 10 m/s.`,
      "Momentum adalah hasil kali massa dan kecepatan, p = m·v. Pada tumbukan tanpa gaya luar, momentum total sebelum dan sesudah tumbukan sama. Tumbukan tidak lenting sama sekali membuat kedua benda bergerak bersama.",
      "Contoh Soal 4 — Bola 2 kg bergerak 3 m/s ke kanan menumbuk bola 3 kg yang bergerak 2 m/s ke kiri. Keduanya menempel setelah tumbukan. Berapa kecepatan bersama?",
      `Pembahasan:
Ambil arah kanan positif.
Momentum awal: p = 2(3) + 3(−2) = 6 − 6 = 0 kg·m/s.
Setelah menempel: (2 + 3)·v = 0, sehingga v = 0 m/s.
Kedua bola berhenti tepat setelah tumbukan.`,
      "Tekanan fluida bertambah seiring kedalaman sesuai p = ρ·g·h. Hukum Archimedes menyatakan gaya apung sama dengan berat fluida yang dipindahkan. Prinsip ini menjelaskan mengapa kapal bisa terapung meskipun terbuat dari logam.",
      "Contoh Soal 5 — Berapa tekanan hidrostatis pada kedalaman 2 m di air (ρ = 1000 kg/m³, g = 10 m/s²)?",
      `Pembahasan:
p = ρ·g·h = 1000 · 10 · 2 = 20.000 Pa (20 kPa).`,
      "Listrik dasar menggunakan hukum Ohm V = I·R. Pada rangkaian seri, hambatan dijumlahkan dan arus sama di setiap titik. Pada rangkaian paralel, tegangan sama dan kebalikan hambatan total adalah jumlah kebalikan tiap hambatan.",
      "Contoh Soal 6 — Dua resistor 2 Ω dan 3 Ω disusun seri pada tegangan 10 V. Berapa hambatan total dan arus yang mengalir?",
      `Pembahasan:
Hambatan seri: R = 2 + 3 = 5 Ω.
Arus: I = V / R = 10 / 5 = 2 A.`,
      "Poin Penting:",
      `1. Tulis besaran yang diketahui beserta satuannya sebelum menghitung, lalu samakan satuannya.
2. Gunakan arah positif yang konsisten; kecepatan dan gaya berlawanan arah diberi tanda negatif.
3. Percepatan nol bukan berarti benda diam, bisa juga bergerak dengan kecepatan tetap.
4. Energi tidak hilang, tetapi bisa berubah bentuk menjadi panas atau bunyi.
5. Momentum selalu kekal pada tumbukan tanpa gaya luar, sedangkan energi kinetik hanya kekal pada tumbukan lenting sempurna.
6. Tekanan hidrostatis bergantung pada kedalaman, bukan pada luas wadah.
7. Periksa apakah hasil perhitungan masuk akal secara fisika, misalnya kecepatan tidak melebihi kecepatan cahaya.`,
      "Latihan: sebuah sepeda bergerak 4 m/s lalu dipercepat 1 m/s² selama 6 sekon. Hitung kecepatan akhir dan jarak tempuhnya, lalu hitung energi kinetiknya jika massa sepeda dan pengendara 60 kg.",
    ),
  },
  ...advancedMaterials,
  ...toolMaterials,
];
