import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // GÖRSEL STATE'LER
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // YENİ: Hangi notların uzun içeriğinin açık olduğunu tutan state
    const [expandedNoteIds, setExpandedNoteIds] = useState([]);

    const fetchNotes = () => {
        axios.get('http://localhost:8080/api/notes')
            .then(response => setNotes(response.data))
            .catch(error => showToast("Notlar çekilirken bir hata oluştu!", "error"));
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content && !file) {
            showToast("Lütfen bir not içeriği yazın veya PDF seçin!", "error");
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('title', title || '');
        formData.append('content', content || '📄 Sisteme sadece PDF belgesi yüklendi.');

        if (file) {
            formData.append('file', file);
        }
        const config = { headers: { 'Content-Type': 'multipart/form-data' } };

        if (editingId) {
            axios.put(`http://localhost:8080/api/notes/${editingId}`, formData, config)
                .then(() => {
                    fetchNotes();
                    resetForm();
                    showToast("Not başarıyla güncellendi ve yeniden özetlendi! ✨", "success");
                })
                .catch(error => showToast("Güncelleme sırasında bir hata oluştu.", "error"))
                .finally(() => setIsLoading(false));
        } else {
            axios.post('http://localhost:8080/api/notes', formData, config)
                .then(() => {
                    fetchNotes();
                    resetForm();
                    showToast("Yeni not ve PDF analizi başarıyla kaydedildi! 🤖", "success");
                })
                .catch(error => showToast("Kaydetme sırasında bir hata oluştu.", "error"))
                .finally(() => setIsLoading(false));
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = window.confirm("Bu notu silmek istediğinize emin misiniz?");
        if (isConfirmed) {
            try {
                await axios.delete(`http://localhost:8080/api/notes/${id}`);
                setNotes(notes.filter(note => note.id !== id));
                showToast("Not başarıyla silindi.", "success");
            } catch (error) {
                showToast("Not silinirken bir hata oluştu.", "error");
            }
        }
    };

    const handleEditClick = (note) => {
        setEditingId(note.id);
        setTitle(note.title);
        setContent(note.content);
        setFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast("Düzenleme modu aktif.", "success");
    };

    const resetForm = () => {
        setEditingId(null);
        setTitle('');
        setContent('');
        setFile(null);
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === "application/pdf") {
                setFile(droppedFile);
                showToast("PDF başarıyla sürüklendi! 📄", "success");
            } else {
                showToast("Yalnızca PDF dosyaları yüklenebilir!", "error");
            }
        }
    };

    // YENİ: İçerik açma/kapama fonksiyonu
    const toggleExpand = (id) => {
        setExpandedNoteIds(prev =>
            prev.includes(id) ? prev.filter(noteId => noteId !== id) : [...prev, id]
        );
    };

    const filteredNotes = notes.filter(note =>
        (note.title && note.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()))
    ).reverse(); // En son eklenen her zaman en üstte!

    const themeColors = {
        bg: isDarkMode ? '#0f172a' : '#f8fafc',
        cardBg: isDarkMode ? '#1e293b' : '#ffffff',
        text: isDarkMode ? '#f8fafc' : '#1f2937',
        titleText: isDarkMode ? '#ffffff' : '#0f172a',
        subText: isDarkMode ? '#94a3b8' : '#64748b',
        border: isDarkMode ? '#334155' : '#e2e8f0',
        inputBg: isDarkMode ? '#1e293b' : '#f8fafc',
    };

    const styles = {
        appContainer: {
            maxWidth: '850px',
            margin: '0 auto',
            padding: '40px 20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            color: themeColors.text,
            backgroundColor: themeColors.bg,
            minHeight: '100vh',
            transition: 'background-color 0.3s, color 0.3s'
        },
        themeToggle: {
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '10px 16px',
            borderRadius: '50px',
            border: `1px solid ${themeColors.border}`,
            backgroundColor: themeColors.cardBg,
            color: themeColors.text,
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s'
        },
        headerSection: { textAlign: 'center', marginBottom: '40px', marginTop: '20px' },
        mainTitle: { fontSize: '32px', fontWeight: '800', color: themeColors.titleText, margin: '0 0 10px 0', letterSpacing: '-0.5px' },
        subTitle: { fontSize: '16px', color: themeColors.subText, margin: '0' },
        formCard: {
            backgroundColor: themeColors.cardBg,
            borderRadius: '16px',
            padding: '28px',
            boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 18px rgba(15, 23, 42, 0.05)',
            border: `1px solid ${themeColors.border}`,
            marginBottom: '30px',
            transition: 'all 0.3s'
        },
        formTitle: { fontSize: '20px', fontWeight: '700', color: themeColors.titleText, marginTop: '0', marginBottom: '20px' },
        inputField: { padding: '14px 16px', borderRadius: '10px', border: `1px solid ${themeColors.border}`, fontSize: '15px', outline: 'none', width: '100%', boxSizing: 'border-box', backgroundColor: themeColors.inputBg, color: themeColors.text, transition: 'all 0.3s' },
        textareaField: { padding: '14px 16px', borderRadius: '10px', border: `1px solid ${themeColors.border}`, fontSize: '15px', outline: 'none', width: '100%', boxSizing: 'border-box', backgroundColor: themeColors.inputBg, color: themeColors.text, minHeight: '110px', resize: 'vertical', transition: 'all 0.3s' },
        fileUploadContainer: {
            border: isDragging ? '2px dashed #2563eb' : `2px dashed ${themeColors.border}`,
            borderRadius: '10px',
            padding: '30px 20px',
            textAlign: 'center',
            backgroundColor: isDragging ? (isDarkMode ? '#1e3a8a' : '#eff6ff') : themeColors.inputBg,
            cursor: 'pointer',
            transition: 'all 0.2s',
            transform: isDragging ? 'scale(1.02)' : 'scale(1)'
        },
        fileUploadText: { margin: '0', fontSize: '14px', color: themeColors.subText, fontWeight: '500' },
        submitButton: {
            padding: '14px 24px',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
        },
        cancelButton: { padding: '14px 24px', backgroundColor: isDarkMode ? '#334155' : '#f1f5f9', color: themeColors.text, border: 'none', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: '600' },
        searchBar: { width: '100%', padding: '14px 20px', borderRadius: '12px', border: `2px solid ${themeColors.border}`, fontSize: '16px', boxSizing: 'border-box', outline: 'none', backgroundColor: themeColors.cardBg, color: themeColors.text, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', marginBottom: '30px', transition: 'all 0.3s' },
        noteCard: {
            backgroundColor: themeColors.cardBg,
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: isDarkMode ? '0 4px 15px rgba(0, 0, 0, 0.15)' : '0 4px 12px rgba(15, 23, 42, 0.03)',
            border: `1px solid ${themeColors.border}`,
            animation: 'fadeInUp 0.5s ease-out forwards',
            transition: 'all 0.3s'
        },
        noteTitle: { fontSize: '18px', fontWeight: '700', color: themeColors.titleText, margin: '0 0 12px 0' },
        noteContent: { fontSize: '15px', color: isDarkMode ? '#cbd5e1' : '#334155', lineHeight: '1.6', margin: '0' },
        aiSummaryBox: { backgroundColor: isDarkMode ? '#172554' : '#eff6ff', borderLeft: '4px solid #2563eb', padding: '14px 16px', borderRadius: '8px', margin: '12px 0 20px 0' },
        aiSummaryText: { fontSize: '14.5px', color: isDarkMode ? '#93c5fd' : '#1e40af', margin: '0', lineHeight: '1.5' },
        downloadBadge: { display: 'inline-flex', alignItems: 'center', padding: '8px 14px', backgroundColor: isDarkMode ? '#064e3b' : '#f0fdf4', color: isDarkMode ? '#a7f3d0' : '#166534', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', border: isDarkMode ? '1px solid #047857' : '1px solid #bbf7d0', marginBottom: '15px' },
        actionArea: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: `1px solid ${themeColors.border}`, paddingTop: '16px' },
        editBtn: { backgroundColor: isDarkMode ? '#78350f' : '#fffbeb', color: isDarkMode ? '#fef3c7' : '#b45309', border: isDarkMode ? '1px solid #92400e' : '1px solid #fde68a', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13.5px' },
        deleteBtn: { backgroundColor: isDarkMode ? '#991b1b' : '#fff1f2', color: isDarkMode ? '#fee2e2' : '#be123c', border: isDarkMode ? '1px solid #b91c1c' : '1px solid #fecdd3', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13.5px' },
        // YENİ: Daha fazla göster butonu stili
        showMoreBtn: {
            background: 'none',
            border: 'none',
            color: isDarkMode ? '#60a5fa' : '#2563eb',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '13.5px',
            padding: '0',
            marginLeft: '6px',
            textDecoration: 'underline'
        },
        toastNotification: {
            position: 'fixed',
            top: '20px',
            right: toast.show ? '20px' : '-400px',
            padding: '16px 24px',
            borderRadius: '12px',
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '14.5px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            zIndex: 1000,
            transition: 'right 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        }
    };

    return (
        <div style={{ backgroundColor: themeColors.bg, minHeight: '100vh', transition: 'background-color 0.3s' }}>
            <div style={styles.appContainer}>

                <style>
                    {`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        @keyframes fadeInUp {
                            from { opacity: 0; transform: translateY(20px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        body {
                            background-color: ${themeColors.bg};
                            margin: 0;
                            transition: background-color 0.3s;
                        }
                    `}
                </style>

                <div style={styles.toastNotification}>
                    {toast.type === 'error' ? '❌' : '🔔'} {toast.message}
                </div>

                <button style={styles.themeToggle} onClick={() => setIsDarkMode(!isDarkMode)}>
                    {isDarkMode ? '☀️ Aydınlık Mod' : '🌙 Karanlık Mod'}
                </button>

                <div style={styles.headerSection}>
                    <h1 style={styles.mainTitle}>Yapay Zeka Destekli Not Defteri</h1>
                    <p style={styles.subTitle}>Dokümanlarınızı yükleyin, Gemini AI saniyeler içinde analiz etsin ve özetlesin ✨</p>
                </div>

                <div style={styles.formCard}>
                    <h2 style={{ ...styles.formTitle, color: editingId ? '#d97706' : themeColors.titleText }}>
                        {editingId ? '✏️ Notu Düzenle' : '➕ Yeni Not Ekle'}
                    </h2>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                        <input type="text" placeholder="Not Başlığı (Boş bırakırsanız yapay zeka üretir ✨)" value={title} onChange={(e) => setTitle(e.target.value)} style={styles.inputField} />
                        <textarea placeholder="Not içeriğini buraya yazın..." value={content} onChange={(e) => setContent(e.target.value)} rows="4" style={styles.textareaField} />

                        <div
                            style={styles.fileUploadContainer}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <input id="fileInput" type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} />
                            <label htmlFor="fileInput" style={{ cursor: 'pointer', display: 'block', width: '100%' }}>
                                <p style={styles.fileUploadText}>
                                    {file ? `✅ Seçilen Belge: ${file.name}` : isDragging ? '🔥 Dosyayı buraya bırakın!' : '📁 PDF dosyasını buraya sürükleyin veya seçmek için tıklayın'}
                                </p>
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    ...styles.submitButton,
                                    backgroundColor: editingId ? '#d97706' : '#2563eb',
                                    cursor: isLoading ? 'wait' : 'pointer',
                                    width: editingId ? 'auto' : '100%',
                                    flex: editingId ? 1 : 'none'
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <svg style={{ animation: 'spin 1s linear infinite', height: '20px', width: '20px', color: 'white' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}></circle>
                                            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style={{ opacity: 0.75 }}></path>
                                        </svg>
                                        Yapay Zeka Çalışıyor...
                                    </>
                                ) : (
                                    editingId ? 'Güncelle ve Yeniden Analiz Et' : 'Kaydet ve Özetle'
                                )}
                            </button>

                            {editingId && (
                                <button type="button" onClick={resetForm} style={styles.cancelButton}>İptal</button>
                            )}
                        </div>
                    </form>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <input type="text" placeholder="🔍 Kayıtlı notlar veya belgeler arasında hızlıca arayın..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchBar} />
                </div>

                {filteredNotes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: themeColors.subText }}>
                        <p style={{ fontSize: '16px', margin: '0 0 5px 0', fontWeight: '600' }}>Kritere uygun not bulunamadı</p>
                        <p style={{ fontSize: '14px', margin: '0' }}>Yeni bir not veya PDF ekleyerek başlayabilirsiniz.</p>
                    </div>
                ) : (
                    filteredNotes.map(note => (
                        <div key={note.id} style={styles.noteCard}>
                            <h3 style={styles.noteTitle}>{note.title}</h3>

                            {/* YENİ: Yapay Zeka Özet Alanı Artık Her Zaman Başlığın Altında (Üstte) */}
                            <div style={styles.aiSummaryBox}>
                                <p style={styles.aiSummaryText}>
                                    🤖 <strong>Yapay Zeka Analizi:</strong> {note.summary}
                                </p>
                            </div>

                            {/* YENİ: Not İçeriği - 200 Karakter Sınırı ve "Daha Fazla Göster" Butonu */}
                            <div style={{ marginBottom: '15px' }}>
                                <p style={styles.noteContent}>
                                    <strong>Not Detayı:</strong>{' '}
                                    {note.content && note.content.length > 200 && !expandedNoteIds.includes(note.id)
                                        ? `${note.content.substring(0, 200)}...`
                                        : note.content
                                    }
                                    {note.content && note.content.length > 200 && (
                                        <button
                                            onClick={() => toggleExpand(note.id)}
                                            style={styles.showMoreBtn}
                                        >
                                            {expandedNoteIds.includes(note.id) ? 'Daha Az Göster' : 'Daha Fazla Göster'}
                                        </button>
                                    )}
                                </p>
                            </div>

                            {note.pdfName && (
                                <div>
                                    <a href={`http://localhost:8080/api/notes/${note.id}/pdf`} download style={styles.downloadBadge}>
                                        📎 {note.pdfName}
                                    </a>
                                </div>
                            )}

                            <div style={styles.actionArea}>
                                <button onClick={() => handleEditClick(note)} style={styles.editBtn}>✏️ Düzenle</button>
                                <button onClick={() => handleDelete(note.id)} style={styles.deleteBtn}>🗑️ Sil</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default App;