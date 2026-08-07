/* ==========================================================================
   HANDMADE ROMANTIC BIRTHDAY SCRAPBOOK - JAVASCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Letters storage
  const lettersData = {
    "1": {
      title: "Open when you miss me",
      content: "My love, whenever you miss me, close your eyes and remember how deeply you are cherished. Distance or busy days can never change how close my heart is to yours. I am always just a call or a thought away. ❤"
    },
    "2": {
      title: "Open when you need a smile",
      content: "Here is your gentle reminder: your smile is my absolute favorite thing in the universe. You bring so much light, warmth, and laughter into my life. Take a deep breath and smile—you are doing great, and I love you endlessly! ☀️"
    },
    "3": {
      title: "Open on your birthday!",
      content: "HAPPY BIRTHDAY MY FAVORITE HUMAN! 🎉🎂 Today is the day the world got so much sweeter. I hope your day is filled with everything you love—good food, warm hugs, and pure joy. Thank you for being you!"
    },
    "4": {
      title: "Open when you can't sleep",
      content: "Wrap yourself up tight in your cozy blanket, imagine me holding you close, and let your mind rest. You're safe, you're loved, and tomorrow is a beautiful new day we get to share together. Sweet dreams, my love. 🌙"
    }
  };

  // Load custom saved letters from localStorage if available
  const savedLetters = localStorage.getItem('scrapbook_letters');
  if (savedLetters) {
    try {
      Object.assign(lettersData, JSON.parse(savedLetters));
    } catch (e) {
      console.warn('Could not parse saved letters', e);
    }
  }

  // --- ENVELOPE MODAL LOGIC ---
  const modalOverlay = document.getElementById('envelope-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  let currentLetterId = null;

  document.querySelectorAll('.envelope-card').forEach(card => {
    card.addEventListener('click', () => {
      currentLetterId = card.getAttribute('data-letter-id');
      card.classList.add('open');
      
      const letter = lettersData[currentLetterId] || { title: "Open When...", content: "Write your note here..." };
      modalTitle.textContent = letter.title;
      modalBody.textContent = letter.content;

      setTimeout(() => {
        modalOverlay.classList.add('active');
      }, 250);
    });
  });

  const closeModal = () => {
    modalOverlay.classList.remove('active');
    document.querySelectorAll('.envelope-card').forEach(c => c.classList.remove('open'));
    
    // Save modified letter text
    if (currentLetterId && modalBody.textContent) {
      lettersData[currentLetterId].content = modalBody.textContent.trim();
      localStorage.setItem('scrapbook_letters', JSON.stringify(lettersData));
    }
  };

  modalCloseBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // --- PHOTO UPLOAD LOGIC ---
  const fileInput = document.getElementById('file-input');
  let targetPhotoElement = null;

  // Load saved photos from localStorage
  const savedPhotos = localStorage.getItem('scrapbook_photos');
  if (savedPhotos) {
    try {
      const photoMap = JSON.parse(savedPhotos);
      Object.keys(photoMap).forEach(photoId => {
        const container = document.querySelector(`[data-photo-id="${photoId}"]`);
        if (container) {
          const img = container.querySelector('img');
          if (img) img.src = photoMap[photoId];
        }
      });
    } catch (e) {
      console.warn('Could not load saved photos', e);
    }
  }

  // Handle click on photo frames
  document.querySelectorAll('.polaroid, .filmstrip .cell').forEach(el => {
    el.addEventListener('click', (e) => {
      // Avoid triggering file picker if clicking on editable text in polaroid cap
      if (e.target.classList.contains('editable-text') || e.target.isContentEditable) {
        return;
      }
      targetPhotoElement = el;
      fileInput.click();
    });
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && targetPhotoElement) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        const img = targetPhotoElement.querySelector('img');
        if (img) {
          img.src = dataUrl;

          // Save to localStorage
          const photoId = targetPhotoElement.getAttribute('data-photo-id');
          if (photoId) {
            let photoMap = {};
            try {
              photoMap = JSON.parse(localStorage.getItem('scrapbook_photos') || '{}');
            } catch (err) {}
            photoMap[photoId] = dataUrl;
            localStorage.setItem('scrapbook_photos', JSON.stringify(photoMap));
          }
        }
      };
      reader.readAsDataURL(file);
    }
    fileInput.value = '';
  });

  // --- EDIT MODE TOGGLE & AUTOSAVE ---
  const btnToggleEdit = document.getElementById('btn-toggle-edit');
  let isEditing = false;

  btnToggleEdit.addEventListener('click', () => {
    isEditing = !isEditing;
    document.body.classList.toggle('editing-mode', isEditing);
    btnToggleEdit.classList.toggle('active', isEditing);
    btnToggleEdit.querySelector('span').textContent = isEditing ? 'Editing On ✨' : 'Edit Mode';
  });

  // Autosave editable text elements
  document.querySelectorAll('.editable-text').forEach((el, index) => {
    const savedText = localStorage.getItem(`scrapbook_text_${index}`);
    if (savedText) {
      el.innerHTML = savedText;
    }

    el.addEventListener('blur', () => {
      localStorage.setItem(`scrapbook_text_${index}`, el.innerHTML);
    });
  });

  // --- CHECKLIST INTERACTIVITY ---
  document.querySelectorAll('.check-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('editable-text') || e.target.isContentEditable) return;
      item.classList.toggle('checked');
    });
  });

  // --- PAGE SELECTOR & SPREAD VIEW ---
  const pageSelect = document.getElementById('page-select');
  const bookView = document.getElementById('book-view');
  const btnToggleSpread = document.getElementById('btn-toggle-spread');

  pageSelect.addEventListener('change', () => {
    const val = pageSelect.value;
    const pages = document.querySelectorAll('.page');
    if (val === 'all') {
      pages.forEach(p => p.style.display = 'block');
    } else {
      pages.forEach(p => {
        if (p.getAttribute('data-page') === val) {
          p.style.display = 'block';
          p.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (!bookView.classList.contains('spread-mode')) {
          p.style.display = 'none';
        }
      });
    }
  });

  btnToggleSpread.addEventListener('click', () => {
    const isSpread = bookView.classList.toggle('spread-mode');
    btnToggleSpread.classList.toggle('active', isSpread);
    btnToggleSpread.querySelector('span').textContent = isSpread ? 'Single Column View' : 'Side-by-Side View';
    
    document.querySelectorAll('.page').forEach(p => p.style.display = 'block');
    if (isSpread) pageSelect.value = 'all';
  });

  // --- PRINT / PDF EXPORT ---
  const btnPrint = document.getElementById('btn-print');
  btnPrint.addEventListener('click', () => {
    // Reveal all pages for print
    document.querySelectorAll('.page').forEach(p => p.style.display = 'block');
    window.print();
  });

  // --- JAAN NISAAR (FEMALE VERSION) ROMANTIC MELODY SYNTH & AUDIO PLAYER ---
  const btnMusic = document.getElementById('btn-music');
  let audioCtx = null;
  let isPlayingMusic = false;
  let timerId = null;
  let melodyIdx = 0;

  // HTML5 audio element support if user drops an MP3 file in assets/audio.mp3
  const audioFile = new Audio('assets/audio.mp3');
  audioFile.loop = true;
  let hasAudioFile = false;

  audioFile.addEventListener('canplaythrough', () => {
    hasAudioFile = true;
  });

  
  function playJaanNisaarNote() {
    if (!audioCtx || !isPlayingMusic) return;

    const note = jaanNisaarMelody[melodyIdx % jaanNisaarMelody.length];
    melodyIdx++;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Warm bell-piano tone mix
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(note[0], audioCtx.currentTime);

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + note[1]);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + note[1] + 0.1);

    const nextDelay = note[2] * 1000;
    timerId = setTimeout(playJaanNisaarNote, nextDelay);
  }

  // Play soft chime sound effect on envelope click
  function playEnvelopeChime() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0, audioCtx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.03, audioCtx.currentTime + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + idx * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(audioCtx.currentTime + idx * 0.08);
      osc.stop(audioCtx.currentTime + idx * 0.08 + 1.3);
    });
  }

  // Attach envelope chime sound effect
  document.querySelectorAll('.envelope-card').forEach(card => {
    card.addEventListener('click', () => {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      playEnvelopeChime();
    });
  });

  btnMusic.addEventListener('click', () => {
    isPlayingMusic = !isPlayingMusic;
    btnMusic.classList.toggle('active', isPlayingMusic);
    btnMusic.querySelector('span').textContent = isPlayingMusic ? 'Music on ♪' : 'Music Off';

    if (isPlayingMusic) {
      // Direct playback of assets/audio.mp3
      audioFile.play().then(() => {
        console.log('Playing assets/audio.mp3 successfully');
      }).catch((err) => {
        console.warn('Audio MP3 play fallback to synth:', err);
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        playJaanNisaarNote();
      });
    } else {
      audioFile.pause();
      if (timerId) clearTimeout(timerId);
    }
  });
});

