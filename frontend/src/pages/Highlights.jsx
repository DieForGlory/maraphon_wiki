import { useState, useEffect } from 'react';

export default function Highlights() {
  const [videos, setVideos] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewingVideo, setViewingVideo] = useState(null);
  const [uploadData, setUploadData] = useState({ title: '', description: '', file: null });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const API_BASE = "";

  const loadVideos = () => {
    fetch(`${API_BASE}/api/community/highlights`)
      .then(res => res.json())
      .then(data => setVideos(Array.isArray(data) ? data : []))
      .catch(err => console.error("STREAM_FAILURE:", err));
  };

  useEffect(() => { loadVideos(); }, []);

  const handleUpload = (e) => {
    e.preventDefault();
    let token = localStorage.getItem('token');

    if (!token || token === "null" || token === "undefined") {
      alert("ОШИБКА: ТРЕБУЕТСЯ АВТОРИЗАЦИЯ");
      return;
    }

    // Очистка токена от возможных кавычек
    token = token.replace(/['"]+/g, '').trim();

    if (!uploadData.file) return;

    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('video', uploadData.file);
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/api/community/highlights`, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setLoading(false);
      if (xhr.status === 201) {
        setShowUploadModal(false);
        setUploadData({ title: '', description: '', file: null });
        loadVideos();
      } else {
        const resp = JSON.parse(xhr.responseText || "{}");
        alert(`ERR ${xhr.status}: ${resp.msg || resp.error || "REJECTED"}`);
      }
    };

    xhr.onerror = () => {
      setLoading(false);
      alert("КРИТИЧЕСКИЙ СБОЙ СЕТИ");
    };

    xhr.send(formData);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end border-b border-m-pink pb-4">
        <div>
          <h2 className="text-2xl text-m-pink uppercase tracking-widest">&gt; ТРАНСЛЯЦИЯ ХАЙЛАЙТОВ</h2>
          <p className="text-[10px] text-m-cyan opacity-50 uppercase mt-1">КАНАЛ: ТАУ КИТА f // СТАТУС: АКТИВЕН</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-m-pink/10 border border-m-pink text-m-pink px-6 py-2 uppercase text-xs font-bold hover:bg-m-pink hover:text-black transition-all"
        >
          ЗАГРУЗИТЬ МОМЕНТ
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map(vid => (
          <div key={vid.id} onClick={() => setViewingVideo(vid)} className="group border border-white/10 bg-[#0C0C0D] cursor-pointer hover:border-m-acid transition-all">
            <div className="aspect-video bg-black relative overflow-hidden">
              {vid.thumbnail_url ? (
                <img src={`${API_BASE}${vid.thumbnail_url}`} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-700" />
              ) : <div className="w-full h-full flex items-center justify-center text-[10px] opacity-20 uppercase">No Signal</div>}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                <div className="w-12 h-12 rounded-full border border-m-acid flex items-center justify-center pl-1 bg-black/80"><span className="text-m-acid">▶</span></div>
              </div>
            </div>
            <div className="p-4 bg-m-black/40 border-t border-white/5">
              <h3 className="text-m-cyan font-bold uppercase tracking-wider text-sm truncate">{vid.title}</h3>
              <div className="flex justify-between items-center mt-2 opacity-50 text-[9px] uppercase">
                <span>АВТОР: {vid.author}</span>
                <span className="text-m-acid">ONLINE</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {viewingVideo && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 lg:p-12 animate-fade-in">
          <div className="bg-[#0C0C0D] border border-m-cyan w-full max-w-5xl shadow-[0_0_50px_rgba(0,255,255,0.15)]">
            <div className="flex justify-between items-center p-4 border-b border-m-cyan/30 bg-m-cyan/5">
              <h3 className="text-sm text-m-cyan uppercase tracking-widest font-bold">ПОТОК: {viewingVideo.title}</h3>
              <button onClick={() => setViewingVideo(null)} className="text-m-cyan text-[10px] border border-m-cyan/30 px-3 py-1 hover:bg-m-cyan hover:text-black transition-all uppercase">[ ЗАКРЫТЬ ]</button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <video src={`${API_BASE}${viewingVideo.video_url}`} controls autoPlay className="max-w-full max-h-full" />
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0C0C0D] border border-m-pink p-8 w-full max-w-md space-y-6 shadow-[0_0_40px_rgba(255,0,85,0.25)]">
            <h3 className="text-xl text-m-pink uppercase tracking-widest font-bold border-b border-m-pink/30 pb-2">ПЕРЕДАЧА ДАННЫХ</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <input required disabled={loading} className="w-full bg-m-black border border-white/10 p-3 text-xs text-white focus:border-m-cyan outline-none uppercase font-mono" placeholder="НАЗВАНИЕ..." onChange={e => setUploadData({...uploadData, title: e.target.value})} />
              <textarea disabled={loading} className="w-full bg-m-black border border-white/10 p-3 text-xs text-white focus:border-m-cyan outline-none h-20 resize-none uppercase font-mono" placeholder="ЛОГ ОПИСАНИЯ..." onChange={e => setUploadData({...uploadData, description: e.target.value})} />

              {!loading ? (
                <div className="border border-dashed border-white/20 p-6 text-center bg-m-black/50">
                  <input required type="file" accept="video/*" onChange={e => setUploadData({...uploadData, file: e.target.files[0]})} className="text-[9px] text-gray-500 cursor-pointer" />
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <div className="flex justify-between text-[10px] uppercase font-mono text-m-pink">
                    <span className="animate-pulse">TRANSFERRING...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 overflow-hidden">
                    <div className="h-full bg-m-pink shadow-[0_0_15px_rgba(255,0,85,1)]" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button type="button" disabled={loading} onClick={() => setShowUploadModal(false)} className="flex-1 border border-gray-600 text-gray-500 py-3 uppercase text-[10px]">ОТМЕНА</button>
                {!loading && <button type="submit" className="flex-1 bg-m-pink text-black py-3 uppercase text-[10px] font-bold">ПЕРЕДАТЬ</button>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}