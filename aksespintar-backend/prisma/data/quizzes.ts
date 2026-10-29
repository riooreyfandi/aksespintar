export type QuizSeed = {
  materialSlug: string;
  title: string;
  description: string;
  passingScore: number;
  questions: {
    questionText: string;
    explanation: string;
    options: string[];
    correctIndex: number;
  }[];
};

// Satu kuis pendek untuk setiap materi, tampil di bagian bawah halaman materi.
export const quizzes: QuizSeed[] = [
  {
    materialSlug: "python-dasar",
    title: "Kuis Python Dasar",
    description: "Uji pemahamanmu tentang tipe data, percabangan, dan fungsi di Python.",
    passingScore: 70,
    questions: [
      {
        questionText: "Tipe data apa yang dipakai untuk menyimpan teks di Python?",
        explanation: "Teks disimpan sebagai string, ditulis di antara tanda kutip, dan bertipe str.",
        options: ["int", "str", "bool", "float"],
        correctIndex: 1,
      },
      {
        questionText: "Kata kunci apa yang dipakai untuk mendefinisikan fungsi?",
        explanation: "Fungsi di Python didefinisikan dengan kata kunci def diikuti nama fungsi.",
        options: ["function", "func", "def", "define"],
        correctIndex: 2,
      },
      {
        questionText: "Apa hasil dari len([1, 2, 3])?",
        explanation: "len() mengembalikan jumlah elemen dalam list, yaitu 3.",
        options: ["2", "3", "4", "Error"],
        correctIndex: 1,
      },
    ],
  },
  {
    materialSlug: "javascript-dasar",
    title: "Kuis JavaScript Dasar",
    description: "Uji pemahamanmu tentang variabel, tipe data, dan array di JavaScript.",
    passingScore: 70,
    questions: [
      {
        questionText: "Kata kunci mana yang membuat variabel yang nilainya tidak bisa diubah?",
        explanation: "const membuat binding yang tidak bisa di-assign ulang setelah dideklarasikan.",
        options: ["let", "var", "const", "static"],
        correctIndex: 2,
      },
      {
        questionText: 'Apa hasil dari typeof "halo"?',
        explanation: 'Nilai berupa teks bertipe "string" di JavaScript.',
        options: ["text", "string", "char", "object"],
        correctIndex: 1,
      },
      {
        questionText: "Metode apa yang menambahkan elemen di akhir array?",
        explanation: "push() menambahkan satu atau lebih elemen ke akhir array.",
        options: ["shift()", "unshift()", "push()", "pop()"],
        correctIndex: 2,
      },
    ],
  },
  {
    materialSlug: "css-dasar",
    title: "Kuis CSS Dasar",
    description: "Uji pemahamanmu tentang selector, box model, dan flexbox.",
    passingScore: 70,
    questions: [
      {
        questionText: "Properti apa yang mengatur warna teks?",
        explanation: "Properti color mengatur warna teks, sedangkan background-color mengatur latar.",
        options: ["font-color", "text-color", "color", "foreground"],
        correctIndex: 2,
      },
      {
        questionText: "Bagian box model yang berada di luar border disebut apa?",
        explanation: "Margin adalah ruang di luar border yang memisahkan elemen dari elemen lain.",
        options: ["padding", "margin", "border", "content"],
        correctIndex: 1,
      },
      {
        questionText: "Nilai display apa yang mengaktifkan flexbox pada sebuah container?",
        explanation: "display: flex membuat container menjadi flex container dan anaknya menjadi flex item.",
        options: ["grid", "block", "flex", "inline"],
        correctIndex: 2,
      },
    ],
  },
  {
    materialSlug: "cpp-dasar",
    title: "Kuis C++ Dasar",
    description: "Uji pemahamanmu tentang struktur program, library, dan pointer di C++.",
    passingScore: 70,
    questions: [
      {
        questionText: "Fungsi mana yang menjadi titik masuk program C++?",
        explanation: "Eksekusi program C++ dimulai dari fungsi main().",
        options: ["start()", "main()", "init()", "run()"],
        correctIndex: 1,
      },
      {
        questionText: "Library mana yang menyediakan cin dan cout?",
        explanation: "cin dan cout didefinisikan di library <iostream>.",
        options: ["<string>", "<vector>", "<iostream>", "<stdio.h>"],
        correctIndex: 2,
      },
      {
        questionText: "Operator apa yang dipakai untuk mengakses anggota lewat pointer?",
        explanation: "Operator -> mengakses anggota struct/class melalui pointer.",
        options: [".", "->", "::", "&"],
        correctIndex: 1,
      },
    ],
  },
  {
    materialSlug: "sql-dasar",
    title: "Kuis SQL Dasar",
    description: "Uji pemahamanmu tentang SELECT, WHERE, dan JOIN.",
    passingScore: 70,
    questions: [
      {
        questionText: "Perintah apa yang dipakai untuk mengambil data dari tabel?",
        explanation: "SELECT digunakan untuk membaca kolom dan baris dari sebuah tabel.",
        options: ["GET", "SELECT", "FETCH", "SHOW"],
        correctIndex: 1,
      },
      {
        questionText: "Klausa apa yang dipakai untuk menyaring baris?",
        explanation: "WHERE menyeleksi baris yang memenuhi kondisi tertentu.",
        options: ["HAVING", "WHERE", "ORDER BY", "GROUP BY"],
        correctIndex: 1,
      },
      {
        questionText: "JOIN apa yang mengembalikan semua baris dari tabel kiri?",
        explanation: "LEFT JOIN mengembalikan seluruh baris tabel kiri, dengan NULL bila tidak ada pasangan.",
        options: ["INNER JOIN", "RIGHT JOIN", "LEFT JOIN", "CROSS JOIN"],
        correctIndex: 2,
      },
    ],
  },
  {
    materialSlug: "matematika-diskrit",
    title: "Kuis Matematika Diskrit",
    description: "Uji pemahamanmu tentang logika, himpunan, dan graf.",
    passingScore: 70,
    questions: [
      {
        questionText: 'Negasi dari "semua A adalah B" adalah?',
        explanation: 'Negasi kuantor universal menjadi kuantor eksistensial: "ada A yang bukan B".',
        options: ["Semua A bukan B", "Ada A yang bukan B", "Semua B adalah A", "Tidak ada A"],
        correctIndex: 1,
      },
      {
        questionText: "Berapa banyak himpunan bagian dari himpunan dengan 3 elemen?",
        explanation: "Jumlah himpunan bagian adalah 2^n, sehingga 2^3 = 8.",
        options: ["3", "6", "8", "9"],
        correctIndex: 2,
      },
      {
        questionText: "Pohon dengan n simpul memiliki berapa sisi?",
        explanation: "Pohon selalu terhubung dan tidak memiliki siklus, sehingga sisinya n - 1.",
        options: ["n", "n - 1", "n + 1", "2n"],
        correctIndex: 1,
      },
    ],
  },
  {
    materialSlug: "aljabar-linier",
    title: "Kuis Aljabar Linier",
    description: "Uji pemahamanmu tentang matriks, determinan, dan perkalian matriks.",
    passingScore: 70,
    questions: [
      {
        questionText: "Berapa determinan matriks identitas 3x3?",
        explanation: "Determinan matriks identitas selalu 1.",
        options: ["0", "1", "3", "Tidak terdefinisi"],
        correctIndex: 1,
      },
      {
        questionText: "Syarat agar sebuah matriks persegi punya invers adalah?",
        explanation: "Matriks persegi punya invers jika dan hanya jika determinannya tidak nol.",
        options: ["Semua elemen positif", "Determinan tidak nol", "Matriks simetris", "Jumlah baris genap"],
        correctIndex: 1,
      },
      {
        questionText: "Matriks A berukuran m x n dikalikan B berukuran n x p menghasilkan matriks berukuran?",
        explanation: "Dimensi dalam (n) harus sama, dan hasilnya berukuran m x p.",
        options: ["m x n", "n x p", "m x p", "p x m"],
        correctIndex: 2,
      },
    ],
  },
  {
    materialSlug: "fisika-dasar",
    title: "Kuis Fisika Dasar",
    description: "Uji pemahamanmu tentang gaya, hukum Newton, dan energi.",
    passingScore: 70,
    questions: [
      {
        questionText: "Apa satuan SI untuk gaya?",
        explanation: "Gaya diukur dalam newton (N), setara kg·m/s².",
        options: ["joule", "watt", "newton", "pascal"],
        correctIndex: 2,
      },
      {
        questionText: "Rumus Hukum Newton kedua adalah?",
        explanation: "Percepatan sebanding dengan gaya total dan berbanding terbalik dengan massa: F = m·a.",
        options: ["F = m·v", "F = m·a", "F = m/a", "F = a/m"],
        correctIndex: 1,
      },
      {
        questionText: "Rumus energi kinetik adalah?",
        explanation: "Energi kinetik benda bermassa m dan kecepatan v adalah ½mv².",
        options: ["m·g·h", "½mv²", "m·v", "½m²v"],
        correctIndex: 1,
      },
    ],
  },
  {
    materialSlug: "python-lanjutan",
    title: "Kuis Python Lanjutan",
    description: "Uji pemahamanmu tentang OOP, generator, dan dekorator.",
    passingScore: 70,
    questions: [
      {
        questionText: "Method apa yang dipanggil saat objek dibuat?",
        explanation: "__init__ adalah konstruktor yang dijalankan saat instance dibuat.",
        options: ["__new__", "__init__", "__call__", "__str__"],
        correctIndex: 1,
      },
      {
        questionText: "Kata kunci apa yang membuat sebuah fungsi menjadi generator?",
        explanation: "Fungsi yang mengandung yield mengembalikan generator.",
        options: ["return", "yield", "async", "await"],
        correctIndex: 1,
      },
      {
        questionText: "Simbol apa yang dipakai untuk menulis dekorator?",
        explanation: "Dekorator ditulis dengan awalan @ di atas definisi fungsi.",
        options: ["#", "@", "$", "&"],
        correctIndex: 1,
      },
    ],
  },
  {
    materialSlug: "javascript-lanjutan",
    title: "Kuis JavaScript Lanjutan",
    description: "Uji pemahamanmu tentang scope, closure, dan event loop.",
    passingScore: 70,
    questions: [
      {
        questionText: "Apa itu closure?",
        explanation: "Closure adalah fungsi yang tetap mengingat variabel dari scope tempat ia dibuat.",
        options: [
          "Fungsi yang tidak punya parameter",
          "Fungsi yang mengingat scope saat dibuat",
          "Fungsi yang selalu async",
          "Fungsi yang dipanggil sekali",
        ],
        correctIndex: 1,
      },
      {
        questionText: "Variabel yang dideklarasikan dengan let memiliki scope?",
        explanation: "let bersifat block scope, berbeda dengan var yang function scope.",
        options: ["Global selalu", "Block scope", "Function scope saja", "Tanpa scope"],
        correctIndex: 1,
      },
      {
        questionText: "Callback dari operasi async dijalankan ketika?",
        explanation: "Event loop menjalankan callback setelah call stack kosong.",
        options: [
          "Sebelum kode sinkron",
          "Saat call stack kosong",
          "Bersamaan dengan kode sinkron",
          "Hanya saat halaman ditutup",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    materialSlug: "html-lanjutan",
    title: "Kuis HTML Lanjutan",
    description: "Uji pemahamanmu tentang HTML semantik, form, dan aksesibilitas.",
    passingScore: 70,
    questions: [
      {
        questionText: "Tag semantik apa yang tepat untuk bagian navigasi?",
        explanation: "<nav> menandai kumpulan tautan navigasi utama.",
        options: ["<div>", "<nav>", "<section>", "<aside>"],
        correctIndex: 1,
      },
      {
        questionText: "Atribut apa yang menyediakan teks alternatif untuk gambar?",
        explanation: "Atribut alt dibacakan pembaca layar dan tampil bila gambar gagal dimuat.",
        options: ["title", "alt", "src", "aria-label"],
        correctIndex: 1,
      },
      {
        questionText: "Atribut apa yang menghubungkan label dengan input?",
        explanation: "Atribut for pada <label> harus sama dengan id input terkait.",
        options: ["name", "for", "id", "form"],
        correctIndex: 1,
      },
    ],
  },
  {
    materialSlug: "css-lanjutan",
    title: "Kuis CSS Lanjutan",
    description: "Uji pemahamanmu tentang cascade layer, container query, dan animasi.",
    passingScore: 70,
    questions: [
      {
        questionText: "Aturan apa yang dipakai untuk mengelompokkan cascade berdasarkan prioritas?",
        explanation: "@layer mendefinisikan cascade layer untuk mengatur urutan prioritas style.",
        options: ["@media", "@layer", "@supports", "@scope"],
        correctIndex: 1,
      },
      {
        questionText: "Properti apa yang perlu diset agar container query bekerja?",
        explanation: "container-type mendefinisikan container sebagai query container.",
        options: ["container-type", "display", "position", "flex-direction"],
        correctIndex: 0,
      },
      {
        questionText: "At-rule apa yang dipakai untuk mendefinisikan animasi?",
        explanation: "@keyframes mendefinisikan tahapan animasi yang dipakai properti animation.",
        options: ["@animation", "@keyframes", "@transition", "@motion"],
        correctIndex: 1,
      },
    ],
  },
  {
    materialSlug: "cpp-lanjutan",
    title: "Kuis C++ Lanjutan",
    description: "Uji pemahamanmu tentang RAII, smart pointer, dan move semantics.",
    passingScore: 70,
    questions: [
      {
        questionText: "Smart pointer mana yang memiliki kepemilikan tunggal?",
        explanation: "std::unique_ptr memastikan hanya satu pemilik untuk sebuah resource.",
        options: ["std::shared_ptr", "std::unique_ptr", "std::weak_ptr", "std::auto_ptr"],
        correctIndex: 1,
      },
      {
        questionText: "RAII mengikat masa hidup resource dengan?",
        explanation: "RAII mengikat resource dengan masa hidup objek, dilepas saat objek keluar scope.",
        options: ["Heap", "Masa hidup objek", "Thread", "Global variable"],
        correctIndex: 1,
      },
      {
        questionText: "Apa fungsi std::move?",
        explanation: "std::move melakukan cast ke rvalue reference agar resource bisa dipindahkan.",
        options: [
          "Menyalin objek",
          "Cast ke rvalue reference",
          "Menghapus objek",
          "Mengalokasikan memori",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    materialSlug: "sql-lanjutan",
    title: "Kuis SQL Lanjutan",
    description: "Uji pemahamanmu tentang window function, CTE, dan index.",
    passingScore: 70,
    questions: [
      {
        questionText: "Fungsi window apa yang memberi nomor urut pada setiap baris?",
        explanation: "ROW_NUMBER() memberi nomor unik berurutan sesuai OVER (ORDER BY ...).",
        options: ["COUNT()", "ROW_NUMBER()", "SUM()", "RANK()"],
        correctIndex: 1,
      },
      {
        questionText: "CTE diawali dengan kata kunci apa?",
        explanation: "Common Table Expression diawali WITH, lalu diikuti nama CTE dan query.",
        options: ["WITH", "CREATE", "DEFINE", "LET"],
        correctIndex: 0,
      },
      {
        questionText: "Index paling membantu untuk operasi?",
        explanation: "Index mempercepat pencarian dan filter, tetapi menambah biaya saat menulis data.",
        options: [
          "Menambah baris",
          "Mencari dan memfilter baris",
          "Menghapus tabel",
          "Membuat kolom baru",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    materialSlug: "matematika-diskrit-lanjutan",
    title: "Kuis Matematika Diskrit Lanjutan",
    description: "Uji pemahamanmu tentang induksi, relasi, dan pohon.",
    passingScore: 70,
    questions: [
      {
        questionText: "Langkah pertama dalam induksi matematika adalah?",
        explanation: "Induksi dimulai dari basis, yaitu membuktikan pernyataan benar untuk nilai awal.",
        options: ["Langkah induktif", "Basis", "Kontraposisi", "Generalisasi"],
        correctIndex: 1,
      },
      {
        questionText: "Relasi ekuivalen harus memenuhi sifat?",
        explanation: "Relasi ekuivalen bersifat refleksif, simetris, dan transitif.",
        options: [
          "Refleksif, simetris, transitif",
          "Refleksif dan antisimetris",
          "Simetris saja",
          "Transitif dan antisimetris",
        ],
        correctIndex: 0,
      },
      {
        questionText: "Pohon dengan 10 simpul memiliki berapa sisi?",
        explanation: "Pohon dengan n simpul selalu memiliki n - 1 sisi, sehingga 10 - 1 = 9.",
        options: ["8", "9", "10", "11"],
        correctIndex: 1,
      },
    ],
  },
  {
    materialSlug: "aljabar-linier-lanjutan",
    title: "Kuis Aljabar Linier Lanjutan",
    description: "Uji pemahamanmu tentang ortogonalitas, proyeksi, dan SVD.",
    passingScore: 70,
    questions: [
      {
        questionText: "Dua vektor ortogonal jika?",
        explanation: "Vektor ortogonal memiliki hasil kali titik (dot product) sama dengan nol.",
        options: ["Panjangnya sama", "Dot product-nya nol", "Jumlahnya nol", "Arahnya sama"],
        correctIndex: 1,
      },
      {
        questionText: "SVD memfaktorkan matriks A menjadi?",
        explanation: "SVD menulis A = UΣVᵀ dengan U dan V ortogonal serta Σ diagonal.",
        options: ["LU", "QR", "UΣVᵀ", "A + Aᵀ"],
        correctIndex: 2,
      },
      {
        questionText: "Rumus proyeksi ortogonal v ke arah u adalah?",
        explanation: "Proyeksi v pada u adalah ((v·u)/(u·u))·u.",
        options: ["(v·u)·u", "((v·u)/(u·u))·u", "v/u", "u × v"],
        correctIndex: 1,
      },
    ],
  },
  {
    materialSlug: "fisika-lanjutan",
    title: "Kuis Fisika Lanjutan",
    description: "Uji pemahamanmu tentang rotasi, osilasi, dan termodinamika.",
    passingScore: 70,
    questions: [
      {
        questionText: "Momen inersia adalah analog dari besaran apa pada gerak rotasi?",
        explanation: "Momen inersia berperan seperti massa pada gerak translasi.",
        options: ["Kecepatan", "Massa", "Gaya", "Momentum"],
        correctIndex: 1,
      },
      {
        questionText: "Periode bandul sederhana bergantung pada?",
        explanation: "T = 2π√(L/g), sehingga bergantung pada panjang tali dan gravitasi, bukan massa.",
        options: ["Massa bandul", "Panjang tali dan gravitasi", "Amplitudo besar", "Warna bandul"],
        correctIndex: 1,
      },
      {
        questionText: "Hukum pertama termodinamika menyatakan?",
        explanation: "Perubahan energi internal sama dengan kalor masuk dikurangi kerja yang dilakukan.",
        options: [
          "Entropi selalu turun",
          "Kekekalan energi",
          "Kalor mengalir dari dingin ke panas",
          "Massa berubah menjadi energi",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    materialSlug: "visual-studio-code",
    title: "Kuis Visual Studio Code",
    description: "Uji pemahamanmu tentang fitur dan alur kerja VS Code.",
    passingScore: 70,
    questions: [
      {
        questionText: "Shortcut apa yang membuka Command Palette?",
        explanation: "Ctrl+Shift+P (Windows/Linux) atau Cmd+Shift+P (macOS) membuka Command Palette.",
        options: ["Ctrl+P", "Ctrl+Shift+P", "Ctrl+Shift+F", "Ctrl+`"],
        correctIndex: 1,
      },
      {
        questionText: "Apa fungsi extension di VS Code?",
        explanation: "Extension menambah dukungan bahasa, linter, debugger, dan fitur lain.",
        options: [
          "Mempercepat internet",
          "Menambah fitur editor",
          "Menghapus file otomatis",
          "Mengganti sistem operasi",
        ],
        correctIndex: 1,
      },
      {
        questionText: "Di mana pengaturan khusus workspace disimpan?",
        explanation: "Pengaturan workspace disimpan di .vscode/settings.json dalam folder proyek.",
        options: ["settings.json global", ".vscode/settings.json", "package.json", ".gitignore"],
        correctIndex: 1,
      },
    ],
  },
  {
    materialSlug: "json",
    title: "Kuis JSON",
    description: "Uji pemahamanmu tentang aturan penulisan dan penggunaan JSON.",
    passingScore: 70,
    questions: [
      {
        questionText: "String pada JSON harus ditulis dengan?",
        explanation: "JSON hanya mengizinkan tanda kutip ganda untuk string, bukan kutip tunggal.",
        options: ["Kutip tunggal", "Kutip ganda", "Tanpa kutip", "Backtick"],
        correctIndex: 1,
      },
      {
        questionText: "Tipe data apa yang tidak dikenali JSON?",
        explanation: "JSON hanya mendukung objek, array, string, number, boolean, dan null. Fungsi/undefined tidak ada.",
        options: ["String", "Number", "Fungsi", "Boolean"],
        correctIndex: 2,
      },
      {
        questionText: "Ekstensi file JSON adalah?",
        explanation: "File JSON umumnya memakai ekstensi .json.",
        options: [".js", ".json", ".xml", ".txt"],
        correctIndex: 1,
      },
    ],
  },
  {
    materialSlug: "git-github",
    title: "Kuis Git dan GitHub",
    description: "Uji pemahamanmu tentang version control, commit, dan remote.",
    passingScore: 70,
    questions: [
      {
        questionText: "Perintah apa yang menyimpan snapshot perubahan ke repository lokal?",
        explanation: "git commit menyimpan perubahan yang sudah di-stage sebagai snapshot.",
        options: ["git push", "git commit", "git clone", "git pull"],
        correctIndex: 1,
      },
      {
        questionText: "Perintah apa yang mengirim commit ke remote repository?",
        explanation: "git push mengunggah commit lokal ke remote seperti GitHub.",
        options: ["git pull", "git fetch", "git push", "git merge"],
        correctIndex: 2,
      },
      {
        questionText: "Git termasuk jenis version control apa?",
        explanation: "Git adalah distributed version control, setiap clone punya riwayat lengkap.",
        options: ["Terdistribusi", "Tersentralisasi", "Manual", "Basis dokumen"],
        correctIndex: 0,
      },
    ],
  },
];
