/**
 * AUDICOM TELECOM - Página Reunião
 * Script profissional para TV em sala de reunião
 */

(function () {
    'use strict';

    // ============================================
    // CONFIGURAÇÃO
    // ============================================
    const isMobile = window.innerWidth <= 768;

    const COLORS = {
        azulConexao: '#00249C',
        azulEstrutura: '#081535',
        cinzaOperacional: '#8F99A8',
        brancoTecnico: '#F4F6F9'
    };

    // Lista de logos de clientes (arquivos reais)
    const CLIENT_LOGOS = [
        '1.jpg', '2.png', '3.png', '4.png', '5.png', '6.jpg',
        '7.png', '8.webp', '9.png', '10.jpg', '11.jpg', '12.png',
        '13.jpg', '14.jpg', '15.jpg', '16.jpg', '17.png', '18.png',
        '19.jpg', '20.png', '21.png'
    ];

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    document.addEventListener('DOMContentLoaded', function () {
        initTime();
        initTemperature();
        initDate();
        initClientsCarousel();
        initClientNameEditor();
        initConfigMenu();
        initCursorAutoHide();
        initFiberCanvas();
        initOrb();
        initRoomStatus();
        initTaglineRotation();
        loadSavedSettings();
    });

    // ============================================
    // HORA EM TEMPO REAL
    // ============================================
    function initTime() {
        const timeElement = document.getElementById('info-time');
        if (!timeElement) return;

        function updateTime() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            timeElement.textContent = `${hours}:${minutes}`;
        }

        updateTime();
        setInterval(updateTime, 1000);
    }

    // ============================================
    // DATA
    // ============================================
    function initDate() {
        const dateElement = document.getElementById('header-date');
        if (!dateElement) return;

        const now = new Date();
        const options = {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        };
        const dateStr = now.toLocaleDateString('pt-BR', options);
        // Capitalize first letter
        dateElement.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    }

    // ============================================
    // TEMPERATURA (API)
    // ============================================
    function initTemperature() {
        const tempElement = document.getElementById('info-temp');
        if (!tempElement) return;

        // Uberlândia coordinates
        const lat = -18.9186;
        const lon = -48.2772;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.current_weather) {
                    const temp = Math.round(data.current_weather.temperature);
                    tempElement.textContent = `${temp}°C`;
                }
            })
            .catch(() => {
                tempElement.textContent = '--°C';
            });

        // Atualizar a cada 10 minutos
        setInterval(() => initTemperature(), 600000);
    }

    // ============================================
    // CARROSSEL DE CLIENTES
    // ============================================
    function initClientsCarousel() {
        const track = document.getElementById('clients-track');
        if (!track) return;

        // Criar logos duplicados para scroll infinito
        const createLogos = () => {
            return CLIENT_LOGOS.map(logo => {
                const img = document.createElement('img');
                img.src = `assets/logos/${logo}`;
                img.alt = logo.replace('.png', '');
                img.className = 'client-logo';
                img.loading = 'lazy';
                return img;
            });
        };

        // Adicionar logos 2x para loop contínuo
        const logos1 = createLogos();
        const logos2 = createLogos();

        logos1.forEach(img => track.appendChild(img));
        logos2.forEach(img => track.appendChild(img));
    }

    // ============================================
    // EDITOR DE NOME DO CLIENTE
    // ============================================
    function initClientNameEditor() {
        const clientElement = document.getElementById('top-brand-client');
        if (!clientElement) return;

        // Carregar nome salvo
        const savedName = localStorage.getItem('audicom-client-name');
        if (savedName) {
            clientElement.textContent = savedName;
        }

        // Tornar editável ao clicar
        clientElement.addEventListener('click', function () {
            this.contentEditable = 'true';
            this.focus();

            // Selecionar todo o texto
            const range = document.createRange();
            range.selectNodeContents(this);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        });

        // Salvar ao sair
        clientElement.addEventListener('blur', function () {
            this.contentEditable = 'false';
            const name = this.textContent.trim() || 'Cliente';
            this.textContent = name;
            localStorage.setItem('audicom-client-name', name);
        });

        // Enter salva
        clientElement.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
    }

    // ============================================
    // STATUS DA SALA (clique para alternar)
    // ============================================
    function initRoomStatus() {
        const statusElement = document.getElementById('room-status');
        const statusText = statusElement?.querySelector('.status-text');
        if (!statusElement || !statusText) return;

        // Carregar status salvo
        const savedStatus = localStorage.getItem('audicom-room-status');
        if (savedStatus === 'busy') {
            statusElement.classList.remove('available');
            statusElement.classList.add('busy');
            statusText.textContent = 'Em Reunião';
        }

        // Clique para alternar
        statusElement.addEventListener('click', function () {
            const isAvailable = this.classList.contains('available');

            if (isAvailable) {
                this.classList.remove('available');
                this.classList.add('busy');
                statusText.textContent = 'Em Reunião';
                localStorage.setItem('audicom-room-status', 'busy');
            } else {
                this.classList.remove('busy');
                this.classList.add('available');
                statusText.textContent = 'Sala Disponível';
                localStorage.setItem('audicom-room-status', 'available');
            }
        });
    }

    // ============================================
    // TAGLINE ROTATIVA
    // ============================================
    function initTaglineRotation() {
        const taglineElement = document.getElementById('tagline');
        if (!taglineElement) return;

        const taglines = [
            'Conectando o futuro com excelência',
            'Tecnologia que transforma negócios',
            'Soluções que fazem a diferença',
            'Inovação em telecomunicações'
        ];

        let currentIndex = 0;

        function rotateTagline() {
            taglineElement.style.opacity = '0';

            setTimeout(() => {
                currentIndex = (currentIndex + 1) % taglines.length;
                taglineElement.textContent = taglines[currentIndex];
                taglineElement.style.opacity = '0.8';
            }, 500);
        }

        // Trocar a cada 10 segundos
        setInterval(rotateTagline, 10000);
    }

    // ============================================
    // MENU DE CONFIGURAÇÃO (ESPAÇO 2x)
    // ============================================
    function initConfigMenu() {
        const menu = document.getElementById('config-menu');
        const closeBtn = document.getElementById('config-menu-close');
        if (!menu) return;

        let lastSpaceTime = 0;
        const DOUBLE_TAP_DELAY = 400;

        // Duplo espaço para abrir/fechar
        document.addEventListener('keydown', function (e) {
            if (e.code === 'Space' && !e.target.isContentEditable) {
                e.preventDefault();
                const now = Date.now();

                if (now - lastSpaceTime < DOUBLE_TAP_DELAY) {
                    menu.classList.toggle('active');
                    lastSpaceTime = 0;
                } else {
                    lastSpaceTime = now;
                }
            }

            // ESC fecha
            if (e.key === 'Escape' && menu.classList.contains('active')) {
                menu.classList.remove('active');
            }
        });

        // Botão fechar
        if (closeBtn) {
            closeBtn.addEventListener('click', () => menu.classList.remove('active'));
        }

        // Configurar toggles
        setupConfigToggles();
    }

    function setupConfigToggles() {
        const toggles = {
            'config-logo': { target: '.hero-bg-logo', key: 'logo' },
            'config-titulo': { target: '.hero-title-centered', key: 'titulo' },
            'config-clientes': { target: '.footer-clients', key: 'clientes' },
            'config-header': { target: '.header-bar', key: 'header' },
            'config-orb': { target: '#orb-container', key: 'orb' },
            'config-fiber': { target: '#fiber-canvas', key: 'fiber' },
            'config-status': { target: '#room-status', key: 'status' },
            'config-tagline': { target: '#tagline', key: 'tagline' },
            'config-wifi': { target: '.wifi-qr', key: 'wifi' }
        };

        Object.entries(toggles).forEach(([checkboxId, config]) => {
            const checkbox = document.getElementById(checkboxId);
            const target = document.querySelector(config.target);

            if (!checkbox || !target) return;

            checkbox.addEventListener('change', function () {
                if (this.checked) {
                    target.classList.remove('hidden');
                } else {
                    target.classList.add('hidden');
                }
                saveSettings();
            });
        });
    }

    function saveSettings() {
        const settings = {};
        document.querySelectorAll('.config-menu input[type="checkbox"]').forEach(cb => {
            settings[cb.id] = cb.checked;
        });
        localStorage.setItem('audicom-display-settings', JSON.stringify(settings));
    }

    function loadSavedSettings() {
        const saved = localStorage.getItem('audicom-display-settings');
        if (!saved) return;

        try {
            const settings = JSON.parse(saved);
            Object.entries(settings).forEach(([id, checked]) => {
                const checkbox = document.getElementById(id);
                if (checkbox) {
                    checkbox.checked = checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        } catch (e) {
            console.warn('Erro ao carregar configurações:', e);
        }
    }

    // ============================================
    // CURSOR AUTO-HIDE
    // ============================================
    function initCursorAutoHide() {
        let timeout;
        const HIDE_DELAY = 5000;

        function showCursor() {
            document.body.classList.remove('cursor-hidden');
            clearTimeout(timeout);
            timeout = setTimeout(hideCursor, HIDE_DELAY);
        }

        function hideCursor() {
            document.body.classList.add('cursor-hidden');
        }

        document.addEventListener('mousemove', showCursor);
        document.addEventListener('mousedown', showCursor);

        // Iniciar timer
        timeout = setTimeout(hideCursor, HIDE_DELAY);
    }

    // ============================================
    // FIBER CANVAS (Partículas de fundo)
    // ============================================
    function initFiberCanvas() {
        const canvas = document.getElementById('fiber-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let animationId;

        const SETTINGS = {
            particleCount: isMobile ? 50 : 100,
            connectionDistance: isMobile ? 120 : 180,
            particleSpeed: 0.25
        };

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        }

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 1;
                this.speedX = (Math.random() - 0.5) * SETTINGS.particleSpeed;
                this.speedY = (Math.random() - 0.5) * SETTINGS.particleSpeed;
                this.opacity = Math.random() * 0.4 + 0.2;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(244, 246, 249, ${this.opacity})`;
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < SETTINGS.particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < SETTINGS.connectionDistance) {
                        const opacity = (1 - dist / SETTINGS.connectionDistance) * 0.4;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 50, 214, ${opacity})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            drawConnections();
            animationId = requestAnimationFrame(animate);
        }

        resize();
        window.addEventListener('resize', resize);
        animate();
    }

    // ============================================
    // ORB (Esfera Fluida WebGL - igual ao site principal)
    // ============================================
    function initOrb() {
        const container = document.getElementById('orb-container');
        if (!container) return;

        const CONFIG = {
            color1: '#0032D6',   // Cor primária (azul)
            color2: '#00165E',   // Cor secundária (azul escuro)
            color3: '#001D7D',   // Cor de profundidade
            hue: 0,
            hoverIntensity: 0.5,
            backgroundColor: '#081535',
            speed: 0.3          // Velocidade reduzida
        };

        function hexToRgb(hex) {
            hex = hex.replace('#', '');
            const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result
                ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
                : [0.03, 0.08, 0.21];
        }

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'width:100%;height:100%;display:block;';
        container.appendChild(canvas);

        const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
        if (!gl) return;

        // Vertex Shader
        const vsSource = `
            precision highp float;
            attribute vec2 a_position;
            varying vec2 vUv;
            void main() {
                vUv = a_position * 0.5 + 0.5;
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        // Fragment Shader - Orb fluido colorido
        const fsSource = `
            precision highp float;
            uniform float iTime;
            uniform vec3 iResolution;
            uniform float hue;
            uniform vec3 backgroundColor;
            uniform vec3 baseColor1;
            uniform vec3 baseColor2;
            uniform vec3 baseColor3;
            varying vec2 vUv;

            vec3 rgb2yiq(vec3 c) {
                float y = dot(c, vec3(0.299, 0.587, 0.114));
                float i = dot(c, vec3(0.596, -0.274, -0.322));
                float q = dot(c, vec3(0.211, -0.523, 0.312));
                return vec3(y, i, q);
            }
            
            vec3 yiq2rgb(vec3 c) {
                float r = c.x + 0.956 * c.y + 0.621 * c.z;
                float g = c.x - 0.272 * c.y - 0.647 * c.z;
                float b = c.x - 1.106 * c.y + 1.703 * c.z;
                return vec3(r, g, b);
            }
            
            vec3 adjustHue(vec3 color, float hueDeg) {
                float hueRad = hueDeg * 3.14159265 / 180.0;
                vec3 yiq = rgb2yiq(color);
                float cosA = cos(hueRad);
                float sinA = sin(hueRad);
                float i = yiq.y * cosA - yiq.z * sinA;
                float q = yiq.y * sinA + yiq.z * cosA;
                yiq.y = i;
                yiq.z = q;
                return yiq2rgb(yiq);
            }

            vec3 hash33(vec3 p3) {
                p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
                p3 += dot(p3, p3.yxz + 19.19);
                return -1.0 + 2.0 * fract(vec3(p3.x + p3.y, p3.x + p3.z, p3.y + p3.z) * p3.zyx);
            }

            float snoise3(vec3 p) {
                const float K1 = 0.333333333;
                const float K2 = 0.166666667;
                vec3 i = floor(p + (p.x + p.y + p.z) * K1);
                vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
                vec3 e = step(vec3(0.0), d0 - d0.yzx);
                vec3 i1 = e * (1.0 - e.zxy);
                vec3 i2 = 1.0 - e.zxy * (1.0 - e);
                vec3 d1 = d0 - (i1 - K2);
                vec3 d2 = d0 - (i2 - K1);
                vec3 d3 = d0 - 0.5;
                vec4 h = max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);
                vec4 n = h * h * h * h * vec4(
                    dot(d0, hash33(i)),
                    dot(d1, hash33(i + i1)),
                    dot(d2, hash33(i + i2)),
                    dot(d3, hash33(i + 1.0))
                );
                return dot(vec4(31.316), n);
            }

            vec4 extractAlpha(vec3 colorIn) {
                float a = max(max(colorIn.r, colorIn.g), colorIn.b);
                return vec4(colorIn.rgb / (a + 1e-5), a);
            }

            const float innerRadius = 0.6;
            const float noiseScale = 0.65;

            float light1(float intensity, float attenuation, float dist) {
                return intensity / (1.0 + dist * attenuation);
            }
            float light2(float intensity, float attenuation, float dist) {
                return intensity / (1.0 + dist * dist * attenuation);
            }

            vec4 draw(vec2 uv) {
                vec3 color1 = adjustHue(baseColor1, hue);
                vec3 color2 = adjustHue(baseColor2, hue);
                vec3 color3 = adjustHue(baseColor3, hue);
                
                float ang = atan(uv.y, uv.x);
                float len = length(uv);
                float invLen = len > 0.0 ? 1.0 / len : 0.0;

                float bgLuminance = dot(backgroundColor, vec3(0.299, 0.587, 0.114));
                
                float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.5)) * 0.5 + 0.5;
                float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
                float d0 = distance(uv, (r0 * invLen) * uv);
                float v0 = light1(1.0, 10.0, d0);

                v0 *= smoothstep(r0 * 1.05, r0, len);
                float innerFade = smoothstep(r0 * 0.8, r0 * 0.95, len);
                v0 *= mix(innerFade, 1.0, bgLuminance * 0.7);
                float cl = cos(ang + iTime * 2.0) * 0.5 + 0.5;
                
                float a = iTime * -1.0;
                vec2 pos = vec2(cos(a), sin(a)) * r0;
                float d = distance(uv, pos);
                float v1 = light2(1.5, 5.0, d);
                v1 *= light1(1.0, 50.0, d0);
                
                float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
                float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);
                
                vec3 colBase = mix(color1, color2, cl);
                float fadeAmount = mix(1.0, 0.1, bgLuminance);
                
                vec3 darkCol = mix(color3, colBase, v0);
                darkCol = (darkCol + v1) * v2 * v3;
                darkCol = clamp(darkCol, 0.0, 1.0);
                
                vec3 lightCol = (colBase + v1) * mix(1.0, v2 * v3, fadeAmount);
                lightCol = mix(backgroundColor, lightCol, v0);
                lightCol = clamp(lightCol, 0.0, 1.0);
                
                vec3 finalCol = mix(darkCol, lightCol, bgLuminance);
                
                return extractAlpha(finalCol);
            }

            void main() {
                vec2 center = iResolution.xy * 0.5;
                float size = min(iResolution.x, iResolution.y);
                vec2 uv = (gl_FragCoord.xy - center) / size * 2.0;
                
                vec4 col = draw(uv);
                gl_FragColor = vec4(col.rgb * col.a, col.a);
            }
        `;

        function createShader(type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader error:', gl.getShaderInfoLog(shader));
                return null;
            }
            return shader;
        }

        const vs = createShader(gl.VERTEX_SHADER, vsSource);
        const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
        if (!vs || !fs) return;

        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        gl.useProgram(program);

        // Fullscreen quad
        const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const posLoc = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        const bgRgb = hexToRgb(CONFIG.backgroundColor);
        const c1 = hexToRgb(CONFIG.color1);
        const c2 = hexToRgb(CONFIG.color2);
        const c3 = hexToRgb(CONFIG.color3);

        function resize() {
            const dpr = Math.min(window.devicePixelRatio, 2);
            canvas.width = container.offsetWidth * dpr;
            canvas.height = container.offsetHeight * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }

        function render(time) {
            const t = time * 0.001 * CONFIG.speed;  // Velocidade reduzida

            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.uniform1f(gl.getUniformLocation(program, 'iTime'), t);
            gl.uniform3f(gl.getUniformLocation(program, 'iResolution'), canvas.width, canvas.height, 1);
            gl.uniform1f(gl.getUniformLocation(program, 'hue'), CONFIG.hue);
            gl.uniform3f(gl.getUniformLocation(program, 'backgroundColor'), bgRgb[0], bgRgb[1], bgRgb[2]);
            gl.uniform3f(gl.getUniformLocation(program, 'baseColor1'), c1[0], c1[1], c1[2]);
            gl.uniform3f(gl.getUniformLocation(program, 'baseColor2'), c2[0], c2[1], c2[2]);
            gl.uniform3f(gl.getUniformLocation(program, 'baseColor3'), c3[0], c3[1], c3[2]);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            requestAnimationFrame(render);
        }

        resize();
        window.addEventListener('resize', resize);
        render(0);
    }

})();
