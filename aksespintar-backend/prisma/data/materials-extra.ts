import type { MaterialSeed } from "./materials";

// Materi lanjutan untuk setiap topik dasar, plus materi alat bantu pengembangan
// (VS Code, JSON, Git). Dipisah dari materials.ts agar file dasar tetap ringkas.

const code = (lang: string, body: string) => ["```" + lang, body.trim(), "```"].join("\n");
const doc = (...blocks: string[]) => blocks.join("\n\n");

export const advancedMaterials: MaterialSeed[] = [
  {
    categorySlug: "python",
    title: "Python Lanjutan: OOP, Generator, Dekorator, dan Concurrency",
    slug: "python-lanjutan",
    summary: "Naik dari sintaks dasar ke desain program: kelas dan dunder method, generator, dekorator, context manager, type hint, serta kapan memakai thread, process, atau asyncio.",
    difficulty: "advanced",
    estimatedMinutes: 40,
    content: doc(
      "Setelah menguasai variabel, percabangan, dan fungsi, langkah berikutnya adalah menulis kode yang bisa dirawat. Python lanjutan berfokus pada empat hal: memodelkan data dengan kelas, mengolah data besar secara hemat memori dengan generator, mengurangi pengulangan dengan dekorator, dan menjalankan pekerjaan bersamaan dengan model konkurensi yang tepat.",
      "Class adalah cetak biru objek. Metode __init__ dipanggil saat objek dibuat. Atribut yang diawali garis bawah (_saldo) adalah konvensi internal, bukan paksaan dari bahasa. Method khusus dengan dua garis bawah di awal dan akhir disebut dunder method; method inilah yang membuat objek bisa dicetak, dibandingkan, atau dijumlahkan.",
      "Contoh 1 - kelas dengan validasi lewat @property dan representasi yang jelas:",
      code(
        "python",
        `
class Rekening:
    def __init__(self, pemilik: str, saldo: int = 0) -> None:
        self.pemilik = pemilik
        self._saldo = saldo

    @property
    def saldo(self) -> int:
        return self._saldo

    def tarik(self, jumlah: int) -> None:
        if jumlah <= 0:
            raise ValueError("Jumlah penarikan harus positif")
        if jumlah > self._saldo:
            raise ValueError("Saldo tidak cukup")
        self._saldo -= jumlah

    def __repr__(self) -> str:
        return f"Rekening(pemilik={self.pemilik!r}, saldo={self._saldo})"


akun = Rekening("Rani", 50_000)
akun.tarik(20_000)
print(akun)        # Rekening(pemilik='Rani', saldo=30000)
print(akun.saldo)  # 30000
`,
      ),
      "Warisan (inheritance) dipakai saat ada perilaku yang sama. Panggil super().__init__(...) agar induk tetap menginisialisasi dirinya. Jangan memakai warisan hanya untuk berbagi kode; komposisi (objek memakai objek lain) biasanya lebih fleksibel.",
      "Contoh 2 - dataclass menghemat kode boilerplate untuk kelas yang isinya data:",
      code(
        "python",
        `
from dataclasses import dataclass, field

@dataclass
class Mahasiswa:
    nama: str
    nilai: list[int] = field(default_factory=list)

    @property
    def rata_rata(self) -> float:
        return sum(self.nilai) / len(self.nilai) if self.nilai else 0.0


m = Mahasiswa("Budi")
m.nilai.extend([80, 90, 70])
print(m)                 # Mahasiswa(nama='Budi', nilai=[80, 90, 70])
print(m.rata_rata)       # 80.0
`,
      ),
      "Perhatikan field(default_factory=list). Nilai default yang mutable seperti list atau dict tidak boleh ditulis langsung sebagai = [] pada dataclass, karena satu objek akan dipakai bersama semua instance.",
      "Generator adalah fungsi yang memakai yield. Ia menghasilkan nilai satu per satu dan menyimpan posisinya, sehingga tidak perlu menampung seluruh data di memori. Ini penting saat membaca file besar atau data tak terbatas.",
      "Contoh 3 - generator bilangan Fibonacci tanpa menyimpan seluruh deret:",
      code(
        "python",
        `
def fibonacci(batas: int):
    a, b = 0, 1
    while a < batas:
        yield a
        a, b = b, a + b


print(list(fibonacci(50)))   # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

gen = (x * x for x in range(5))   # generator expression, bukan list
print(next(gen), next(gen))       # 0 1
`,
      ),
      "Dekorator adalah fungsi yang menerima fungsi lain dan mengembalikan versi barunya. Pola ini dipakai untuk logging, pengukuran waktu, pengecekan izin, dan caching. Selalu bungkus dengan functools.wraps agar nama dan docstring fungsi asli tidak hilang.",
      "Contoh 4 - dekorator untuk mengukur waktu eksekusi:",
      code(
        "python",
        `
import functools
import time


def catat_waktu(fungsi):
    @functools.wraps(fungsi)
    def pembungkus(*args, **kwargs):
        mulai = time.perf_counter()
        hasil = fungsi(*args, **kwargs)
        selesai = time.perf_counter()
        print(f"{fungsi.__name__} butuh {selesai - mulai:.4f} detik")
        return hasil

    return pembungkus


@catat_waktu
def jumlahkan(n: int) -> int:
    return sum(range(n))


jumlahkan(1_000_000)
`,
      ),
      "Context manager menjaga sumber daya agar selalu dilepas, termasuk saat terjadi error. Cara paling ringkas adalah contextlib.contextmanager pada fungsi bergenerator yang memakai try/finally.",
      "Contoh 5 - context manager sederhana untuk mengukur durasi blok kode:",
      code(
        "python",
        `
import time
from contextlib import contextmanager


@contextmanager
def ukur(label: str):
    mulai = time.perf_counter()
    try:
        yield
    finally:
        print(f"{label}: {time.perf_counter() - mulai:.4f} detik")


with ukur("baca data"):
    total = sum(range(1_000_000))
`,
      ),
      "Concurrency di Python perlu dipahami bersama GIL. Pada CPython, Global Interpreter Lock membuat hanya satu thread yang mengeksekusi bytecode Python pada satu waktu. Akibatnya thread tidak mempercepat pekerjaan yang berat di CPU, tetapi sangat membantu untuk pekerjaan yang menunggu I/O seperti request jaringan, query database, atau baca file.",
      "Aturan praktisnya: pekerjaan berat CPU memakai multiprocessing (proses terpisah, memori terpisah, tanpa GIL), pekerjaan menunggu I/O memakai asyncio atau thread. asyncio memakai satu thread dengan event loop dan sintaks async/await sehingga ribuan koneksi bisa ditangani tanpa ribuan thread.",
      "Contoh 6 - menjalankan dua tugas I/O bersamaan dengan asyncio.gather:",
      code(
        "python",
        `
import asyncio


async def ambil_data(nama: str, detik: float) -> str:
    print("mulai", nama)
    await asyncio.sleep(detik)
    print("selesai", nama)
    return nama


async def main() -> None:
    hasil = await asyncio.gather(
        ambil_data("A", 2),
        ambil_data("B", 1),
    )
    print(hasil)   # ['A', 'B']


asyncio.run(main())
`,
      ),
      "Kedua tugas selesai dalam sekitar dua detik, bukan tiga, karena keduanya menunggu secara bersamaan. Bandingkan dengan pemanggilan berurutan yang menjumlahkan waktunya.",
      "Type hint seperti list[int], str, dan -> None tidak mengubah perilaku saat program berjalan; ia membantu editor dan alat pemeriksa tipe menemukan kesalahan lebih awal. Untuk proyek nyata, jalankan mypy atau pyright di CI agar tipe benar-benar diperiksa.",
      "Poin Penting:",
      `1. Gunakan @property untuk atribut yang butuh validasi, bukan atribut publik yang diubah bebas.
2. Jangan memakai argumen default mutable seperti def f(data=[]); pakai None lalu buat list di dalam fungsi.
3. yield mengubah fungsi menjadi generator; panggilannya mengembalikan iterator, bukan nilai langsung.
4. functools.wraps wajib pada dekorator agar metadata fungsi asli tidak hilang.
5. GIL membuat thread tidak mempercepat kerja CPU; gunakan multiprocessing untuk itu.
6. asyncio hanya cepat jika pustaka yang dipakai juga async; memanggil fungsi blocking di dalam coroutine akan menghentikan event loop.
7. Bungkus sumber daya eksternal (file, koneksi, lock) dengan with agar selalu dilepas.`,
      "Latihan: buat kelas Antrean dengan method tambah, ambil, dan properti panjang yang memakai list di dalamnya, lalu tulis generator yang menghasilkan bilangan kelipatan 3 sampai batas tertentu, dan ukur waktu eksekusinya dengan dekorator dari Contoh 4.",
    ),
  },
  {
    categorySlug: "javascript",
    title: "JavaScript Lanjutan: Scope, Closure, Prototype, dan Event Loop",
    slug: "javascript-lanjutan",
    summary: "Pahami cara kerja JavaScript: hoisting dan TDZ, closure, binding this, rantai prototype, urutan microtask dan macrotask, serta pola async yang aman.",
    difficulty: "advanced",
    estimatedMinutes: 40,
    content: doc(
      "JavaScript mudah dijalankan, tetapi sering membingungkan karena perilakunya ditentukan oleh tiga hal yang tidak terlihat di layar: scope, mekanisme pemanggilan fungsi, dan antrean tugas di event loop. Materi ini membahas ketiganya secara berurutan.",
      "Scope menentukan di mana sebuah nama bisa diakses. var memiliki function scope dan di-hoist sebagai undefined. let dan const memiliki block scope dan berada di temporal dead zone (TDZ): variabelnya sudah ada tetapi belum boleh dipakai sebelum baris deklarasinya dieksekusi. Karena itu const bukan berarti nilainya beku; yang beku adalah binding-nya, sedangkan isi objek tetap bisa diubah.",
      "Contoh 1 - perbedaan var, let, dan const di dalam blok:",
      code(
        "javascript",
        `
function uji() {
  if (true) {
    var a = "var";
    let b = "let";
    const c = "const";
    console.log(a, b, c);   // var let const
  }
  console.log(a);           // var  -> masih hidup
  // console.log(b);        // ReferenceError: b tidak ada di scope ini
}

uji();

const daftar = [1, 2, 3];
daftar.push(4);             // boleh: isi array diubah
console.log(daftar.length); // 4
// daftar = [];             // TypeError: binding const tidak bisa diganti
`,
      ),
      "Closure terjadi ketika sebuah fungsi tetap mengingat variabel dari scope tempat ia dibuat, walau scope itu sudah selesai dieksekusi. Closure dipakai untuk data privat, penghitung, memoization, dan pembungkus fungsi seperti debounce.",
      "Contoh 2 - closure sebagai penghitung dengan data yang tidak bisa diubah dari luar:",
      code(
        "javascript",
        `
function buatPenghitung() {
  let hitungan = 0;

  return function () {
    hitungan += 1;
    return hitungan;
  };
}

const hitung = buatPenghitung();
console.log(hitung());  // 1
console.log(hitung());  // 2
console.log(hitung());  // 3
// hitungan tidak bisa diakses langsung dari luar
`,
      ),
      "Masalah klasik closure di dalam loop dengan var sudah tidak muncul jika memakai let, karena let membuat binding baru di setiap iterasi.",
      "Contoh 3 - debounce memakai closure untuk menunda pemanggilan fungsi:",
      code(
        "javascript",
        `
function debounce(fn, delay) {
  let timer = null;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const cari = debounce((kata) => console.log("Cari:", kata), 300);

cari("py");
cari("python");   // hanya "python" yang tercetak setelah 300 ms
`,
      ),
      "Nilai this ditentukan oleh cara fungsi dipanggil, bukan tempat ia ditulis. Pada pemanggilan biasa (fn()), this bernilai undefined di mode strict atau objek global di mode sloppy. Pada pemanggilan method (obj.fn()), this adalah obj.fn. Arrow function berbeda: ia tidak punya this sendiri dan mengambil this dari scope sekitarnya, sehingga tidak cocok dipakai sebagai method yang butuh objek pemanggil.",
      "Contoh 4 - this pada method, arrow function, dan bind:",
      code(
        "javascript",
        `
const pengguna = {
  nama: "Rani",
  sapaBiasa: function () {
    return "Halo " + this.nama;
  },
  sapaArrow: () => {
    return "Halo " + this.nama;   // this bukan objek pengguna
  },
};

console.log(pengguna.sapaBiasa());  // Halo Rani
console.log(pengguna.sapaArrow());  // Halo undefined

const lepas = pengguna.sapaBiasa;
const terikat = lepas.bind(pengguna);
console.log(terikat());             // Halo Rani
`,
      ),
      "JavaScript memakai pewarisan berbasis prototype. Setiap objek punya rantai prototype; pencarian properti naik ke atas rantai sampai ketemu atau berakhir di null. Kata kunci class hanyalah cara menulis yang lebih rapi untuk mekanisme yang sama.",
      "Contoh 5 - memeriksa rantai prototype:",
      code(
        "javascript",
        `
class Hewan {
  constructor(nama) {
    this.nama = nama;
  }

  suara() {
    return this.nama + " bersuara";
  }
}

class Kucing extends Hewan {
  suara() {
    return this.nama + ": meong";
  }
}

const kucing = new Kucing("Milo");
console.log(kucing.suara());                              // Milo: meong
console.log(Object.getPrototypeOf(kucing) === Kucing.prototype); // true
console.log(kucing instanceof Hewan);                     // true
`,
      ),
      "Event loop adalah alasan JavaScript bisa menangani banyak pekerjaan dengan satu thread. Kode yang sedang berjalan menempati call stack. Setelah stack kosong, event loop menjalankan seluruh microtask (callback dari Promise.then, queueMicrotask, MutationObserver), baru kemudian satu macrotask (setTimeout, setInterval, event I/O). Urutan ini wajib diingat karena menentukan output program.",
      "Contoh 6 - urutan eksekusi sinkron, microtask, dan macrotask:",
      code(
        "javascript",
        `
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

console.log("4");

// Output: 1, 4, 3, 2
`,
      ),
      "Promise.all gagal cepat: begitu satu promise ditolak, seluruh hasilnya ditolak. Jika ingin semua hasil dilaporkan termasuk yang gagal, pakai Promise.allSettled. Untuk membatasi jumlah permintaan bersamaan, proses dalam kelompok atau pakai pustaka pengatur konkurensi.",
      "Contoh 7 - menangani hasil sebagian dengan Promise.allSettled:",
      code(
        "javascript",
        `
async function ambil(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Gagal: " + res.status);
  }
  return res.json();
}

const hasil = await Promise.allSettled([
  ambil("/api/materi"),
  ambil("/api/kategori"),
]);

for (const item of hasil) {
  if (item.status === "fulfilled") {
    console.log("sukses", item.value);
  } else {
    console.log("gagal", item.reason.message);
  }
}
`,
      ),
      "Sintaks modern yang membuat kode lebih aman: optional chaining (?.) berhenti tanpa error saat nilainya null atau undefined, nullish coalescing (??) hanya memakai nilai cadangan jika kiri bernilai null atau undefined (berbeda dari || yang juga menimpa 0 dan string kosong), serta structuredClone untuk menyalin objek bersarang secara mendalam.",
      "Contoh 8 - optional chaining dan nullish coalescing:",
      code(
        "javascript",
        `
const konfigurasi = { tema: { warna: "gelap" }, batas: 0 };

console.log(konfigurasi.tema?.warna);        // gelap
console.log(konfigurasi.ikon?.nama);         // undefined, tanpa error

console.log(konfigurasi.batas || 10);        // 10  -> 0 dianggap kosong
console.log(konfigurasi.batas ?? 10);        // 0   -> hanya null/undefined

const salinan = structuredClone(konfigurasi);
salinan.tema.warna = "terang";
console.log(konfigurasi.tema.warna);         // gelap, asli tidak berubah
`,
      ),
      "Modul ES memakai export dan import. Static import dimuat sebelum kode dijalankan, sedangkan dynamic import() mengembalikan promise dan berguna untuk memuat kode berat hanya saat dibutuhkan (code splitting).",
      "Contoh 9 - dynamic import saat tombol diklik:",
      code(
        "javascript",
        `
async function bukaEditor() {
  const modul = await import("./editor.js");
  modul.buka();
}

document.querySelector("#tombol-editor").addEventListener("click", bukaEditor);
`,
      ),
      "Poin Penting:",
      `1. Gunakan const secara default, let jika nilainya berubah, dan hindari var pada kode baru.
2. Closure menyimpan referensi variabel, bukan salinan nilainya.
3. Arrow function tidak punya this sendiri; jangan pakai sebagai method objek.
4. Microtask (Promise) selalu dijalankan sebelum macrotask (setTimeout), berapa pun delay-nya.
5. await di dalam loop menjalankan proses berurutan; untuk paralel pakai Promise.all.
6. ?? hanya menimpa null dan undefined, sedangkan || juga menimpa 0, string kosong, dan false.
7. Selalu tangani penolakan promise; promise yang ditolak tanpa handler memicu unhandled rejection.`,
      "Latihan: tulis fungsi memoize berbasis closure untuk mempercepat perhitungan rekursif, lalu jelaskan urutan output dari kode yang memuat console.log, setTimeout, Promise.resolve().then, dan queueMicrotask dalam satu skrip.",
    ),
  },
  {
    categorySlug: "html-css",
    title: "HTML Lanjutan: Semantik, Form, Aksesibilitas, dan SEO",
    slug: "html-lanjutan",
    summary: "Tulis HTML yang benar secara struktur dan bisa dipakai semua orang: elemen semantik, form dengan validasi bawaan, atribut aksesibilitas, meta SEO, dan optimasi pemuatan.",
    difficulty: "advanced",
    estimatedMinutes: 35,
    content: doc(
      "HTML lanjutan bukan soal tag yang belum pernah dipakai, melainkan soal memilih tag yang tepat. HTML yang semantik membantu mesin pencari memahami isi halaman, membantu pembaca layar menavigasi, dan membuat kode lebih mudah dirawat karena strukturnya sesuai makna, bukan sekadar tampilan.",
      "Elemen semantik memberi arti pada blok konten. header, nav, main, article, section, aside, dan footer adalah landmark yang dikenali pembaca layar sehingga pengguna bisa melompat langsung ke bagian tertentu. Aturan penting: hanya boleh ada satu main per halaman, dan heading h1 sampai h6 harus berurutan tanpa melompati tingkat.",
      "Contoh 1 - kerangka halaman dengan landmark yang benar:",
      code(
        "html",
        `
<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Materi HTML Lanjutan - AksesPintar</title>
  </head>
  <body>
    <header>
      <a href="/">AksesPintar</a>
      <nav aria-label="Navigasi utama">
        <ul>
          <li><a href="/materi">Materi</a></li>
          <li><a href="/tentang">Tentang</a></li>
        </ul>
      </nav>
    </header>

    <main>
      <article>
        <h1>HTML Lanjutan</h1>
        <p>Ringkasan materi dalam satu paragraf.</p>
        <section>
          <h2>Elemen semantik</h2>
          <p>Penjelasan bagian pertama.</p>
        </section>
      </article>
    </main>

    <footer>
      <p>&copy; 2026 AksesPintar</p>
    </footer>
  </body>
</html>
`,
      ),
      "Form adalah bagian HTML yang paling sering ditulis salah. Setiap input wajib punya label yang terhubung lewat atribut for dan id, atau dengan membungkus input di dalam label. Atribut type yang tepat memberi keyboard yang sesuai di ponsel dan validasi bawaan browser, sehingga tidak perlu JavaScript untuk kasus sederhana.",
      "Contoh 2 - form dengan validasi bawaan dan struktur yang aksesibel:",
      code(
        "html",
        `
<form action="/api/v1/auth/register" method="post">
  <fieldset>
    <legend>Buat akun</legend>

    <label for="nama">Nama lengkap</label>
    <input id="nama" name="nama" type="text" minlength="2" maxlength="100" required />

    <label for="email">Email</label>
    <input id="email" name="email" type="email" autocomplete="email" required />

    <label for="sandi">Kata sandi</label>
    <input
      id="sandi"
      name="sandi"
      type="password"
      autocomplete="new-password"
      minlength="8"
      pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,}"
      required
      aria-describedby="sandi-hint"
    />
    <small id="sandi-hint">Minimal 8 karakter, mengandung huruf dan angka.</small>

    <button type="submit">Daftar</button>
  </fieldset>
</form>
`,
      ),
      "Perhatikan tiga hal pada contoh di atas: type=email membuat browser memeriksa format email, autocomplete membantu pengelola kata sandi, dan aria-describedby menghubungkan petunjuk ke input sehingga pembaca layar membacakannya. Validasi di browser hanya untuk kenyamanan; server tetap wajib memvalidasi ulang karena permintaan bisa dikirim tanpa melewati browser.",
      "Aksesibilitas (a11y) bukan fitur tambahan, melainkan syarat agar halaman bisa dipakai. Empat aturan yang paling berdampak: beri teks alternatif pada gambar, pastikan semua fungsi bisa dijalankan dengan keyboard, jaga kontras teks minimal 4,5:1 untuk teks normal, dan jangan memakai warna saja untuk menyampaikan status.",
      "Contoh 3 - gambar, tombol, dan tautan yang aksesibel:",
      code(
        "html",
        `
<!-- Gambar informatif: alt menjelaskan isinya -->
<img src="/img/grafik-nilai.png" alt="Grafik nilai rata-rata naik dari 70 ke 85 pada 2026" width="640" height="360" />

<!-- Gambar dekoratif: alt kosong agar diabaikan pembaca layar -->
<img src="/img/garis.png" alt="" />

<!-- Tombol untuk aksi, tautan untuk pindah halaman -->
<button type="button" aria-label="Tutup dialog">&times;</button>
<a href="/materi/sql-dasar">Baca materi SQL</a>

<!-- Status yang diumumkan pembaca layar -->
<p role="status">Materi berhasil disimpan.</p>
`,
      ),
      "Atribut width dan height pada gambar mencegah layout bergeser saat gambar selesai dimuat, karena browser sudah tahu ruang yang dibutuhkan. Untuk gambar di bawah lipatan pertama, tambahkan loading=lazy agar tidak dimuat sebelum dibutuhkan.",
      "SEO teknis dimulai dari hal mendasar: satu h1 per halaman, title yang unik dan deskriptif, meta description yang menjelaskan isi, serta URL yang mudah dibaca. Untuk berbagi di media sosial, gunakan Open Graph.",
      "Contoh 4 - meta tag penting di dalam head:",
      code(
        "html",
        `
<meta name="description" content="Belajar HTML lanjutan: elemen semantik, form, aksesibilitas, dan SEO." />
<link rel="canonical" href="https://aksespintar.example/materi/html-lanjutan" />

<meta property="og:type" content="article" />
<meta property="og:title" content="HTML Lanjutan - AksesPintar" />
<meta property="og:description" content="Struktur HTML yang semantik dan aksesibel." />
<meta property="og:image" content="https://aksespintar.example/img/html-lanjutan.png" />

<meta name="twitter:card" content="summary_large_image" />
`,
      ),
      "Structured data membantu mesin pencari memahami jenis konten. Formatnya JSON-LD di dalam script bertipe application/ld+json. Jangan menandai data yang tidak terlihat di halaman, karena bisa dianggap tidak sesuai pedoman.",
      "Contoh 5 - structured data untuk artikel:",
      code(
        "html",
        `
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "HTML Lanjutan: Semantik, Form, Aksesibilitas, dan SEO",
    "author": { "@type": "Person", "name": "Admin AksesPintar" },
    "datePublished": "2026-10-28",
    "inLanguage": "id"
  }
</script>
`,
      ),
      "Tabel harus dipakai untuk data tabular, bukan untuk tata letak. Gunakan caption sebagai judul tabel, thead dan tbody untuk memisahkan bagian, serta scope=col atau scope=row pada th agar pembaca layar tahu hubungan sel dengan header-nya.",
      "Contoh 6 - tabel data yang benar:",
      code(
        "html",
        `
<table>
  <caption>Nilai ujian mingguan</caption>
  <thead>
    <tr>
      <th scope="col">Nama</th>
      <th scope="col">Nilai</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Budi</th>
      <td>85</td>
    </tr>
    <tr>
      <th scope="row">Rani</th>
      <td>92</td>
    </tr>
  </tbody>
</table>
`,
      ),
      "Pemuatan skrip memakai defer atau async. Tanpa keduanya, skrip memblokir parsing. defer mengunduh secara paralel lalu menjalankannya berurutan setelah dokumen selesai diparse, sehingga cocok untuk skrip aplikasi. async menjalankan begitu selesai diunduh tanpa menunggu urutan, cocok untuk skrip analitik yang berdiri sendiri.",
      "Contoh 7 - memuat skrip dengan defer dan preload font:",
      code(
        "html",
        `
<script src="/assets/app.js" defer></script>
<script src="/assets/analytics.js" async></script>

<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
`,
      ),
      "Poin Penting:",
      `1. Satu h1 per halaman dan heading harus berurutan, jangan lompat dari h1 ke h3.
2. Semua input wajib punya label; jangan mengandalkan placeholder sebagai label.
3. alt diisi untuk gambar informatif dan dikosongkan untuk gambar dekoratif.
4. Validasi HTML di browser hanya kenyamanan; validasi sebenarnya tetap di server.
5. Tombol dipakai untuk aksi di halaman, tautan dipakai untuk berpindah alamat.
6. Selalu sertakan width dan height pada gambar agar layout tidak bergeser.
7. Gunakan defer untuk skrip aplikasi dan async untuk skrip independen seperti analitik.`,
      "Latihan: buat halaman profil siswa dengan landmark lengkap, satu form pendaftaran ekstrakurikuler yang lolos validasi tanpa JavaScript, satu tabel jadwal, dan meta Open Graph, lalu periksa hasilnya dengan tab aksesibilitas di DevTools.",
    ),
  },
  {
    categorySlug: "html-css",
    title: "CSS Lanjutan: Cascade Layer, Container Query, Animasi, dan Arsitektur",
    slug: "css-lanjutan",
    summary: "Kuasai bagian CSS yang dipakai proyek nyata: cascade layer, custom property, layout modern, container query, animasi yang hemat performa, dan struktur file yang bisa diskalakan.",
    difficulty: "advanced",
    estimatedMinutes: 38,
    content: doc(
      "Pada tingkat lanjutan, masalah CSS jarang berupa 'properti apa yang dipakai', tetapi 'gaya siapa yang menang' dan 'bagaimana kode ini tetap rapi setelah ribuan baris'. Dua alat utama untuk itu adalah cascade layer dan custom property.",
      "Cascade layer (@layer) mengelompokkan aturan ke dalam lapisan dengan prioritas yang ditentukan urutan deklarasinya, bukan urutan penulisan selector. Lapisan yang dideklarasikan lebih dulu memiliki prioritas lebih rendah. Gaya di luar layer selalu mengalahkan gaya di dalam layer, dan !important membalik urutan antar layer.",
      "Contoh 1 - menyusun urutan prioritas dengan @layer:",
      code(
        "css",
        `
@layer reset, dasar, komponen, utilitas;

@layer reset {
  * { margin: 0; box-sizing: border-box; }
}

@layer dasar {
  body { font-family: system-ui, sans-serif; line-height: 1.6; }
}

@layer komponen {
  .kartu { padding: 1.25rem; border: 1px solid #eee1e5; border-radius: 16px; }
}

@layer utilitas {
  .p-0 { padding: 0; }
}
`,
      ),
      "Custom property (variabel CSS) diwariskan ke elemen anak dan bisa diubah saat runtime, sehingga tema terang dan gelap cukup mengganti nilainya di satu tempat. Nilai cadangan ditulis di argumen kedua var().",
      "Contoh 2 - token warna dan ukuran yang dipakai ulang:",
      code(
        "css",
        `
:root {
  --brand: #7b1e3a;
  --teks: #241318;
  --permukaan: #ffffff;
  --jarak: clamp(1rem, 2vw + 0.5rem, 2rem);
  --radius: 14px;
}

[data-theme="dark"] {
  --brand: #a53a58;
  --teks: #f6edf0;
  --permukaan: #1a1216;
}

.tombol {
  padding: 0.65rem var(--jarak);
  border-radius: var(--radius, 10px);
  background: var(--brand);
  color: #fff;
}
`,
      ),
      "clamp(min, ideal, max) membuat ukuran menyesuaikan viewport tanpa media query. Untuk tipografi, ini menghasilkan teks yang membesar di layar lebar tetapi tidak pernah lebih kecil dari batas bawah maupun lebih besar dari batas atas.",
      "Contoh 3 - tipografi dan jarak yang cair:",
      code(
        "css",
        `
h1 {
  font-size: clamp(1.9rem, 4vw, 2.85rem);
  letter-spacing: -0.02em;
}

.wadah {
  width: min(1080px, 100% - 2.5rem);
  margin-inline: auto;
}
`,
      ),
      "Container query mengubah ukuran elemen berdasarkan lebar wadahnya, bukan lebar layar. Ini menyelesaikan masalah komponen yang dipakai di dua tempat dengan lebar berbeda. Syaratnya, wadah harus diberi container-type.",
      "Contoh 4 - kartu yang berubah tata letak mengikuti lebar wadah:",
      code(
        "css",
        `
.daftar-kartu {
  container-type: inline-size;
}

.kartu {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@container (min-width: 420px) {
  .kartu {
    flex-direction: row;
    align-items: center;
  }
}
`,
      ),
      "Pseudo-class modern membuat CSS lebih ekspresif tanpa JavaScript. :is() menerima daftar selector dan mengambil spesifisitas tertinggi di dalamnya, sedangkan :where() selalu berspesifisitas nol sehingga mudah ditimpa. :has() memilih elemen induk berdasarkan isinya, misalnya form yang berisi input tidak valid.",
      "Contoh 5 - :has(), :where(), dan :focus-visible:",
      code(
        "css",
        `
:where(h1, h2, h3) {
  margin: 0;
  line-height: 1.2;
}

.form-field:has(input:invalid) {
  border-color: #b3223b;
  background: #fdecef;
}

.tombol:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}
`,
      ),
      "Animasi sebaiknya memakai transform dan opacity karena keduanya bisa ditangani compositor tanpa memicu perhitungan ulang layout. Mengubah width, top, atau margin pada setiap frame membuat animasi tersendat di perangkat lemah.",
      "Contoh 6 - animasi hemat performa dan menghormati preferensi pengguna:",
      code(
        "css",
        `
@keyframes muncul {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.kartu {
  animation: muncul 220ms ease-out both;
}

@media (prefers-reduced-motion: reduce) {
  .kartu {
    animation: none;
  }
}
`,
      ),
      "Properti logis seperti margin-inline, padding-block, dan inset-inline menulis aturan yang otomatis mengikuti arah tulisan (kiri ke kanan atau kanan ke kiri). Ini membuat dukungan bahasa Arab atau Ibrani tidak perlu menulis ulang CSS.",
      "Contoh 7 - properti logis dan aspect-ratio:",
      code(
        "css",
        `
.media {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: var(--radius);
}

.media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.aksi {
  padding-block: 0.75rem;
  margin-inline-start: 0.5rem;
}
`,
      ),
      "Arsitektur file menentukan umur proyek. Pola yang paling mudah dipakai: pisahkan token (warna, jarak, tipografi), reset, komponen, dan utilitas ke file berbeda; beri nama kelas dengan pola yang konsisten seperti BEM (blok__elemen--modifier); hindari selector yang terlalu dalam seperti .a .b .c .d; dan jangan memakai !important untuk menutupi masalah prioritas.",
      "Contoh 8 - penamaan BEM dan struktur file:",
      code(
        "css",
        `
/* styles/tokens.css, reset.css, komponen/kartu.css, utilitas.css */

.kartu { /* blok */ }

.kartu__judul { /* elemen */ }

.kartu--unggulan { /* modifier */ }
`,
      ),
      "Poin Penting:",
      `1. Lapisan yang dideklarasikan lebih awal memiliki prioritas lebih rendah; gaya tanpa layer selalu menang.
2. :where() berspesifisitas nol, :is() mengikuti selector paling kuat di dalamnya.
3. Custom property diwariskan, jadi tetapkan token di :root dan timpa di elemen tertentu.
4. clamp() lebih ringkas daripada tiga media query untuk ukuran yang menyesuaikan layar.
5. Container query butuh container-type pada wadah, bukan pada elemen yang diatur.
6. Animasikan transform dan opacity, hindari width dan top untuk animasi yang sering berjalan.
7. Selalu sediakan prefers-reduced-motion agar pengguna yang sensitif gerakan tetap nyaman.`,
      "Latihan: buat komponen kartu materi yang memakai token warna, berubah dari satu kolom ke dua kolom lewat container query, punya animasi masuk yang mati saat prefers-reduced-motion aktif, dan bisa berganti tema hanya dengan mengubah satu atribut data-theme di html.",
    ),
  },
  {
    categorySlug: "cpp",
    title: "C++ Lanjutan: RAII, Smart Pointer, Move Semantics, dan Template",
    slug: "cpp-lanjutan",
    summary: "Tulis C++ modern yang aman: kepemilikan sumber daya dengan RAII, unique_ptr dan shared_ptr, move semantics, template, serta algoritma STL.",
    difficulty: "advanced",
    estimatedMinutes: 45,
    content: doc(
      "C++ memberi kendali penuh atas memori, dan di situlah letak kekuatan sekaligus risikonya. C++ modern (sejak C++11) menggeser gaya penulisan dari new dan delete manual ke kepemilikan otomatis lewat RAII dan smart pointer, sehingga kebocoran memori dan dangling pointer jauh lebih jarang terjadi.",
      "RAII (Resource Acquisition Is Initialization) adalah prinsip paling penting di C++. Sumber daya diambil di konstruktor dan dilepas di destruktor. Karena destruktor selalu dipanggil saat objek keluar dari scope, termasuk saat terjadi exception, sumber daya tidak akan bocor. Prinsip ini berlaku untuk memori, file, mutex, koneksi jaringan, dan socket.",
      "Contoh 1 - RAII sederhana untuk membuka file:",
      code(
        "cpp",
        `
#include <fstream>
#include <iostream>
#include <stdexcept>
#include <string>

class Berkas {
public:
    explicit Berkas(const std::string& path)
        : stream_(path) {
        if (!stream_.is_open()) {
            throw std::runtime_error("Gagal membuka " + path);
        }
    }

    std::ifstream& stream() { return stream_; }

    // Tidak perlu destructor manual: std::ifstream menutup dirinya sendiri.
private:
    std::ifstream stream_;
};

int main() {
    try {
        Berkas berkas("data.txt");
        std::string baris;
        while (std::getline(berkas.stream(), baris)) {
            std::cout << baris << std::endl;
        }
    } catch (const std::exception& e) {
        std::cerr << e.what() << std::endl;
        return 1;
    }
    return 0;
}
`,
      ),
      "std::unique_ptr menyatakan kepemilikan tunggal dan tidak bisa disalin, hanya dipindahkan. std::shared_ptr dipakai saat beberapa bagian program benar-benar berbagi kepemilikan; penghitung referensinya bertambah saat disalin dan sumber daya dihapus ketika penghitung mencapai nol. std::weak_ptr mematahkan siklus referensi yang membuat shared_ptr saling menahan selamanya.",
      "Contoh 2 - polimorfisme dengan unique_ptr tanpa new dan delete:",
      code(
        "cpp",
        `
#include <iostream>
#include <memory>
#include <string>
#include <vector>

class Sensor {
public:
    explicit Sensor(std::string nama) : nama_(std::move(nama)) {}
    virtual ~Sensor() = default;

    const std::string& nama() const { return nama_; }
    virtual double baca() const = 0;

private:
    std::string nama_;
};

class Suhu : public Sensor {
public:
    Suhu(std::string nama, double nilai)
        : Sensor(std::move(nama)), nilai_(nilai) {}

    double baca() const override { return nilai_; }

private:
    double nilai_;
};

int main() {
    std::vector<std::unique_ptr<Sensor>> daftar;
    daftar.push_back(std::make_unique<Suhu>("ruang", 27.5));
    daftar.push_back(std::make_unique<Suhu>("luar", 31.2));

    for (const auto& sensor : daftar) {
        std::cout << sensor->nama() << ": " << sensor->baca() << std::endl;
    }
    return 0;
}
`,
      ),
      "Perhatikan virtual ~Sensor() = default. Destruktor pada kelas dasar wajib virtual jika objek turunan dihapus lewat pointer kelas dasar; tanpa itu, destruktor turunan tidak dipanggil dan sumber dayanya bocor.",
      "Move semantics menghindari penyalinan mahal. Sebuah objek dipindahkan ketika sumbernya berupa rvalue (nilai sementara). std::move hanyalah cast ke rvalue reference; ia sendiri tidak memindahkan apa pun, yang benar-benar memindahkan adalah move constructor atau move assignment yang dipanggil setelahnya.",
      "Contoh 3 - memindahkan vector alih-alih menyalinnya:",
      code(
        "cpp",
        `
#include <iostream>
#include <utility>
#include <vector>

std::vector<int> buatData() {
    std::vector<int> data(1000000, 7);
    return data;   // dikembalikan dengan move atau elisi, bukan salinan penuh
}

int main() {
    std::vector<int> a(5, 1);
    std::vector<int> b = std::move(a);

    std::cout << "b: " << b.size() << std::endl;   // 5
    std::cout << "a: " << a.size() << std::endl;   // 0, sudah dipindahkan

    std::vector<int> c = buatData();
    std::cout << "c: " << c.size() << std::endl;   // 1000000
    return 0;
}
`,
      ),
      "Setelah objek dipindahkan, jangan memakai nilainya kecuali untuk memberinya nilai baru atau menghancurkannya. Ini sumber bug yang halus: kode tetap berjalan tetapi menghasilkan data kosong.",
      "Aturan praktis kepemilikan: pakai nilai biasa untuk tipe kecil, const reference untuk parameter baca, unique_ptr untuk kepemilikan tunggal, shared_ptr hanya jika kepemilikan memang bersama, dan pointer mentah atau reference hanya untuk meminjam tanpa memiliki.",
      "Template membuat kode generik yang diperiksa saat kompilasi. Fungsi template dengan parameter tipe memungkinkan satu implementasi dipakai untuk banyak tipe, tanpa biaya runtime seperti pada virtual dispatch.",
      "Contoh 4 - template fungsi dan kelas:",
      code(
        "cpp",
        `
#include <iostream>
#include <stdexcept>
#include <vector>

template <typename T>
T maksimum(const std::vector<T>& data) {
    if (data.empty()) {
        throw std::invalid_argument("data kosong");
    }
    T hasil = data[0];
    for (const T& nilai : data) {
        if (nilai > hasil) {
            hasil = nilai;
        }
    }
    return hasil;
}

template <typename T>
class Tumpukan {
public:
    void dorong(const T& nilai) { isi_.push_back(nilai); }

    T ambil() {
        if (isi_.empty()) {
            throw std::out_of_range("tumpukan kosong");
        }
        T nilai = isi_.back();
        isi_.pop_back();
        return nilai;
    }

    std::size_t ukuran() const { return isi_.size(); }

private:
    std::vector<T> isi_;
};

int main() {
    std::cout << maksimum<int>({3, 9, 4}) << std::endl;        // 9
    std::cout << maksimum<double>({1.5, 0.2}) << std::endl;    // 1.5

    Tumpukan<std::string> tumpukan;
    tumpukan.dorong("a");
    tumpukan.dorong("b");
    std::cout << tumpukan.ambil() << std::endl;                // b
    return 0;
}
`,
      ),
      "STL menyediakan algoritma siap pakai di header algorithm. Menggabungkan algoritma dengan lambda lebih aman daripada menulis loop manual, karena batas iterator dan kondisi berhenti sudah ditangani pustaka.",
      "Contoh 5 - sort, find_if, count_if, dan accumulate:",
      code(
        "cpp",
        `
#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> nilai{72, 90, 65, 88, 95};

    std::sort(nilai.begin(), nilai.end());

    auto lulus = std::find_if(nilai.begin(), nilai.end(), [](int n) { return n >= 75; });
    if (lulus != nilai.end()) {
        std::cout << "nilai lulus pertama: " << *lulus << std::endl;   // 88
    }

    int jumlahLulus = static_cast<int>(
        std::count_if(nilai.begin(), nilai.end(), [](int n) { return n >= 75; }));
    int total = std::accumulate(nilai.begin(), nilai.end(), 0);

    std::cout << "jumlah lulus: " << jumlahLulus << std::endl;   // 4
    std::cout << "total: " << total << std::endl;                // 410
    return 0;
}
`,
      ),
      "Iterator bisa menjadi tidak valid setelah container berubah. Menyimpan iterator ke elemen vector lalu memanggil push_back dapat memicu realokasi, sehingga iterator lama menunjuk memori yang sudah dilepas. Jika butuh iterator stabil, pakai std::list atau std::map, atau simpan indeks, bukan iterator.",
      "Undefined behavior adalah hal terburuk di C++: program bisa berjalan normal saat diuji lalu crash di pengguna. Penyebab umumnya adalah membaca memori yang sudah dilepas, mengakses array di luar batas, memakai variabel sebelum diinisialisasi, dan integer overflow bertanda. Compiler modern bisa mendeteksi sebagian dengan flag -fsanitize=address,undefined.",
      "Poin Penting:",
      `1. Ikuti rule of zero: biarkan kelas memakai anggota yang mengelola sumber daya sendiri, sehingga tidak perlu menulis destruktor dan copy/move manual.
2. Jangan pernah memakai new dan delete langsung; gunakan make_unique dan make_shared.
3. Kelas dasar yang dipakai secara polimorfik wajib punya virtual destructor.
4. std::move hanya cast; pastikan ada move constructor atau move assignment yang dipanggil.
5. Jangan memakai objek setelah dipindahkan selain untuk memberinya nilai baru.
6. Iterasi dengan const auto& agar tidak menyalin objek besar.
7. Aktifkan peringatan compiler (-Wall -Wextra) dan sanitizer saat pengembangan.`,
      "Latihan: buat hierarki kelas Bentuk dengan method virtual luas() dan keliling(), simpan objek-objeknya dalam vector<unique_ptr<Bentuk>>, urutkan berdasarkan luas memakai lambda, lalu hitung total luas dengan accumulate dan pastikan tidak ada kebocoran memori saat dijalankan dengan -fsanitize=address.",
    ),
  },
  {
    categorySlug: "sql",
    title: "SQL Lanjutan: Window Function, CTE, Index, dan Optimasi Query",
    slug: "sql-lanjutan",
    summary: "Tingkatkan query dari sekadar jalan menjadi cepat dan benar: window function, CTE rekursif, strategi index, EXPLAIN, transaksi, dan jebakan NULL.",
    difficulty: "advanced",
    estimatedMinutes: 42,
    content: doc(
      "Query SQL yang benar belum tentu cepat, dan query yang cepat belum tentu benar. Materi ini membahas alat untuk keduanya: window function dan CTE untuk menyusun query yang rumit dengan rapi, index dan EXPLAIN untuk membuatnya cepat, serta transaksi dan penanganan NULL agar hasilnya tepat.",
      "Window function menghitung nilai berdasarkan sekumpulan baris terkait tanpa menggabungkan baris seperti GROUP BY. Jumlah baris hasil tetap sama, dan setiap baris mendapat nilai tambahan dari jendela (window) yang ditentukan lewat OVER.",
      "Contoh 1 - memberi peringkat nilai di dalam setiap kategori:",
      code(
        "sql",
        `
SELECT
  kategori,
  judul,
  nilai,
  ROW_NUMBER() OVER (PARTITION BY kategori ORDER BY nilai DESC) AS nomor,
  RANK()       OVER (PARTITION BY kategori ORDER BY nilai DESC) AS peringkat,
  DENSE_RANK() OVER (PARTITION BY kategori ORDER BY nilai DESC) AS peringkat_rapat
FROM materi
ORDER BY kategori, nomor;
`,
      ),
      "Perbedaan ketiga fungsi itu penting. ROW_NUMBER selalu memberi nomor unik berurutan. RANK memberi nomor sama untuk nilai seri lalu melompati nomor berikutnya (1, 1, 3). DENSE_RANK memberi nomor sama tanpa melompati (1, 1, 2).",
      "Contoh 2 - mengambil tiga nilai teratas per kategori memakai subquery dari window function:",
      code(
        "sql",
        `
WITH berperingkat AS (
  SELECT
    kategori,
    judul,
    nilai,
    ROW_NUMBER() OVER (PARTITION BY kategori ORDER BY nilai DESC) AS nomor
  FROM materi
)
SELECT kategori, judul, nilai
FROM berperingkat
WHERE nomor <= 3
ORDER BY kategori, nomor;
`,
      ),
      "Window function juga bisa menghitung agregat berjalan (running total) dan perbandingan dengan baris sebelumnya. Frame default adalah dari awal partisi sampai baris saat ini jika ada ORDER BY.",
      "Contoh 3 - total berjalan dan selisih dengan baris sebelumnya:",
      code(
        "sql",
        `
SELECT
  tanggal,
  jumlah_pendaftar,
  SUM(jumlah_pendaftar) OVER (ORDER BY tanggal) AS total_berjalan,
  jumlah_pendaftar - LAG(jumlah_pendaftar) OVER (ORDER BY tanggal) AS selisih
FROM statistik_harian
ORDER BY tanggal;
`,
      ),
      "CTE (Common Table Expression) dengan WITH memberi nama pada subquery sehingga query panjang bisa dibaca bertahap. CTE rekursif dipakai untuk struktur berjenjang seperti kategori bertingkat, bagan organisasi, atau deret angka.",
      "Contoh 4 - CTE rekursif untuk menelusuri kategori induk dan anak:",
      code(
        "sql",
        `
WITH RECURSIVE pohon AS (
  SELECT id, nama, induk_id, 0 AS kedalaman
  FROM kategori
  WHERE induk_id IS NULL

  UNION ALL

  SELECT k.id, k.nama, k.induk_id, p.kedalaman + 1
  FROM kategori k
  JOIN pohon p ON k.induk_id = p.id
)
SELECT kedalaman, nama
FROM pohon
ORDER BY kedalaman, nama;
`,
      ),
      "Syarat CTE rekursif adalah bagian awal (anchor) dan bagian berulang yang dihubungkan UNION ALL, serta kondisi berhenti yang jelas. Tanpa kondisi berhenti, query akan berjalan terus sampai kehabisan sumber daya.",
      "Index mempercepat pencarian dengan mengorbankan ruang penyimpanan dan sedikit memperlambat INSERT, UPDATE, dan DELETE. Index B-tree dipakai untuk perbandingan =, <, >, serta rentang, dan bisa melayani ORDER BY jika urutannya sesuai.",
      "Contoh 5 - index tunggal dan index gabungan:",
      code(
        "sql",
        `
CREATE INDEX idx_materi_status ON materi (status);
CREATE INDEX idx_materi_kategori_nilai ON materi (kategori, nilai DESC);
`,
      ),
      "Index gabungan mengikuti aturan prefix kiri. Index (kategori, nilai) bisa dipakai untuk filter kategori saja atau kategori dan nilai, tetapi tidak untuk filter nilai saja. Urutan kolom ditentukan oleh pola query yang paling sering, bukan oleh urutan kolom di tabel.",
      "Contoh 6 - query yang memakai index dan yang tidak:",
      code(
        "sql",
        `
-- Memakai index: kolom dibandingkan langsung
SELECT id, judul FROM materi WHERE kategori = 'sql' ORDER BY nilai DESC LIMIT 10;

-- Tidak memakai index: fungsi diterapkan pada kolom
SELECT id FROM materi WHERE LOWER(judul) = 'sql dasar';

-- Tidak memakai index: wildcard di awal pola
SELECT id FROM materi WHERE judul LIKE '%dasar';
`,
      ),
      "EXPLAIN menunjukkan rencana eksekusi tanpa menjalankan query, sedangkan EXPLAIN ANALYZE benar-benar menjalankan query dan menampilkan waktu nyata. Perhatikan Seq Scan pada tabel besar, perkiraan baris yang jauh berbeda dari kenyataan, dan Nested Loop yang berulang sangat banyak.",
      "Contoh 7 - membaca rencana eksekusi:",
      code(
        "sql",
        `
EXPLAIN ANALYZE
SELECT id, judul
FROM materi
WHERE kategori = 'sql'
ORDER BY nilai DESC
LIMIT 10;
`,
      ),
      "NULL bukan nilai, melainkan ketiadaan nilai. Perbandingan apa pun dengan NULL menghasilkan UNKNOWN, sehingga WHERE kolom = NULL tidak pernah benar; gunakan IS NULL atau IS NOT NULL. Jebakan paling berbahaya adalah NOT IN dengan subquery yang mengandung NULL: hasilnya selalu kosong karena perbandingan menjadi UNKNOWN.",
      "Contoh 8 - NOT IN yang salah dan penggantinya:",
      code(
        "sql",
        `
-- Berbahaya: jika satu baris sessions.user_id bernilai NULL,
-- query ini tidak mengembalikan baris apa pun.
SELECT * FROM users
WHERE id NOT IN (SELECT user_id FROM sessions);

-- Aman dan biasanya lebih cepat
SELECT u.* FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM sessions s WHERE s.user_id = u.id
);
`,
      ),
      "Transaksi mengelompokkan beberapa perintah agar berhasil semua atau batal semua. Sifat ACID menjamin atomicity, consistency, isolation, dan durability. Tingkat isolasi menentukan trade-off antara konsistensi dan konkurensi; READ COMMITTED adalah bawaan PostgreSQL, sedangkan SERIALIZABLE paling ketat tetapi paling banyak memicu pengulangan transaksi.",
      "Contoh 9 - transaksi untuk memindahkan saldo:",
      code(
        "sql",
        `
BEGIN;

UPDATE rekening SET saldo = saldo - 100000 WHERE id = 1;
UPDATE rekening SET saldo = saldo + 100000 WHERE id = 2;

-- Jika ada perintah yang gagal, batalkan semuanya
COMMIT;
`,
      ),
      "Poin Penting:",
      `1. Window function menambah kolom tanpa mengurangi jumlah baris; GROUP BY justru menggabungkan baris.
2. ROW_NUMBER unik, RANK melompati nomor seri, DENSE_RANK tidak melompati.
3. CTE rekursif wajib punya kondisi berhenti agar tidak berjalan tanpa akhir.
4. Index gabungan hanya berguna jika kolom paling kiri ikut difilter.
5. Fungsi pada kolom dan wildcard di awal LIKE membuat index tidak terpakai.
6. Jangan memakai NOT IN jika subquery bisa mengandung NULL; pakai NOT EXISTS.
7. Ukur sebelum mengoptimasi: bandingkan EXPLAIN ANALYZE sebelum dan sesudah perubahan.`,
      "Latihan: dari tabel materi dengan kolom kategori, nilai, dan tanggal_terbit, buat query yang menampilkan tiga materi terbaru per kategori, lalu tambahkan kolom rata-rata nilai kategori tersebut, dan periksa dengan EXPLAIN ANALYZE apakah index gabungan benar-benar dipakai.",
    ),
  },
  {
    categorySlug: "matematika-diskrit",
    title: "Matematika Diskrit Lanjutan: Induksi, Relasi, dan Pohon",
    slug: "matematika-diskrit-lanjutan",
    summary: "Teknik pembuktian dan struktur lanjutan: induksi kuat, relasi rekurensi, relasi ekuivalensi dan urutan parsial, prinsip pigeonhole, serta pohon dan lintasan pada graf.",
    difficulty: "advanced",
    estimatedMinutes: 42,
    content: doc(
      "Matematika diskrit lanjutan berisi alat untuk membuktikan pernyataan dan memodelkan hubungan antarobjek. Empat topik yang paling sering muncul di kuliah dan wawancara teknis adalah induksi matematika, relasi rekurensi, relasi biner, dan teori graf.",
      "Induksi matematika membuktikan pernyataan P(n) untuk semua bilangan asli n dengan dua langkah: basis (buktikan P(1) atau P(0) benar) dan langkah induksi (asumsikan P(k) benar, buktikan P(k+1) benar). Kesalahan paling umum adalah melupakan basis atau memakai asumsi yang justru ingin dibuktikan.",
      "Contoh 1 - buktikan bahwa 1 + 2 + ... + n = n(n+1)/2.",
      `Bukti dengan induksi:
Basis: untuk n = 1, ruas kiri = 1, ruas kanan = 1(2)/2 = 1. Benar.
Langkah induksi: asumsikan 1 + 2 + ... + k = k(k+1)/2 untuk suatu k >= 1.
Maka 1 + 2 + ... + k + (k+1) = k(k+1)/2 + (k+1)
= (k+1)(k/2 + 1)
= (k+1)(k+2)/2.
Bentuk terakhir sama dengan rumus untuk n = k+1, sehingga pernyataan terbukti.`,
      "Induksi kuat (strong induction) mengasumsikan P(1), P(2), ..., P(k) semuanya benar untuk membuktikan P(k+1). Teknik ini diperlukan untuk pernyataan yang bergantung pada lebih dari satu nilai sebelumnya, misalnya pembuktian bahwa setiap bilangan bulat lebih besar dari 1 bisa ditulis sebagai hasil kali bilangan prima.",
      "Relasi rekurensi mendefinisikan barisan lewat suku-suku sebelumnya. Menyelesaikan relasi berarti menemukan rumus tertutup atau setidaknya orde pertumbuhannya. Untuk algoritma divide and conquer, bentuk T(n) = aT(n/b) + f(n) diselesaikan dengan master theorem.",
      "Contoh 2 - hitung T(n) = 2T(n/2) + n dengan T(1) = 1.",
      `Pohon rekursi:
Tingkat 0: biaya n, jumlah subproblem 1.
Tingkat 1: 2 subproblem masing-masing n/2, total biaya n.
Tingkat 2: 4 subproblem masing-masing n/4, total biaya n.
Pola berlanjut sampai ukuran subproblem menjadi 1, yaitu setelah log2(n) tingkat.
Total biaya = n dikali (log2(n) + 1) = n log n + n.
Jadi T(n) = Theta(n log n), yang menjelaskan kompleksitas merge sort.`,
      "Relasi biner pada himpunan A adalah himpunan pasangan terurut dari A x A. Relasi ekuivalensi memenuhi tiga sifat: refleksif (aRa), simetris (aRb berarti bRa), dan transitif (aRb dan bRc berarti aRc). Setiap relasi ekuivalensi memecah himpunan menjadi kelas-kelas ekuivalensi yang saling lepas.",
      "Contoh 3 - relasi kongruen modulo 3 adalah relasi ekuivalensi pada bilangan bulat.",
      `Definisikan a R b jika dan hanya jika a - b habis dibagi 3.
Refleksif: a - a = 0 habis dibagi 3, jadi aRa.
Simetris: jika a - b = 3k, maka b - a = -3k juga habis dibagi 3, jadi bRa.
Transitif: jika a - b = 3m dan b - c = 3n, maka a - c = 3(m + n) habis dibagi 3, jadi aRc.
Kelas ekuivalensinya adalah {0, 3, 6, ...}, {1, 4, 7, ...}, dan {2, 5, 8, ...}.`,
      "Relasi urutan parsial (partial order) memenuhi refleksif, antisimetris (aRb dan bRa berarti a = b), dan transitif. Contohnya relasi habis membagi pada bilangan bulat positif dan relasi himpunan bagian pada himpunan kuasa. Relasi ini digambarkan dengan diagram Hasse, yaitu graf tanpa panah dan tanpa sisi yang bisa disimpulkan lewat transitivitas.",
      "Prinsip pigeonhole menyatakan bahwa jika n objek ditempatkan ke dalam m wadah dengan n > m, maka sedikitnya satu wadah berisi lebih dari satu objek. Prinsip sederhana ini sering dipakai untuk membuktikan keberadaan, bukan menghitung.",
      "Contoh 4 - buktikan bahwa di antara 13 orang, ada dua yang lahir pada bulan yang sama.",
      `Ada 12 bulan sebagai wadah dan 13 orang sebagai objek.
Karena 13 > 12, menurut prinsip pigeonhole sedikitnya satu bulan memuat dua orang atau lebih.
Jadi pasti ada dua orang yang lahir pada bulan yang sama.`,
      "Pohon adalah graf terhubung tanpa siklus. Tiga sifat ekuivalen yang penting: pohon dengan n simpul selalu memiliki tepat n - 1 sisi; menambahkan satu sisi ke pohon selalu membentuk siklus; dan di antara dua simpul di pohon terdapat tepat satu lintasan sederhana.",
      "Contoh 5 - periksa apakah graf berikut pohon: simpul {A, B, C, D} dengan sisi AB, BC, CD, DA.",
      `Graf memiliki 4 simpul dan 4 sisi.
Syarat pohon adalah n - 1 = 3 sisi. Karena ada 4 sisi, graf ini bukan pohon.
Memang sisi AB, BC, CD, DA membentuk siklus A-B-C-D-A, sehingga graf tidak asiklik.`,
      "Algoritma Kruskal mencari pohon rentang minimum (minimum spanning tree) dengan mengurutkan sisi dari bobot terkecil lalu mengambil sisi selama tidak membentuk siklus. Pemeriksaan siklus memakai struktur union-find. Algoritma Prim tumbuh dari satu simpul dan selalu memilih sisi termurah yang menghubungkan pohon dengan simpul di luar pohon.",
      "Contoh 6 - Kruskal pada graf dengan sisi berbobot AB = 1, BC = 2, AC = 3, CD = 4.",
      `Urutkan sisi: AB (1), BC (2), AC (3), CD (4).
Ambil AB (1): belum ada siklus, terima.
Ambil BC (2): belum ada siklus, terima.
Ambil AC (3): A, B, C sudah terhubung, sisi ini membentuk siklus, tolak.
Ambil CD (4): belum ada siklus, terima.
Total bobot pohon rentang minimum = 1 + 2 + 4 = 7, dengan 3 sisi untuk 4 simpul.`,
      "Lintasan Euler mengunjungi setiap sisi tepat satu kali; lintasan Hamilton mengunjungi setiap simpul tepat satu kali. Graf terhubung memiliki sirkuit Euler jika dan hanya jika setiap simpul berderajat genap. Menentukan apakah graf punya siklus Hamilton termasuk masalah NP-lengkap, sehingga tidak ada algoritma cepat yang diketahui untuk kasus umum.",
      "Pewarnaan graf memberi warna pada simpul sehingga dua simpul bertetangga selalu berbeda warna. Bilangan kromatik adalah jumlah warna minimum. Graf bipartit selalu bisa diwarnai dengan dua warna, dan graf lengkap dengan n simpul membutuhkan n warna.",
      "Poin Penting:",
      `1. Induksi selalu butuh basis; tanpa basis, pembuktian tidak sah.
2. Induksi kuat dipakai jika P(k+1) bergantung pada lebih dari satu nilai sebelumnya.
3. Relasi ekuivalensi memecah himpunan menjadi partisi yang saling lepas.
4. Relasi urutan parsial mengizinkan dua elemen yang tidak bisa dibandingkan.
5. Pohon dengan n simpul memiliki tepat n - 1 sisi dan tidak punya siklus.
6. Kruskal menolak sisi yang membentuk siklus; itu kunci kebenarannya.
7. Sirkuit Euler mensyaratkan semua derajat genap, sedangkan Hamilton jauh lebih sulit.`,
      "Latihan: buktikan dengan induksi bahwa 2 + 4 + 6 + ... + 2n = n(n+1), tentukan kelas ekuivalensi modulo 4 pada bilangan 0 sampai 11, lalu hitung pohon rentang minimum dari graf dengan sisi AB = 4, AC = 1, BC = 2, BD = 5, CD = 3 memakai Kruskal dan sebutkan sisi yang ditolak.",
    ),
  },
  {
    categorySlug: "aljabar-linier",
    title: "Aljabar Linier Lanjutan: Ortogonalitas, Proyeksi, dan SVD",
    slug: "aljabar-linier-lanjutan",
    summary: "Dari eliminasi ke geometri: hasil kali dalam, Gram-Schmidt, proyeksi dan kuadrat terkecil, diagonalisasi, rank-nullity, serta singular value decomposition.",
    difficulty: "advanced",
    estimatedMinutes: 45,
    content: doc(
      "Aljabar linier lanjutan menghubungkan matriks dengan geometri. Setelah bisa menyelesaikan sistem persamaan, langkah berikutnya adalah mengukur sudut dan panjang, mencari hampiran terbaik ketika solusi eksak tidak ada, dan menguraikan matriks menjadi bagian-bagian yang bermakna.",
      "Hasil kali dalam (dot product) dua vektor u dan v di R^n adalah u . v = u1v1 + u2v2 + ... + unvn. Panjang vektor adalah ||u|| = akar(u . u). Dua vektor ortogonal jika u . v = 0. Himpunan vektor ortonormal adalah himpunan ortogonal yang setiap vektornya berpanjang satu.",
      "Contoh 1 - periksa ortogonalitas dan hitung panjang vektor:",
      `u = (1, 2, 2), v = (2, 1, -2).
u . v = 1(2) + 2(1) + 2(-2) = 2 + 2 - 4 = 0, jadi u dan v ortogonal.
||u|| = akar(1 + 4 + 4) = akar(9) = 3.
||v|| = akar(4 + 1 + 4) = akar(9) = 3.
Vektor satuan u adalah (1/3, 2/3, 2/3).`,
      "Proyeksi vektor b pada vektor a adalah (a . b / a . a) a. Vektor sisa b - proyeksi selalu ortogonal terhadap a. Inilah dasar metode kuadrat terkecil: ketika sistem Ax = b tidak punya solusi eksak, kita mencari x yang membuat galat ||Ax - b|| sekecil mungkin.",
      "Contoh 2 - proyeksi b = (3, 1) pada a = (1, 2).",
      `a . b = 1(3) + 2(1) = 5.
a . a = 1 + 4 = 5.
Proyeksi = (5/5)(1, 2) = (1, 2).
Sisa = b - proyeksi = (3, 1) - (1, 2) = (2, -1).
Periksa ortogonalitas: a . sisa = 1(2) + 2(-1) = 0. Benar.`,
      "Persamaan normal untuk kuadrat terkecil adalah (A transpose A) x = A transpose b. Matriks A transpose A selalu simetris dan berukuran kecil (jumlah kolom x jumlah kolom), sehingga sistemnya mudah diselesaikan. Jika kolom A bebas linier, A transpose A dapat dibalik dan solusinya tunggal.",
      "Contoh 3 - cari garis terbaik y = c + d t untuk titik (1, 1), (2, 2), (3, 2).",
      `Susun A dengan kolom 1 dan t, serta b:
A = [[1, 1], [1, 2], [1, 3]], b = [1, 2, 2].

A transpose A = [[3, 6], [6, 14]].
A transpose b = [5, 11].

Sistem: 3c + 6d = 5 dan 6c + 14d = 11.
Dari persamaan pertama: c = (5 - 6d)/3.
Substitusi: 2(5 - 6d) + 14d = 11, sehingga 10 - 12d + 14d = 11 dan 2d = 1.
Didapat d = 0,5 dan c = 2/3.
Jadi garis terbaiknya y = 2/3 + 0,5t, dengan tebakan 1,17; 1,67; dan 2,17 untuk t = 1, 2, 3.`,
      "Proses Gram-Schmidt mengubah himpunan vektor bebas linier menjadi himpunan ortonormal. Untuk setiap vektor, kurangi proyeksinya pada vektor ortonormal yang sudah ada, lalu normalkan hasilnya. Hasilnya dipakai untuk dekomposisi QR, di mana A = QR dengan Q berkolom ortonormal dan R matriks segitiga atas.",
      "Contoh 4 - Gram-Schmidt untuk v1 = (1, 1, 0) dan v2 = (1, 0, 1).",
      `Langkah 1: normalkan v1.
||v1|| = akar(2), sehingga u1 = (1/akar2, 1/akar2, 0).

Langkah 2: kurangi proyeksi v2 pada u1.
v2 . u1 = 1/akar2.
Proyeksi = (1/akar2) u1 = (1/2, 1/2, 0).
w2 = v2 - proyeksi = (1/2, -1/2, 1).

Langkah 3: normalkan w2.
||w2|| = akar(1/4 + 1/4 + 1) = akar(3/2) = akar6/2.
u2 = (1/akar6, -1/akar6, 2/akar6).

Periksa: u1 . u2 = 1/akar12 - 1/akar12 = 0. Benar ortogonal.`,
      "Matriks ortogonal Q memenuhi Q transpose Q = I, sehingga inversnya sama dengan transposenya. Matriks ini mempertahankan panjang dan sudut, karena ||Qx|| = ||x||. Rotasi dan pencerminan adalah contoh matriks ortogonal.",
      "Diagonalisasi: matriks A berukuran n x n dapat ditulis A = P D P invers jika A punya n vektor eigen bebas linier. Matriks simetris selalu bisa didiagonalisasi secara ortogonal, yaitu A = Q D Q transpose dengan Q ortogonal. Sifat ini membuat matriks simetris sangat penting dalam statistik dan optimasi.",
      "Contoh 5 - diagonalisasi ortogonal A = [[2, 1], [1, 2]].",
      `Nilai eigen dari det(A - lambda I) = (2 - lambda)^2 - 1 = lambda^2 - 4 lambda + 3 = 0,
sehingga lambda = 1 dan lambda = 3.
Untuk lambda = 1: (A - I)v = 0 memberi v1 + v2 = 0, vektor eigen (1, -1).
Untuk lambda = 3: (A - 3I)v = 0 memberi -v1 + v2 = 0, vektor eigen (1, 1).
Kedua vektor ortogonal karena (1)(1) + (-1)(1) = 0, sesuai sifat matriks simetris.
Setelah dinormalkan, Q berkolom (1/akar2, -1/akar2) dan (1/akar2, 1/akar2), dan A = Q D Q transpose dengan D = diag(1, 3).`,
      "Teorema rank-nullity menyatakan bahwa untuk matriks A berukuran m x n, rank(A) + nullity(A) = n. Rank adalah jumlah kolom bebas linier, sedangkan nullity adalah dimensi ruang nol (himpunan solusi Ax = 0). Teorema ini menjelaskan mengapa sistem dengan lebih banyak variabel daripada persamaan cenderung punya solusi tak hingga.",
      "Contoh 6 - hitung rank dan nullity matriks A = [[1, 2, 3], [2, 4, 6]].",
      `Baris kedua adalah dua kali baris pertama, jadi hanya ada satu baris bebas linier.
rank(A) = 1.
Jumlah kolom n = 3, sehingga nullity = 3 - 1 = 2.
Artinya ruang solusi Ax = 0 berdimensi 2: dua variabel bebas dan satu variabel terikat.`,
      "Singular value decomposition (SVD) menguraikan sembarang matriks menjadi A = U Sigma V transpose, dengan U dan V ortogonal serta Sigma diagonal berisi nilai singular yang tidak negatif dan terurut menurun. Nilai singular adalah akar dari nilai eigen A transpose A. SVD berlaku untuk matriks persegi maupun persegi panjang, berbeda dengan diagonalisasi biasa.",
      "SVD berguna untuk kompresi dan reduksi dimensi. Dengan mengambil hanya k nilai singular terbesar, kita memperoleh hampiran rank-k terbaik menurut norma Frobenius (teorema Eckart-Young). Inilah dasar PCA, sistem rekomendasi, dan kompresi gambar.",
      "Contoh 7 - nilai singular matriks A = [[3, 0], [0, 2]].",
      `A transpose A = [[9, 0], [0, 4]], sehingga nilai eigennya 9 dan 4.
Nilai singular adalah akar nilai eigen: sigma1 = 3 dan sigma2 = 2.
Rank A = 2 karena kedua nilai singular positif.
Hampiran rank-1 terbaik diperoleh dengan mempertahankan sigma1 saja.`,
      "Poin Penting:",
      `1. Dua vektor ortogonal jika hasil kali dalamnya nol; ortonormal berarti ortogonal sekaligus berpanjang satu.
2. Sisa proyeksi selalu ortogonal terhadap vektor proyeksinya.
3. Kuadrat terkecil memakai persamaan normal A transpose A x = A transpose b.
4. Gram-Schmidt harus mengurangi proyeksi pada semua vektor yang sudah dinormalkan.
5. Matriks ortogonal punya invers sama dengan transposenya dan mempertahankan panjang.
6. Matriks simetris selalu dapat didiagonalisasi secara ortogonal.
7. rank + nullity = jumlah kolom, dan SVD berlaku untuk semua bentuk matriks.`,
      "Latihan: cari proyeksi b = (4, 2) pada a = (1, 1), tentukan garis kuadrat terkecil untuk titik (0, 1), (1, 2), (2, 2), lalu hitung rank dan nullity matriks [[1, 2], [3, 6]].",
    ),
  },
  {
    categorySlug: "fisika-dasar",
    title: "Fisika Lanjutan: Rotasi, Osilasi, Termodinamika, dan Medan Listrik",
    slug: "fisika-lanjutan",
    summary: "Perluas mekanika ke gerak rotasi dan getaran, lalu masuk ke termodinamika dan listrik: torsi, momen inersia, hukum I dan II, mesin Carnot, hukum Coulomb, dan kapasitor.",
    difficulty: "advanced",
    estimatedMinutes: 45,
    content: doc(
      "Fisika lanjutan menyatukan kembali topik yang tampak berbeda. Gerak rotasi memakai besaran yang sama dengan gerak lurus, hanya dengan nama berbeda. Getaran muncul dari gaya pemulih yang sebanding simpangan. Termodinamika membahas pertukaran energi, dan listrik membahas gaya antar muatan. Semuanya dapat diselesaikan dengan prinsip kekekalan energi.",
      "Pada gerak rotasi, torsi adalah padanan gaya: tau = r F sin theta, dengan satuan newton meter. Momen inersia I adalah padanan massa dan bergantung pada distribusi massa terhadap sumbu putar. Hukum II Newton untuk rotasi adalah tau = I alpha. Momentum sudut L = I omega kekal jika torsi total nol, misalnya pada penari es yang menarik tangannya sehingga omega bertambah.",
      "Contoh 1 - roda dengan momen inersia 2 kg m^2 dikenai torsi 6 N m. Berapa percepatan sudutnya?",
      `Gunakan tau = I alpha.
alpha = tau / I = 6 / 2 = 3 rad/s^2.
Jika roda mulai dari diam, kecepatan sudutnya setelah 4 sekon adalah omega = alpha t = 12 rad/s.`,
      "Getaran harmonik sederhana terjadi jika gaya pemulih sebanding simpangan dan berlawanan arah, F = -k x. Solusinya berupa sinusoida dengan frekuensi sudut omega = akar(k/m) dan periode T = 2 pi akar(m/k). Untuk bandul sederhana dengan simpul kecil, T = 2 pi akar(L/g), sehingga periode tidak bergantung pada massa beban.",
      "Contoh 2 - pegas dengan k = 200 N/m dan beban 2 kg. Hitung periode dan frekuensinya.",
      `omega = akar(k/m) = akar(200/2) = akar(100) = 10 rad/s.
T = 2 pi / omega = 2 pi / 10 = 0,628 sekon.
Frekuensi f = 1/T = 1,59 Hz.
Energi total osilasi bergantung amplitudo: E = setengah k A^2.`,
      "Pada getaran, energi terus berubah antara energi kinetik dan energi potensial, tetapi jumlahnya tetap jika tidak ada redaman. Pada simpangan maksimum seluruh energi berbentuk potensial, dan pada titik setimbang seluruhnya berbentuk kinetik.",
      "Termodinamika membahas energi dalam, kalor, dan kerja. Hukum I menyatakan perubahan energi dalam sama dengan kalor yang masuk dikurangi kerja yang dilakukan sistem: delta U = Q - W. Hukum II menyatakan bahwa kalor tidak dapat berpindah sendiri dari benda dingin ke benda panas tanpa kerja luar, dan entropi semesta selalu bertambah pada proses nyata.",
      "Contoh 3 - gas menyerap 500 J kalor dan melakukan kerja 200 J. Berapa perubahan energi dalamnya?",
      `delta U = Q - W = 500 - 200 = 300 J.
Energi dalam bertambah 300 J, sehingga suhu gas naik.`,
      "Efisiensi mesin kalor adalah kerja berguna dibagi kalor yang masuk. Efisiensi maksimum yang mungkin dicapai adalah efisiensi Carnot, yang hanya bergantung pada suhu mutlak reservoir: eta = 1 - Tc/Th. Tidak ada mesin nyata yang bisa melebihi nilai ini.",
      "Contoh 4 - mesin bekerja antara 600 K dan 300 K. Berapa efisiensi maksimumnya?",
      `eta = 1 - Tc/Th = 1 - 300/600 = 1 - 0,5 = 0,5.
Efisiensi maksimum 50 persen.
Jika mesin menyerap 1000 J dari reservoir panas, kerja maksimum yang bisa dihasilkan adalah 500 J, dan sisanya 500 J dibuang ke reservoir dingin.`,
      "Gas ideal mengikuti PV = nRT dengan R = 8,314 J/(mol K). Pada proses isotermal, suhu tetap sehingga PV konstan. Pada proses isokhorik, volume tetap sehingga kerja nol dan seluruh kalor mengubah energi dalam. Pada proses adiabatik, tidak ada pertukaran kalor sehingga Q = 0 dan delta U = -W.",
      "Contoh 5 - dua mol gas ideal pada 300 K menempati volume 0,05 m^3. Berapa tekanannya?",
      `P = nRT / V = 2 x 8,314 x 300 / 0,05.
Pembilang: 2 x 8,314 x 300 = 4988,4.
P = 4988,4 / 0,05 = 99.768 Pa, sekitar 99,8 kPa.`,
      "Listrik dasar dimulai dari hukum Coulomb: gaya antara dua muatan sebanding hasil kali muatannya dan berbanding terbalik dengan kuadrat jarak, F = k q1 q2 / r^2 dengan k sekitar 9 x 10^9 N m^2/C^2. Medan listrik E adalah gaya per satuan muatan, E = F/q, dan untuk muatan titik E = k q / r^2.",
      "Contoh 6 - dua muatan 2 mikroC dan 3 mikroC terpisah 0,3 m. Berapa gaya Coulombnya?",
      `F = k q1 q2 / r^2
= 9 x 10^9 x (2 x 10^-6) x (3 x 10^-6) / (0,3)^2
= 9 x 10^9 x 6 x 10^-12 / 0,09
= 0,054 / 0,09
= 0,6 N.
Karena kedua muatan sama-sama positif, gaya yang bekerja adalah gaya tolak-menolak.`,
      "Potensial listrik V adalah energi potensial per satuan muatan, V = k q / r. Beda potensial antara dua titik menentukan kerja yang dibutuhkan untuk memindahkan muatan: W = q delta V. Potensial adalah besaran skalar sehingga lebih mudah dijumlahkan daripada medan listrik yang merupakan vektor.",
      "Kapasitor menyimpan muatan dengan C = Q/V. Untuk kapasitor pelat sejajar, C = epsilon0 A / d, sehingga kapasitansi bertambah jika luas pelat diperbesar atau jarak diperkecil. Energi yang tersimpan adalah setengah C V^2.",
      "Contoh 7 - kapasitor 4 mikroF dihubungkan ke tegangan 12 V. Hitung muatan dan energi tersimpan.",
      `Q = C V = 4 x 10^-6 x 12 = 48 x 10^-6 C = 48 mikroC.
E = setengah C V^2 = 0,5 x 4 x 10^-6 x 144 = 288 x 10^-6 J = 288 mikroJ.`,
      "Poin Penting:",
      `1. Torsi menggantikan gaya, momen inersia menggantikan massa, dan alpha menggantikan percepatan pada gerak rotasi.
2. Momentum sudut kekal jika torsi total nol; ini menjelaskan perubahan kecepatan putar saat momen inersia berubah.
3. Periode pegas bergantung pada massa, sedangkan periode bandul tidak.
4. Gunakan suhu mutlak (kelvin) pada semua rumus termodinamika.
5. Efisiensi Carnot adalah batas atas; mesin nyata selalu lebih rendah karena gesekan dan kebocoran kalor.
6. Gaya Coulomb sebanding hasil kali muatan dan berbanding terbalik dengan kuadrat jarak.
7. Periksa arah gaya listrik: muatan sejenis tolak-menolak, berbeda jenis tarik-menarik.`,
      "Latihan: sebuah roda berjari-jari 0,4 m dikenai gaya 15 N pada tepinya, hitung torsi dan percepatan sudutnya jika momen inersianya 1,2 kg m^2; lalu hitung periode pegas dengan k = 50 N/m dan massa 0,5 kg, dan tentukan efisiensi Carnot antara 500 K dan 350 K.",
    ),
  },
];

