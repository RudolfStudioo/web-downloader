from flask import Flask, render_template, request, jsonify
import yt_dlp

app = Flask(__name__)

@app.route('/')
def index():
    """Menampilkan halaman utama (index.html)."""
    return render_template('index.html')
    
@app.route('/download', methods=['POST'])
def download():
    """Menerima URL dan pilihan format, lalu mengembalikan link download."""
    video_url = request.form.get('url')
    format_choice = request.form.get('format', 'video')

    if not video_url:
        return jsonify({'error': 'URL tidak boleh kosong!'}), 400

    try:
        if format_choice == 'audio':
            ydl_opts = {
                'format': 'bestaudio/best',
                'noplaylist': True,
            }
        else: # Default ke video
            ydl_opts = {
                'format': 'best',
                'noplaylist': True,
            }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Menggunakan download=False untuk hanya mendapatkan informasi dan URL
            info_dict = ydl.extract_info(video_url, download=False)
            
            video_title = info_dict.get('title', 'Judul tidak tersedia')
            download_url = info_dict.get('url', None)

            if download_url:
                return jsonify({
                    'success': True,
                    'title': video_title,
                    'download_url': download_url,
                    'filename': ydl.prepare_filename(info_dict)
                })
            else:
                return jsonify({'error': 'Tidak dapat menemukan link download.'}), 500

    except Exception as e:
        return jsonify({'error': f'Terjadi kesalahan: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)