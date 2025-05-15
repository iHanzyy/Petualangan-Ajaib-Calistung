import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

const AboutContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  color: var(--secondary-color);
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
`;

const HomeButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: var(--border-radius);
  text-decoration: none;
  font-size: 1.2rem;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #0069d9;
    text-decoration: none;
  }
`;

const GameModeList = styled.ul`
  list-style-type: none;
  padding-left: 1rem;
`;

const GameModeItem = styled.li`
  margin-bottom: 1rem;
  
  strong {
    color: var(--primary-color);
  }
`;

/**
 * About page component showing information about the game
 * 
 * @returns {JSX.Element} - Rendered component
 */
const About = () => {
  return (
    <AboutContainer>
      <Title>Tentang Petualangan Ajaib Calistung</Title>
      
      <Section>
        <SectionTitle>Apa itu Calistung?</SectionTitle>
        <p>
          Calistung adalah singkatan dari Membaca, Menulis, dan Berhitung. 
          Aplikasi permainan ini dirancang untuk membantu anak-anak berkebutuhan khusus 
          belajar keterampilan dasar melalui cara yang menyenangkan dan interaktif.
        </p>
      </Section>
      
      <Section>
        <SectionTitle>Cara Bermain</SectionTitle>
        <GameModeList>
          <GameModeItem>
            <strong>Mode Membaca</strong> - Dengarkan kata yang diucapkan, lalu ucapkan kembali kata tersebut 
            melalui mikrofon. Anda akan mendapat umpan balik tentang pengucapan Anda.
          </GameModeItem>
          <GameModeItem>
            <strong>Mode Menulis</strong> - Lihat huruf atau angka yang ditampilkan, lalu tuliskan dengan menggunakan 
            mouse pada papan gambar. Sistem akan menilai kecocokan tulisan Anda.
          </GameModeItem>
          <GameModeItem>
            <strong>Mode Berhitung</strong> - Jawab soal-soal matematika sederhana dengan bantuan visual. 
            Pilih jawaban yang benar dari opsi yang tersedia.
          </GameModeItem>
        </GameModeList>
      </Section>
      
      <Section>
        <SectionTitle>Sistem Permainan</SectionTitle>
        <p>
          Anda memulai dengan 3 nyawa (hati). Setiap jawaban yang salah akan mengurangi 1 nyawa. 
          Jika semua nyawa habis, Anda dapat memulai ulang permainan. Setiap jawaban benar akan
          memberikan Anda umpan balik positif dan mendorong Anda untuk terus belajar!
        </p>
      </Section>
      
      <Section>
        <SectionTitle>Tentang Pengembang</SectionTitle>
        <p>
          Aplikasi ini dikembangkan untuk membantu anak-anak berkebutuhan khusus belajar 
          keterampilan dasar dengan cara yang inklusif dan menyenangkan. Kami percaya bahwa 
          setiap anak memiliki potensi untuk belajar dan tumbuh dengan dukungan yang tepat.
        </p>
      </Section>
      
      <HomeButton to="/" aria-label="Kembali ke Menu Utama">
        <FontAwesomeIcon icon={faHome} /> Kembali ke Menu Utama
      </HomeButton>
    </AboutContainer>
  );
};

export default About;
