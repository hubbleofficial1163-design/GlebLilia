// ==============================================
// СВАДЕБНЫЙ САЙТ - ГЛЕБ & ЛИЛИЯ
// Интеграция с Google Sheets
// ==============================================

(function() {
    // ========== КОНФИГУРАЦИЯ ==========
    // ⚠️ ЗАМЕНИТЕ ЭТОТ URL НА ВАШ URL ИЗ APPS SCRIPT ⚠️
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyFoW4XIETLNif7Gagbt0rZGdDjtzJ2eFuh8Dgo9UwiFORMe4ioLzq5eePimiJRquXfIA/exec';
    
    let isSubmitting = false;
    
    // ========== БАЗОВЫЕ СТИЛИ АНИМАЦИЙ ==========
    const coreStyles = document.createElement('style');
    coreStyles.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(coreStyles);
    
    // ========== УНИВЕРСАЛЬНОЕ МОДАЛЬНОЕ ОКНО ==========
    function showModal(title, message, isError = false) {
        const existingModal = document.getElementById('customModal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'customModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;

        const icon = isError ? '✕' : '✓';
        const iconColor = isError ? '#c62828' : '#2e7d32';
        const bgIconColor = isError ? '#ffebee' : '#e8f5e9';
        const borderColor = isError ? '#c62828' : '#2e7d32';

        modal.innerHTML = `
            <div style="
                background: #ffffff;
                border-radius: 16px;
                padding: 32px 40px;
                max-width: 380px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 35px rgba(0, 0, 0, 0.15);
                animation: slideUp 0.3s ease;
                border-top: 3px solid ${borderColor};
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            ">
                <div style="
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: ${bgIconColor};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px auto;
                ">
                    <div style="
                        font-size: 32px;
                        font-weight: 400;
                        color: ${iconColor};
                        line-height: 1;
                    ">${icon}</div>
                </div>
                <h3 style="
                    font-size: 24px;
                    font-weight: 500;
                    color: #1a1a1a;
                    margin-bottom: 12px;
                    letter-spacing: -0.3px;
                ">${title}</h3>
                <p style="
                    font-size: 16px;
                    color: #555555;
                    margin-bottom: 28px;
                    line-height: 1.5;
                ">${message}</p>
                <button onclick="this.closest('#customModal').remove()" style="
                    background: #f5f5f5;
                    color: #333333;
                    border: none;
                    padding: 12px 32px;
                    border-radius: 40px;
                    font-family: inherit;
                    font-size: 15px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='#e8e8e8'" onmouseout="this.style.background='#f5f5f5'">
                    Закрыть
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        if (!isError) {
            setTimeout(() => {
                if (modal.parentElement) modal.remove();
            }, 4000);
        }
    }
    
    // ========== МОДАЛЬНОЕ ОКНО ЗАГРУЗКИ ==========
    function showLoadingModal() {
        const existingLoading = document.getElementById('loadingModal');
        if (existingLoading) existingLoading.remove();
        
        const loadingModal = document.createElement('div');
        loadingModal.id = 'loadingModal';
        loadingModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(3px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        loadingModal.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                padding: 32px 40px;
                text-align: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            ">
                <div style="
                    width: 50px;
                    height: 50px;
                    border: 3px solid #e0e0e0;
                    border-top-color: #d4b89c;
                    border-radius: 50%;
                    margin: 0 auto 20px;
                    animation: spin 1s linear infinite;
                "></div>
                <p style="
                    font-size: 15px;
                    color: #5a4c3e;
                    margin: 0;
                    font-weight: 500;
                ">Отправка ответа...</p>
            </div>
        `;
        document.body.appendChild(loadingModal);
        return loadingModal;
    }
    
    // ========== ОТПРАВКА В GOOGLE SHEETS ==========
    async function sendToGoogleSheets(formData) {
        const formBody = new URLSearchParams();
        formBody.append('name', formData.name);
        formBody.append('attendance', formData.attendance);
        formBody.append('alcohol', formData.alcohol);
        
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formBody.toString()
        });
        
        const result = await response.json();
        return result;
    }
    
    // ========== ТАЙМЕР ==========
    function updateCountdown() {
        const weddingDate = new Date('2026-08-06T11:20:00').getTime();
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
    
    // ========== ПРЕЛОАДЕР ==========
    document.addEventListener('DOMContentLoaded', function() {
        const loader = document.querySelector('.loader');
        if (loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                loader.style.visibility = 'hidden';
            }, 800);
        }
    });
    
    // ========== КОЛИЧЕСТВО ГОСТЕЙ ==========
    const guestsInput = document.getElementById('guests');
    const minusBtn = document.querySelector('.minus-btn');
    const plusBtn = document.querySelector('.plus-btn');

    if (minusBtn && plusBtn && guestsInput) {
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
    
    // ========== ГАЛЕРЕЯ ==========
    function initGallery() {
        const track = document.getElementById('galleryTrack');
        const dots = document.querySelectorAll('.dot');
        if (!track) return;

        let isDragging = false;
        let startX = 0;
        let scrollLeft = 0;

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
    }

    document.addEventListener('DOMContentLoaded', function() {
        initGallery();
    });
    
    // ========== МУЗЫКА ==========
    function initMusic() {
        const musicBtn = document.getElementById('musicBtn');
        if (!musicBtn) return;
        
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
    
    // ========== ИНИЦИАЛИЗАЦИЯ ФОРМЫ ==========
    function initRSVPForm() {
        const form = document.getElementById('rsvp-form');
        if (!form) {
            console.error('❌ Форма с id="rsvp-form" не найдена!');
            return;
        }
        
        console.log('✅ Форма найдена, инициализация...');
        
        const nameInput = document.getElementById('name');
        const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
        const alcoholCheckboxes = document.querySelectorAll('input[name="alcohol"]');
        const alcoholCustom = document.getElementById('alcohol_custom');
        const submitBtn = form.querySelector('.submit-btn');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (isSubmitting) return;
            
            const name = nameInput ? nameInput.value.trim() : '';
            
            let attendance = null;
            attendanceRadios.forEach(radio => {
                if (radio.checked) attendance = radio.value;
            });
            
            // Собираем алкоголь
            let alcoholValues = [];
            alcoholCheckboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    alcoholValues.push(checkbox.value);
                }
            });
            
            // Добавляем свой вариант
            if (alcoholCustom && alcoholCustom.value.trim()) {
                alcoholValues.push(`свой вариант: ${alcoholCustom.value.trim()}`);
            }
            
            const alcoholString = alcoholValues.length ? alcoholValues.join(', ') : 'не указано';
            
            // Валидация
            if (!name) {
                showModal('Ошибка', 'Пожалуйста, введите ваше имя', true);
                if (nameInput) nameInput.focus();
                return;
            }
            
            if (!attendance) {
                showModal('Ошибка', 'Пожалуйста, выберите, сможете ли вы прийти', true);
                return;
            }
            
            // Блокируем кнопку
            isSubmitting = true;
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Отправка...</span>';
            }
            
            const loadingModal = showLoadingModal();
            
            try {
                const formData = { 
                    name: name, 
                    attendance: attendance, 
                    alcohol: alcoholString 
                };
                
                const result = await sendToGoogleSheets(formData);
                
                loadingModal.remove();
                
                if (result.result === 'success') {
                    // Показываем успех через встроенный блок
                    const successMessage = document.getElementById('success-message');
                    const formDiv = document.getElementById('rsvp-form');
                    
                    if (successMessage && formDiv) {
                        const successTitle = successMessage.querySelector('h3');
                        if (successTitle) {
                            successTitle.textContent = `Спасибо, ${name}!`;
                        }
                        formDiv.style.display = 'none';
                        successMessage.style.display = 'block';
                        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        showModal('Ответ отправлен!', `Спасибо, ${name}! Мы будем ждать вас на свадьбе! 🎉`, false);
                    }
                    
                    // Очищаем форму
                    if (nameInput) nameInput.value = '';
                    attendanceRadios.forEach(radio => radio.checked = false);
                    alcoholCheckboxes.forEach(checkbox => checkbox.checked = false);
                    if (alcoholCustom) alcoholCustom.value = '';
                    
                    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
                } else {
                    throw new Error(result.message || 'Ошибка отправки');
                }
            } catch (error) {
                loadingModal.remove();
                showModal('Ошибка', error.message || 'Произошла ошибка при отправке. Пожалуйста, попробуйте ещё раз.', true);
            } finally {
                isSubmitting = false;
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span>Отправить ответ</span><i class="fas fa-paper-plane"></i>';
                }
            }
        });
    }
    
    // ========== НОВЫЙ ОТВЕТ ==========
    const newResponseBtn = document.getElementById('new-response');
    if (newResponseBtn) {
        newResponseBtn.addEventListener('click', function() {
            const form = document.getElementById('rsvp-form');
            const successMessage = document.getElementById('success-message');
            const nameInput = document.getElementById('name');
            const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
            const alcoholCheckboxes = document.querySelectorAll('input[name="alcohol"]');
            const alcoholCustom = document.getElementById('alcohol_custom');
            
            if (form) form.reset();
            if (nameInput) nameInput.value = '';
            attendanceRadios.forEach(radio => radio.checked = false);
            alcoholCheckboxes.forEach(checkbox => checkbox.checked = false);
            if (alcoholCustom) alcoholCustom.value = '';
            
            if (successMessage) successMessage.style.display = 'none';
            if (form) form.style.display = 'block';
            
            if (form) form.scrollIntoView({ behavior: 'smooth' });
            if (nameInput) nameInput.focus();
        });
    }
    
    // ========== ПЛАВНАЯ ПРОКРУТКА ==========
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
    
    // ========== АНИМАЦИЯ ==========
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
    
    // ========== ПРЕДОТВРАЩЕНИЕ ДВОЙНОГО ТАПА ==========
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // ========== АНИМАЦИЯ ИКОНОК ==========
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
    
    // ========== ЗАПУСК ==========
    document.addEventListener('DOMContentLoaded', function() {
        initRSVPForm();
        console.log('✅ Форма RSVP готова к отправке в Google Sheets');
        console.log('📊 URL скрипта:', SCRIPT_URL);
    });
    
})();
