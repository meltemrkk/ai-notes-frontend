import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // YENİ: Yükleniyor durumu ve Düzenleme (Edit) state'leri
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchNotes = () => {
        axios.get('http://localhost:8080/api/notes')
            .then(response => setNotes(response.data))
            .catch(error => console.error("Notlar çekilirken bir hata oluştu:", error));
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    // YENİ: Hem Ekleme (POST) hem Güncelleme (PUT) işlemini yöneten fonksiyon
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !content) return;

        setIsLoading(true); // Yükleniyor animasyonunu başlat
        const notePayload = { title: title, content: content };

        if (editingId) {
            // Düzenleme Modu (PUT)
            axios.put(`http://localhost:8080/api/notes/${editingId}`, notePayload)
                .then(() => {
                    fetchNotes();
                    resetForm();
                })
                .catch(error => console.error("Güncelleme hatası:", error))
                .finally(() => setIsLoading(false));
        } else {
            // Yeni Ekleme Modu (POST)
            axios.post('http://localhost:8080/api/notes', notePayload)
                .then(() => {
                    fetchNotes();
                    resetForm();
                })
                .catch(error => console.error("Ekleme hatası:", error))
                .finally(() => setIsLoading(false));
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = window.confirm("Bu notu silmek istediğinize emin misiniz?");
        if (isConfirmed) {
            try {
                await axios.delete(`http://localhost:8080/api/notes/${id}`);
                setNotes(notes.filter(note => note.id !== id));
            } catch (error) {
                console.error("Not silinirken hata:", error);
            }
        }
    };

    // YENİ: Düzenle butonuna basıldığında formu dolduran fonksiyon
    const handleEditClick = (note) => {
        setEditingId(note.id);
        setTitle(note.title);
        setContent(note.content);
        window.scrollTo(0, 0); // Sayfanın en üstüne (forma) kaydır
    };

    const resetForm = () => {
        setEditingId(null);
        setTitle('');
        setContent('');
    };

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>Yapay Zeka Destekli Notlar</h1>

            {/* Düzenleme veya Ekleme Formu */}
            <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
                <h2 style={{ marginTop: '0', color: editingId ? '#d35400' : '#333' }}>
                    {editingId ? 'Notu Düzenle' : 'Yeni Not Ekle'}
                </h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        type="text"
                        placeholder="Not Başlığı"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
                    />
                    <textarea
                        placeholder="Not içeriğini buraya yazın..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows="4"
                        style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" disabled={isLoading} style={{ flex: 1, padding: '12px', backgroundColor: editingId ? '#d35400' : '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: isLoading ? 'wait' : 'pointer', fontWeight: 'bold' }}>
                            {isLoading ? '⏳ Yapay Zeka İşliyor...' : (editingId ? 'Güncelle ve Yeniden Özetle' : 'Kaydet ve Özetle')}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} style={{ padding: '12px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                İptal
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Arama Çubuğu */}
            <div style={{ marginBottom: '30px' }}>
                <input
                    type="text"
                    placeholder="🔍 Notlarda ara (Başlık veya içerik)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #0056b3', fontSize: '16px', boxSizing: 'border-box' }}
                />
            </div>

            {/* Not Listesi */}
            {filteredNotes.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#777', fontStyle: 'italic' }}>Kritere uygun not bulunamadı...</p>
            ) : (
                filteredNotes.map(note => (
                    <div key={note.id} style={{ border: '1px solid #ccc', margin: '15px 0', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
                        <h2 style={{ margin: '0 0 10px 0', color: '#0056b3' }}>{note.title}</h2>
                        <p style={{ fontSize: '16px' }}><strong>Not:</strong> {note.content}</p>
                        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '15px 0' }} />
                        <p style={{ fontStyle: 'italic', color: '#555', margin: '0' }}>✨ <strong>Yapay Zeka Özeti:</strong> {note.summary}</p>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                            {/* YENİ: Düzenle Butonu */}
                            <button onClick={() => handleEditClick(note)} style={{ backgroundColor: '#ffc107', color: '#333', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                                ✏️ Düzenle
                            </button>
                            <button onClick={() => handleDelete(note.id)} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                                🗑️ Sil
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default App;