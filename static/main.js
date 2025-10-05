document.addEventListener("DOMContentLoaded", () => {
  // --- Elemen-elemen HTML ---
  const linkInput = document.getElementById("link");
  const pasteBtn = document.getElementById("pasteBtn");
  const videoBtn = document.getElementById("autoBtn");
  const audioBtn = document.getElementById("audioBtn");

  // --- Elemen untuk menampilkan hasil ---
  const loadingDiv = document.getElementById("loading");
  const resultDiv = document.getElementById("result");
  const errorDiv = document.getElementById("error");
  const videoTitle = document.getElementById("video-title");
  const downloadLink = document.getElementById("download-link");
  const errorMessage = document.getElementById("error-message");

  let selectedFormat = "video"; // Default format

  // --- Fungsi untuk mereset tampilan ---
  function resetState() {
    loadingDiv.style.display = "none";
    resultDiv.style.display = "none";
    errorDiv.style.display = "none";
  }

  // --- Event Listener untuk Tombol Paste ---
  pasteBtn.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      linkInput.value = text;
    } catch (err) {
      console.error("Gagal paste dari clipboard:", err);
    }
  });

  // --- Event Listener untuk pilihan format (Video/Audio) ---
  videoBtn.addEventListener("click", () => {
    selectedFormat = "video";
    videoBtn.classList.add("active");
    audioBtn.classList.remove("active");
  });

  audioBtn.addEventListener("click", () => {
    selectedFormat = "audio";
    audioBtn.classList.add("active");
    videoBtn.classList.remove("active");
  });

  // --- Fungsi utama untuk mengirim data ke backend ---
  async function getDownloadLink() {
    const url = linkInput.value;
    if (!url) {
      errorMessage.textContent = "Silakan masukkan URL terlebih dahulu.";
      errorDiv.style.display = "block";
      return;
    }

    resetState();
    loadingDiv.style.display = "block";

    try {
      const response = await fetch("/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        // Kirim URL dan format yang dipilih
        body: `url=${encodeURIComponent(url)}&format=${selectedFormat}`,
      });

      const data = await response.json();
      loadingDiv.style.display = "none";

      if (response.ok && data.success) {
        // Tampilkan hasil jika sukses
        videoTitle.textContent = data.title;
        downloadLink.href = data.download_url;
        downloadLink.setAttribute('download', data.filename); // Set nama file
        resultDiv.style.display = "block";
      } else {
        // Tampilkan error jika gagal
        errorMessage.textContent = data.error || "Terjadi kesalahan yang tidak diketahui.";
        errorDiv.style.display = "block";
      }
    } catch (error) {
      loadingDiv.style.display = "none";
      errorMessage.textContent = "Gagal terhubung ke server. Coba lagi nanti.";
      errorDiv.style.display = "block";
    }
  }

  // --- Trigger fungsi saat menekan tombol Enter di input ---
  linkInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Mencegah form submit default
      getDownloadLink();
    }
  });
});