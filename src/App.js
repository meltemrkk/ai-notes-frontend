import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    // Arka uçtan notları çeken fonksiyon
    const fetchNotes = () => {
        axios.get('http://localhost:8080/api/notes')
            .then(response => {
                setNotes(response.data);
            })
            .catch(error => {
                console.error("Notlar çekilirken bir hata oluştu:", error);
            });
    };

    // Sayfa ilk yüklendiğinde notları getir
    useEffect(() => {
        fetchNotes();
    }, []);

    // Forma tıklandığında çalışacak POST (Ekleme) işlemi
    const handleAddNote = (e) => {
        e.preventDefault(); // Sayfanın gereksiz yere yenilenmesini engeller
        if (!title || !content) return; // Başlık veya içerik boşsa işlem yapma

        const newNote = { title: title, content: content };

        // Yeni notu arka uca gönder
        axios.post('http://localhost:8080/api/notes', newNote)
            .then(response => {
                fetchNotes(); // Listeyi güncelle ki yeni not ekranda görünsün
                setTitle(''); // Başlık kutusunu temizle
                setContent(''); // İçerik kutusunu temizle
            })
            .catch(error => {
                console.error("Not eklenirken hata oluştu:", error);
            });
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>Yapay Zeka Destekli Notlar</h1>

            {/* --- Yeni Not Ekleme Formu Başlangıcı --- */}
            <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
                <h2 style={{ marginTop: '0' }}>Yeni Not Ekle</h2>
                <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        type="text"
                        placeholder="Not Başlığı"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
                    />
                    <textarea
                        placeholder="Not içeriğini buraya yazın... (Yapay zeka bu kısmı özetleyecek)"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows="4"
                        style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
                    />
                    <button type="submit" style={{ padding: '12px 15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Notu Kaydet ve Özetle
                    </button>
                </form>
            </div>
            {/* --- Form Bitişi --- */}

            {/* Ekrandaki Notların Listesi */}
            {notes.length === 0 ? (
                <p style={{ textAlign: 'center' }}>Henüz hiç not yok...</p>
            ) : (
                notes.map(note => (
                    <div key={note.id} style={{ border: '1px solid #ccc', margin: '15px 0', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
                        <h2 style={{ margin: '0 0 10px 0', color: '#0056b3' }}>{note.title}</h2>
                        <p style={{ fontSize: '16px' }}><strong>Not:</strong> {note.content}</p>
                        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '15px 0' }} />
                        <p style={{ fontStyle: 'italic', color: '#555', margin: '0' }}>✨ <strong>Yapay Zeka Özeti:</strong> {note.summary}</p>
                    </div>
                ))
            )}
        </div>
    );
}

export default App;