import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/Container';
import vinceImage from '../assets/about_us_picture/vince_olaivar.jpg';
import joshuaImage from '../assets/about_us_picture/joshua_jhon_juariza.jpg'; // Ensure these image files exist at src/assets/about_us_picture/
import '../css/Games.css'; // Reusing game page styles for consistency 

export default function AboutUs() {
  return (
    <main className="game-page"> {/* Reusing game-page styling */}
      <Container>
        <div className="game-header">
          <h1 className="game-title">About ArcadeHub</h1>
          <p className="game-info">Meet the creators of this webdev project!</p>
        </div>

        <div className="game-content" style={{ flexDirection: 'column', alignItems: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            gap: '2rem', 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            marginBottom: '2rem' 
          }}>
            {/* Vince's Section */}
            <div style={{ 
              background: '#1e293b', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              border: '1px solid #334155', 
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
              width: '280px'
            }}>
              <img 
                src={vinceImage} 
                alt="Vince Francis Olaivar" 
                style={{ 
                  width: '100%', 
                  height: '300px', 
                  objectFit: 'cover',
                  borderRadius: '8px', 
                  marginBottom: '1rem',
                  border: '3px solid #60a5fa'
                }} 
              />
              <h2 style={{ color: 'white', fontSize: '18px', marginBottom: '0.5rem' }}>Vince Francis Olaivar</h2>
              <p style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '14px' }}>Developer</p>
            </div>

            {/* Joshua's Section */}
            <div style={{ 
              background: '#1e293b', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              border: '1px solid #334155', 
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
              width: '280px'
            }}>
              <img 
                src={joshuaImage} 
                alt="Joshua Jhon Juariza" 
                style={{ 
                  width: '100%', 
                  height: '300px', 
                  objectFit: 'cover',
                  borderRadius: '8px', 
                  marginBottom: '1rem', 
                  border: '3px solid #60a5fa'
                }} 
              />
              <h2 style={{ color: 'white', fontSize: '18px', marginBottom: '0.5rem' }}>Joshua Jhon Juariza</h2>
              <p style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '14px' }}>Developer</p>
            </div>
          </div>

          <div style={{ 
            background: '#0f172a', 
            padding: '2rem', 
            borderRadius: '12px', 
            border: '1px solid #1e293b', 
            textAlign: 'center',
            width: '100%'
          }}>
            <h3 style={{ color: 'white', fontSize: '20px', marginBottom: '0.5rem' }}>BSCS 3A Students</h3>
            <p style={{ color: '#cbd5e1', fontSize: '16px', marginBottom: '1rem' }}>
              This website is our Web Development project.
            </p>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              ArcadeHub is a collection of classic arcade games, built with React and Supabase,
              featuring global leaderboards for friendly competition.
            </p>
          </div>
        </div>

        <Link to="/" className="game-back-link">← Back to Home</Link>
      </Container>
    </main>
  );
}