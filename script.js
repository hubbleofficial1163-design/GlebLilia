// ==============================================
// СВАДЕБНЫЙ САЙТ - ФРОНТЕНД
// Глеб & Лилия | 06.08.2026
// ==============================================

// Конфигурация
const CONFIG = {
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbw3mQQ9vOq-hQY__dD84Kemg4VBCmgtQOrby87ZRVX2S7Du7OzEMUccZ5moxJC7wHipGQ/exec',
    TELEGRAM_CHAT_URL: 'https://t.выоy',
    WEDDING_DATE: '2026-08-06T11:20:00'
};

// Прелоадер
document.addEventListener('DOMContentLoaded', function() {
    const loader = document.querySelector('.loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
    }, 800);
    
    initTelegramLink();
});

// Таймер
function updateCountdown() {
    const weddingDate = new Date(CONFIG.WEDDING_DATE).getTime();
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
        document.getElementById('days').innerText = '00';
        document.getElementById('hours').innerText = '00';
        document.getElementById('minutes').innerText = '00';
        document.getElementById('seconds').innerText = '00';
        return;
    }

    document.getElementById('days').innerText = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
    document.getElementById('hours').innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
    document.getElementById('minutes').innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
    document.getElementById('seconds').innerText = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Количество гостей
const guestsInput = document.getElementById('guests');
const minusBtn = document.querySelector('.minus-btn');
const plusBtn = document.querySelector('.plus-btn');

if (minusBtn && plusBtn) {
    minusBtn.addEventListener('click', function() {
        let currentValue = parseInt(guestsInput.value);
        if (currentValue > 1) {
            guestsInput.value = currentValue - 1;
            if (navigator.vibrate) navigator.vibrate(30);
        }
    });
    
    plusBtn.addEventListener('click', function() {
        let currentValue = parseInt(guestsInput.value);
        if (currentValue < 10) {
            guestsInput.value = currentValue + 1;
            if (navigator.vibrate) navigator.vibrate(30);
        }
    });
    
    guestsInput.addEventListener('change', function() {
        let value = parseInt(this.value);
        if (value < 1) this.value = 1;
        if (value > 10) this.value = 10;
    });
}

// Telegram
function initTelegramLink() {
    const chatLink = document.querySelector('.chat-link');
    if (chatLink && CONFIG.TELEGRAM_CHAT_URL) {
        chatLink.href = CONFIG.TELEGRAM_CHAT_URL;
        chatLink.target = '_blank';
        chatLink.rel = 'noopener noreferrer';
    }
}

// ===== ОБРАБОТКА ФОРМЫ RSVP =====
const rsvpForm = document.getElementById('rsvp-form');
if (rsvpForm) {
    rsvpForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const attendanceSelected = document.querySelector('input[name="attendance"]:checked');
        if (!attendanceSelected) {
            showError('Пожалуйста, выберите, сможете ли вы прийти');
            return;
        }
        
        const name = document.getElementById('name').value.trim();
        const contact = document.getElementById('contact').value.trim();
        
        if (!name) {
            showError('Пожалуйста, введите ваше имя');
            document.getElementById('name').focus();
            return;
        }
        
        if (!contact) {
            showError('Пожалуйста, введите email или телефон для связи');
            document.getElementById('contact').focus();
            return;
        }
        
        // АЛКОГОЛЬ
        const alcoholCheckboxes = document.querySelectorAll('input[name="alcohol"]:checked');
        const alcoholPreferences = Array.from(alcoholCheckboxes).map(cb => cb.value);
        
        const alcoholCustom = document.getElementById('alcohol_custom');
        if (alcoholCustom && alcoholCustom.value.trim()) {
            alcoholPreferences.push(`свой вариант: ${alcoholCustom.value.trim()}`);
        }
        
        const formData = {
            name: name,
            contact: contact,
            attendance: attendanceSelected.value,
            guests: document.getElementById('guests')?.value || 1,
            message: document.getElementById('message')?.value.trim() || '',
            alcohol: alcoholPreferences.length ? alcoholPreferences.join(', ') : 'не указано'
        };
        
        await submitRSVP(formData);
    });
}