export const toolMaterials: MaterialSeed[] = [
  {
    categorySlug: "alat-dev",
    title: "Visual Studio Code: Pengertian, Kegunaan, dan Alur Kerja",
    slug: "visual-studio-code",
    summary: "Kenali VS Code dari nol: apa bedanya dengan IDE, bagian antarmukanya, shortcut penting, pengaturan, ekstensi wajib, serta cara memakai terminal dan debugger di dalamnya.",
    difficulty: "beginner",
    estimatedMinutes: 25,
    content: doc(
      "Visual Studio Code (VS Code) adalah editor kode sumber gratis dan open source yang dibuat Microsoft dan dirilis pada 2015. VS Code berjalan di Windows, macOS, dan Linux karena dibangun dengan Electron. Walaupun ringan, ia bisa menjadi hampir selengkap IDE berkat sistem ekstensi.",
      "Penting membedakan editor dan IDE. Editor hanya membantu menulis kode: menyorot sintaks, memberi saran, dan memformat. IDE (Integrated Development Environment) menambahkan compiler, debugger, manajemen proyek, dan alat pengujian dalam satu paket. VS Code berada di tengah: inti editor yang ringan, lalu fitur IDE ditambahkan sesuai kebutuhan lewat ekstensi. Contoh IDE penuh adalah Visual Studio (bukan VS Code), IntelliJ IDEA, dan Android Studio.",
      "Kegunaan VS Code sehari-hari: menulis dan mengedit kode berbagai bahasa, memberi saran otomatis (IntelliSense) termasuk dokumentasi fungsi, menelusuri definisi dan referensi, menjalankan terminal di dalam editor, mengelola Git, menjalankan dan menghentikan program, memasang debugger, serta menyunting file di server jarak jauh.",
      "Antarmuka VS Code terdiri dari lima bagian. Activity Bar di paling kiri berisi ikon Explorer, Search, Source Control, Run and Debug, dan Extensions. Side Bar menampilkan isi ikon yang dipilih. Editor Group di tengah menampilkan file yang dibuka. Panel di bawah berisi Terminal, Problems, Output, dan Debug Console. Status Bar di paling bawah menampilkan informasi seperti bahasa file, posisi kursor, dan branch Git.",
      "Command Palette adalah pintu masuk ke hampir semua perintah. Tekan Ctrl+Shift+P (Windows dan Linux) atau Cmd+Shift+P (macOS), lalu ketik nama perintah, misalnya Format Document atau Toggle Terminal. Kalau lupa letak sebuah fitur, cari di sini sebelum menelusuri menu.",
      "Shortcut yang paling menghemat waktu:",
      `1. Ctrl+P - buka file dengan cepat berdasarkan nama.
2. Ctrl+Shift+P - Command Palette.
3. Ctrl + tombol backtick - buka atau tutup terminal terintegrasi.
4. Ctrl+Shift+F - cari teks di seluruh proyek.
5. Ctrl+B - sembunyikan atau tampilkan Side Bar.
6. Ctrl+D - pilih kemunculan berikutnya dari kata yang sedang dipilih (multi-cursor).
7. Alt+Klik - tambahkan kursor di beberapa tempat sekaligus.
8. F5 - mulai debugging, Ctrl+F5 - jalankan tanpa debugging.
9. Ctrl+/ - jadikan baris sebagai komentar.
10. Alt+Shift+F - format seluruh dokumen.`,
      "Pengaturan VS Code disimpan dalam settings.json. Ada dua tingkat: User Settings yang berlaku di semua proyek, dan Workspace Settings di folder .vscode/settings.json yang hanya berlaku untuk proyek itu. Untuk aturan yang harus sama di tim, simpan di Workspace Settings lalu commit ke Git.",
      "Contoh 1 - isi .vscode/settings.json untuk proyek TypeScript:",
      code(
        "json",
        `
{
  "editor.fontSize": 15,
  "editor.tabSize": 2,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "typescript.tsdk": "node_modules/typescript/lib"
}
`,
      ),
      "Terminal terintegrasi memakai shell bawaan sistem: PowerShell di Windows, zsh atau bash di macOS dan Linux. Buka lewat menu Terminal atau shortcut Ctrl + tombol backtick, lalu jalankan perintah proyek seperti npm install, npm run dev, atau git status tanpa berpindah jendela. Beberapa terminal bisa dibuka bersamaan untuk menjalankan frontend dan backend sekaligus.",
      "Debugger memungkinkan program dihentikan di baris tertentu untuk memeriksa nilai variabel. Konfigurasinya disimpan di .vscode/launch.json. Tanpa konfigurasi, F5 akan mencoba menebak cara menjalankan berkas; untuk proyek nyata, konfigurasi eksplisit jauh lebih andal.",
      "Contoh 2 - launch.json untuk menjalankan server Node.js dengan npm:",
      code(
        "json",
        `
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jalankan backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "aksespintar-backend",
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
`,
      ),
      "Ekstensi menambah kemampuan tanpa memperbesar inti aplikasi. Pasang seperlunya, karena terlalu banyak ekstensi memperlambat startup dan bisa saling bertabrakan. Ekstensi yang umum dipakai untuk proyek web: ESLint untuk menemukan kesalahan, Prettier untuk format konsisten, Prisma untuk skema database, GitLens untuk riwayat Git, dan Error Lens untuk menampilkan error langsung di baris kode.",
      "Remote Development memungkinkan kode dijalankan di tempat lain sambil tetap disunting di VS Code: Remote SSH untuk server, Dev Containers untuk lingkungan Docker, dan WSL untuk Linux di Windows. Ini membuat lingkungan pengembangan sama persis dengan server produksi.",
      "Poin Penting:",
      `1. VS Code adalah editor yang bisa menjadi IDE lewat ekstensi, bukan IDE penuh sejak awal.
2. Command Palette (Ctrl+Shift+P) adalah cara tercepat menemukan perintah.
3. Bedakan User Settings dan Workspace Settings; aturan tim disimpan di Workspace.
4. Simpan .vscode/settings.json dan launch.json di Git agar tim memakai pengaturan yang sama.
5. Pasang ekstensi seperlunya; ekstensi berlebihan memperlambat editor.
6. Aktifkan formatOnSave dan satukan formatter agar tidak terjadi perang format di Git.
7. Gunakan fitur Workspace Trust: jangan menerima folder tidak dikenal dalam mode percaya.`,
      "Latihan: buka folder proyekmu di VS Code, buat .vscode/settings.json dengan tabSize 2 dan formatOnSave aktif, buka terminal terintegrasi, jalankan npm run dev, lalu coba Ctrl+P untuk membuka satu file dan Ctrl+Shift+F untuk mencari kata tertentu di seluruh proyek.",
    ),
  },
  {
    categorySlug: "alat-dev",
    title: "JSON: Pengertian, Aturan Penulisan, dan Penggunaannya",
    slug: "json",
    summary: "Pahami JSON secara menyeluruh: asal-usulnya, aturan sintaks yang ketat, perbedaan dengan objek JavaScript, cara parse dan stringify, jebakan umum, dan penggunaannya di API serta file konfigurasi.",
    difficulty: "beginner",
    estimatedMinutes: 25,
    content: doc(
      "JSON (JavaScript Object Notation) adalah format teks untuk bertukar data. Namanya menyebut JavaScript karena sintaksnya diambil dari cara menulis objek di JavaScript, tetapi JSON sendiri tidak terikat pada bahasa apa pun. JSON distandarkan sebagai RFC 8259 pada 2017 dan ECMA-404, sehingga bisa dibaca oleh Python, Java, Go, PHP, dan bahasa lain dengan hasil yang sama.",
      "JSON dibuat agar data bisa dikirim lewat jaringan dalam bentuk teks yang ringkas dan mudah dibaca manusia. Sebelum JSON populer, XML dipakai untuk tujuan yang sama, tetapi XML jauh lebih panjang karena setiap nilai dibungkus tag pembuka dan penutup.",
      "Aturan sintaks JSON sangat ketat. Kunci wajib berupa string dengan tanda kutip ganda. Nilai hanya boleh berupa string, angka, boolean (true atau false), null, objek, atau array. Tidak boleh ada komentar, tidak boleh ada koma di akhir elemen terakhir, tidak boleh memakai kutip tunggal, dan tidak boleh ada nilai undefined atau fungsi.",
      "Contoh 1 - JSON yang valid:",
      code(
        "json",
        `
{
  "nama": "Rani",
  "umur": 17,
  "aktif": true,
  "alamat": null,
  "hobi": ["membaca", "koding"],
  "sekolah": {
    "nama": "SMA Negeri 1",
    "kelas": 12
  }
}
`,
      ),
      "Contoh 2 - JSON yang tidak valid beserta alasannya:",
      code(
        "json",
        `
{
  'nama': 'Rani',        // salah: kutip tunggal, dan komentar tidak diizinkan
  "umur": 17,            // koma di akhir sebelum kurung tutup juga salah
}
`,
      ),
      "Kesalahan seperti contoh di atas membuat JSON.parse gagal dengan SyntaxError. Editor seperti VS Code memberi garis bawah merah karena itu, dan banyak API menolak permintaan dengan status 400 jika body bukan JSON yang valid.",
      "JSON dan objek JavaScript mirip tetapi tidak identik. Pada objek JavaScript, kunci boleh tanpa tanda kutip, boleh memakai kutip tunggal, boleh berisi komentar, dan boleh berisi fungsi. JSON tidak mengizinkan semua itu. Karena itu JSON.stringify dipakai untuk mengubah objek JavaScript menjadi teks JSON sebelum dikirim, dan JSON.parse untuk mengubah teks JSON kembali menjadi objek.",
      "Contoh 3 - parse dan stringify di JavaScript:",
      code(
        "javascript",
        `
const teks = '{"nama":"Rani","umur":17,"hobi":["membaca","koding"]}';

const data = JSON.parse(teks);
console.log(data.nama);      // Rani
console.log(data.hobi[1]);   // koding

const rapi = JSON.stringify(data, null, 2);
console.log(rapi);
`,
      ),
      "Argumen ketiga pada JSON.stringify mengatur indentasi. Angka 2 berarti dua spasi, yang membuat hasilnya mudah dibaca manusia tetapi lebih besar. Untuk dikirim lewat jaringan, biasanya tanpa indentasi agar lebih hemat. Argumen kedua adalah replacer, yang bisa berupa array nama kunci yang ingin dipertahankan atau fungsi penyaring nilai.",
      "Contoh 4 - replacer untuk memilih kunci tertentu:",
      code(
        "javascript",
        `
const pengguna = {
  id: "u1",
  nama: "Rani",
  email: "rani@example.com",
  passwordHash: "rahasia",
};

const aman = JSON.stringify(pengguna, ["id", "nama", "email"], 2);
console.log(aman);
// Hanya id, nama, dan email yang ikut, passwordHash dibuang.
`,
      ),
      "Beberapa nilai JavaScript tidak bisa dipetakan ke JSON dengan mulus. undefined dan fungsi dihilangkan jika berada di dalam objek, tetapi berubah menjadi null jika berada di dalam array. NaN dan Infinity berubah menjadi null. Date berubah menjadi string ISO. BigInt melempar TypeError. Objek yang saling merujuk (circular) juga melempar TypeError.",
      "Contoh 5 - perilaku stringify pada nilai khusus:",
      code(
        "javascript",
        `
const contoh = {
  a: undefined,
  b: NaN,
  c: Infinity,
  d: () => {},
  e: [undefined, NaN],
  f: new Date("2026-10-28T00:00:00Z"),
};

console.log(JSON.stringify(contoh));
// {"b":null,"c":null,"e":[null,null],"f":"2026-10-28T00:00:00.000Z"}

// console.log(JSON.stringify(1n));          // TypeError: BigInt tidak bisa di-JSON-kan
// const x = {}; x.diri = x; JSON.stringify(x); // TypeError: circular
`,
      ),
      "Angka besar perlu hati-hati. JSON tidak membedakan bilangan bulat dan desimal, dan JavaScript menyimpan angka sebagai floating point 64 bit, sehingga bilangan bulat di atas 2^53 - 1 (9.007.199.254.740.991) kehilangan presisi. Untuk ID besar, simpan sebagai string.",
      "Di dunia nyata JSON dipakai di tiga tempat utama. Pertama, sebagai format pertukaran data pada REST API: klien mengirim JSON di body dan server membalas JSON. Kedua, sebagai file konfigurasi seperti package.json, tsconfig.json, dan launch.json. Ketiga, sebagai penyimpanan data sederhana untuk aplikasi kecil, walaupun untuk data yang butuh query kompleks sebaiknya memakai basis data.",
      "Contoh 6 - pertukaran data pada REST API:",
      code(
        "json",
        `
{
  "items": [
    { "id": "m1", "title": "SQL Dasar", "difficulty": "beginner" }
  ],
  "page": 1,
  "total": 1,
  "totalPages": 1
}
`,
      ),
      "Contoh 7 - potongan package.json, contoh file konfigurasi JSON:",
      code(
        "json",
        `
{
  "name": "aksespintar-frontend",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^19.1.1"
  }
}
`,
      ),
      "Beberapa file memakai varian yang lebih longgar. tsconfig.json boleh berisi komentar karena dibaca sebagai JSONC (JSON with Comments). JSON5 mengizinkan kutip tunggal, koma di akhir, dan komentar. Namun data yang dikirim lewat jaringan hampir selalu JSON murni, jadi jangan mengandalkan fitur longgar itu di API.",
      "Validasi JSON penting saat data berasal dari luar. Jangan langsung memakai hasil JSON.parse tanpa memeriksa bentuknya. Gunakan pustaka skema seperti Zod atau JSON Schema untuk memastikan tipe dan field wajib benar sebelum data diproses.",
      "Poin Penting:",
      `1. Kunci JSON wajib string berkutip ganda; kutip tunggal tidak sah.
2. Tidak ada komentar, tidak ada koma di akhir, tidak ada undefined atau fungsi.
3. Nilai yang diizinkan hanya string, angka, boolean, null, objek, dan array.
4. JSON.parse mengubah teks menjadi objek; JSON.stringify mengubah objek menjadi teks.
5. JSON.stringify(data, null, 2) dipakai agar hasilnya mudah dibaca.
6. undefined dan fungsi hilang dari objek, NaN dan Infinity menjadi null.
7. Selalu validasi JSON dari sumber luar sebelum dipakai.`,
      "Latihan: tulis satu objek JSON berisi data satu materi (judul, tingkat, daftar tag, penulis), validasi dengan JSON.parse di Node.js, lalu cetak ulang dengan indentasi dua spasi dan buang salah satu field memakai replacer.",
    ),
  },
  {
    categorySlug: "alat-dev",
    title: "Git dan GitHub: Version Control dari Nol",
    slug: "git-github",
    summary: "Kelola riwayat kode dengan Git: konsep repository, commit, branch, dan remote, perintah sehari-hari, cara memperbaiki kesalahan, serta alur kerja pull request di GitHub.",
    difficulty: "intermediate",
    estimatedMinutes: 30,
    content: doc(
      "Git adalah sistem pengendali versi terdistribusi yang dibuat Linus Torvalds pada 2005 untuk mengelola kode kernel Linux. Disebut terdistribusi karena setiap salinan repositori memuat seluruh riwayat, sehingga commit tetap bisa dilakukan tanpa koneksi internet. GitHub adalah layanan hosting repositori Git yang diluncurkan pada 2008 dan menambahkan fitur kolaborasi seperti pull request, issue, dan CI.",
      "Empat area kerja di Git perlu dipahami sebelum menghafal perintah. Working directory adalah file yang sedang kamu sunting. Staging area adalah daftar perubahan yang disiapkan untuk commit. Repository lokal menyimpan commit yang sudah dibuat. Remote adalah salinan repositori di server seperti GitHub. Perpindahan data terjadi dari satu area ke area berikutnya.",
      "Alur dasar: sunting file, tambahkan ke staging dengan git add, simpan sebagai commit dengan git commit, lalu kirim ke remote dengan git push. Perintah git status menampilkan posisi setiap file di antara area-area tersebut dan sebaiknya dijalankan sebelum dan sesudah setiap langkah.",
      "Contoh 1 - memulai repositori baru dan mengirimnya ke GitHub:",
      code(
        "bash",
        `
git init
git add .
git commit -m "init: struktur proyek"
git branch -M main
git remote add origin https://github.com/user/aksespintar.git
git push -u origin main
`,
      ),
      "Opsi -u pada push pertama menyimpan pasangan branch lokal dan remote, sehingga push berikutnya cukup memakai git push tanpa argumen.",
      "Commit adalah potret keadaan proyek pada satu waktu. Commit yang baik berisi satu perubahan logis dan pesan yang menjelaskan alasannya, bukan hanya apa yang diubah. Pola pesan yang umum dipakai adalah prefix seperti feat untuk fitur baru, fix untuk perbaikan, docs untuk dokumentasi, dan refactor untuk perubahan struktur tanpa mengubah perilaku.",
      "Contoh 2 - melihat riwayat dan perubahan:",
      code(
        "bash",
        `
git log --oneline --graph --decorate -10
git diff                 # perubahan yang belum di-stage
git diff --staged        # perubahan yang sudah di-stage
git show HEAD            # isi commit terakhir
`,
      ),
      "Branch memungkinkan pekerjaan berjalan paralel tanpa saling mengganggu. Branch main sebaiknya selalu berisi kode yang siap dipakai. Setiap fitur dibuat di branch sendiri, lalu digabungkan setelah selesai dan diuji.",
      "Contoh 3 - membuat branch fitur lalu menggabungkannya:",
      code(
        "bash",
        `
git switch -c fitur-login
git add aksespintar-frontend/src/pages/Login.tsx
git commit -m "feat: halaman login"
git push -u origin fitur-login

git switch main
git merge fitur-login
`,
      ),
      "Merge membuat commit penggabungan dan mempertahankan riwayat asli. Rebase memindahkan commit ke atas branch lain sehingga riwayatnya lurus, tetapi menulis ulang hash commit. Jangan pernah me-rebase branch yang sudah dipakai orang lain, karena akan memaksa mereka menulis ulang riwayat juga.",
      "Konflik terjadi ketika dua branch mengubah baris yang sama. Git menandai bagian yang bertabrakan dengan tanda kurang dari, sama dengan, dan lebih dari. Selesaikan dengan menyunting file, hapus penanda, pilih atau gabungkan isi yang benar, lalu jalankan git add dan lanjutkan dengan git commit atau git rebase --continue.",
      "Contoh 4 - penanda konflik pada file:",
      code(
        "text",
        `
<<<<<<< HEAD
const judul = "Masuk";
=======
const judul = "Login";
>>>>>>> fitur-login
`,
      ),
      "File .gitignore memberi tahu Git file mana yang tidak boleh dilacak. Yang wajib diabaikan biasanya node_modules, folder hasil build seperti dist, file .env berisi rahasia, dan berkas log. Jika file yang seharusnya diabaikan sudah terlanjur di-commit, hapus dari indeks dengan git rm --cached namafile, lalu commit.",
      "Contoh 5 - isi .gitignore untuk proyek Node.js:",
      code(
        "text",
        `
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
`,
      ),
      "Memperbaiki kesalahan memakai perintah yang berbeda sesuai tingkat bahayanya. git restore membuang perubahan di working directory. git restore --staged mengeluarkan file dari staging tanpa menghapus perubahannya. git commit --amend memperbaiki commit terakhir yang belum di-push. git revert membuat commit baru yang membatalkan commit lama sehingga aman untuk riwayat bersama. git reset --hard menghapus perubahan secara permanen dan hanya boleh dipakai pada pekerjaan lokal yang belum di-push.",
      "Contoh 6 - urutan perbaikan dari yang paling aman:",
      code(
        "bash",
        `
git restore src/app.ts            # buang perubahan lokal pada satu file
git restore --staged src/app.ts   # keluarkan dari staging, perubahan tetap ada
git commit --amend -m "pesan baru"  # perbaiki commit terakhir (belum di-push)
git revert <hash>                 # batalkan commit dengan commit baru (aman)
git reset --hard <hash>           # HAPUS permanen, gunakan dengan sangat hati-hati
`,
      ),
      "Pull request (PR) adalah cara berkolaborasi di GitHub. Alurnya: fork atau buat branch, push perubahan, buka PR ke branch main, minta review, perbaiki berdasarkan komentar, lalu merge. PR memberi tempat untuk diskusi kode, menjalankan pengujian otomatis, dan menyimpan jejak mengapa sebuah perubahan dibuat.",
      "Sebelum mulai bekerja setiap hari, jalankan git pull untuk mengambil perubahan terbaru. Bekerja di branch lama yang tertinggal jauh dari main adalah penyebab konflik besar yang sebenarnya bisa dihindari.",
      "Contoh 7 - alur harian yang disarankan:",
      code(
        "bash",
        `
git switch main
git pull
git switch -c fitur-kecil
# sunting file
git status
git add .
git commit -m "feat: tambah validasi form"
git push -u origin fitur-kecil
# buka pull request di GitHub
`,
      ),
      "Poin Penting:",
      `1. Git menyimpan riwayat di komputer sendiri; GitHub hanyalah tempat menyimpan dan berkolaborasi.
2. Selalu periksa git status sebelum commit agar tidak memasukkan file yang salah.
3. Satu commit untuk satu perubahan logis dengan pesan yang menjelaskan alasannya.
4. Jangan commit .env atau kredensial; masukkan ke .gitignore sejak awal.
5. git reset --hard bersifat merusak; gunakan git revert untuk riwayat yang sudah dibagikan.
6. Jangan me-rebase branch yang sudah dipakai orang lain.
7. Tarik perubahan terbaru (git pull) sebelum mulai bekerja agar konflik kecil.`,
      "Latihan: buat repositori baru, tambahkan .gitignore yang mengabaikan node_modules dan .env, buat dua commit berbeda, buat satu branch untuk perubahan kecil, gabungkan ke main, lalu praktikkan git revert pada satu commit dan amati riwayatnya dengan git log --oneline.",
    ),
  },
];