// Отправка
async function submitRSVP(formData) {
    const submitBtn = document.querySelector('.submit-btn');
    const originalContent = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Отправка...</span>';
    submitBtn.disabled = true;
    
    try {
        const data = new URLSearchParams();
        data.append('name', formData.name);
        data.append('contact', formData.contact);
        data.append('attendance', formData.attendance);
        data.append('guests', formData.guests);
        data.append('message', formData.message);
        data.append('alcohol', formData.alcohol);
        
        await fetch(CONFIG.APPS_SCRIPT_URL, {
            method: 'POST',
            body: data,
            mode: 'no-cors'
        });
        
        showSuccess(formData.name);
        
    } catch (error) {
        console.error('Ошибка отправки:', error);
        showSuccess(formData.name);
    } finally {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

// Успех
function showSuccess(guestName) {
    const form = document.getElementById('rsvp-form');
    const successMessage = document.getElementById('success-message');
    
    const successTitle = successMessage.querySelector('h3');
    const successText = successMessage.querySelector('p');
    
    successTitle.textContent = `Спасибо, ${guestName}!`;
    successText.textContent = 'Ваш ответ успешно отправлен! Мы будем с нетерпением ждать встречи на нашей свадьбе.';
    
    form.style.display = 'none';
    successMessage.style.display = 'block';
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.activeElement.blur();
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
}

// Ошибка
function showError(message) {
    let errorDiv = document.querySelector('.form-error');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.style.cssText = `
            background: #fff5f5;
            border: 1px solid #feb2b2;
            color: #c53030;
            padding: 12px 16px;
            border-radius: 8px;
            margin: 15px 0;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: fadeIn 0.3s ease;
        `;
        
        const formHeader = document.querySelector('.form-header');
        if (formHeader) {
            formHeader.parentNode.insertBefore(errorDiv, formHeader.nextSibling);
        } else {
            rsvpForm.insertBefore(errorDiv, rsvpForm.firstChild);
        }
    }
    
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    setTimeout(() => {
        if (errorDiv && errorDiv.parentNode) {
            errorDiv.style.opacity = '0';
            errorDiv.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 300);
        }
    }, 5000);
    
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

// Новая кнопка
const newResponseBtn = document.getElementById('new-response');
if (newResponseBtn) {
    newResponseBtn.addEventListener('click', function() {
        const form = document.getElementById('rsvp-form');
        const successMessage = document.getElementById('success-message');
        
        form.reset();
        if (guestsInput) guestsInput.value = 1;
        
        const errors = document.querySelectorAll('.form-error');
        errors.forEach(error => error.remove());
        
        successMessage.style.display = 'none';
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('name').focus();
    });
}

// Плавная прокрутка
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const targetElement = document.querySelector(href);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Анимация
function animateOnScroll() {
    const elements = document.querySelectorAll('.timeline-item');
    const windowHeight = window.innerHeight;
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < windowHeight - 100) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// Предотвращение двойного тапа
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Анимация иконок
document.querySelectorAll('.icon-circle').forEach(icon => {
    icon.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.95)';
    });
    
    icon.addEventListener('touchend', function() {
        this.style.transform = 'scale(1.05)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
});

// CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .fa-spinner {
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// ===== ГАЛЕРЕЯ =====
document.addEventListener('DOMContentLoaded', function() {
    const track = document.getElementById('galleryTrack');
    const dots = document.querySelectorAll('.dot');
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    if (!track) return;

    function updateActiveDot() {
        const slides = track.querySelectorAll('.gallery-slide');
        const slideWidth = slides[0]?.offsetWidth || 0;
        const gap = 16;
        const scrollPosition = track.scrollLeft;
        const totalWidth = slideWidth + gap;
        
        let activeIndex = 0;
        if (totalWidth > 0) {
            activeIndex = Math.round(scrollPosition / totalWidth);
        }
        
        activeIndex = Math.min(activeIndex, dots.length - 1);
        activeIndex = Math.max(activeIndex, 0);
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
        });
    }

    function scrollToSlide(index) {
        const slides = track.querySelectorAll('.gallery-slide');
        if (slides[index]) {
            slides[index].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToSlide(index);
        });
        
        dot.addEventListener('touchstart', function(e) {
            e.preventDefault();
            scrollToSlide(index);
        }, { passive: false });
    });

    let scrollTimeout;
    track.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateActiveDot, 10);
    });

    track.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
        track.style.cursor = 'grabbing';
    });

    track.addEventListener('mouseleave', function() {
        isDragging = false;
        track.style.cursor = 'grab';
    });

    track.addEventListener('mouseup', function() {
        isDragging = false;
        track.style.cursor = 'grab';
    });

    track.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 1.5;
        track.scrollLeft = scrollLeft - walk;
    });

    setTimeout(updateActiveDot, 100);

    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateActiveDot, 300);
    });
});

// ===== МУЗЫКА =====
function initMusic() {
    const musicBtn = document.getElementById('musicBtn');
    const audio = new Audio();
    audio.src = '1.mp3';
    audio.loop = true;
    audio.volume = 0.5;
    
    let isPlaying = false;
    
    async function playMusic() {
        try {
            await audio.play();
            isPlaying = true;
            musicBtn.classList.add('playing');
            musicBtn.innerHTML = '<i class="fas fa-music"></i><span class="music-text">Музыка играет</span>';
        } catch (error) {
            console.log('Автовоспроизведение заблокировано');
            isPlaying = false;
        }
    }
    
    function pauseMusic() {
        audio.pause();
        isPlaying = false;
        musicBtn.classList.remove('playing');
        musicBtn.innerHTML = '<i class="fas fa-music"></i><span class="music-text">Включить музыку</span>';
    }
    
    musicBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (!isPlaying) playMusic();
        else pauseMusic();
        if (navigator.vibrate) navigator.vibrate(50);
    });
    
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && isPlaying) audio.pause();
        else if (!document.hidden && isPlaying) audio.play().catch(e => console.log('Не удалось возобновить'));
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initMusic();
});
