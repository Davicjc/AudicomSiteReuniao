/**
 * AUDICOM TELECOM - Página Reunião
 * Script independente com efeitos de fundo
 * Fiber Canvas + Orb WebGL
 * OTIMIZADO para performance
 */

(function() {
    'use strict';

    // ============================================
    // CONTROLE DE FPS E PERFORMANCE
    // ============================================
    const TARGET_FPS = 30;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;
    const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // ============================================
    // CORES DA MARCA
    // ============================================
    const COLORS = {
        azulConexao: '#00249C',
        azulEstrutura: '#081535',
        cinzaOperacional: '#8F99A8',
        grafiteInfra: '#2A2F36',
        brancoTecnico: '#F4F6F9'
    };

    // ============================================
    // FIBER CANVAS - Animação de fibra ótica (OTIMIZADO)
    // ============================================
    (function initFiberCanvas() {
        const canvas = document.getElementById('fiber-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        let width, height;
        let particles = [];
        let animationId;
        let lastFrameTime = 0;
        let connectionCache = [];
        let cacheValid = false;

        const SETTINGS = {
            particleCount: isMobile ? 15 : 40,
            connectionDistance: isMobile ? 100 : 130,
            particleSpeed: 0.25,
            flowSpeed: 0.0015,
            skipFrames: isMobile ? 2 : 1,
            cacheUpdateInterval: 5
        };
        let frameCounter = 0;

        function resizeCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        }

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 1;
                this.speedX = (Math.random() - 0.5) * SETTINGS.particleSpeed;
                this.speedY = (Math.random() - 0.5) * SETTINGS.particleSpeed;
                this.opacity = Math.random() * 0.5 + 0.2;
                this.pulsePhase = Math.random() * Math.PI * 2;
                this.pulseSpeed = Math.random() * 0.02 + 0.01;
            }

            update(time) {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;

                this.pulsePhase += this.pulseSpeed;
                this.currentOpacity = this.opacity + Math.sin(this.pulsePhase) * 0.2;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(244, 246, 249, ${this.currentOpacity})`;
                ctx.fill();

                if (this.size > 1.5) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(0, 36, 156, ${this.currentOpacity * 0.3})`;
                    ctx.fill();
                }
            }
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < SETTINGS.particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function updateConnectionCache() {
            connectionCache = [];
            const distSq = SETTINGS.connectionDistance * SETTINGS.connectionDistance;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < distSq) {
                        connectionCache.push({ i, j, d: Math.sqrt(d2) });
                    }
                }
            }
        }

        function drawConnections() {
            if (connectionCache.length === 0) return;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            for (let c = 0; c < connectionCache.length; c++) {
                const conn = connectionCache[c];
                const p1 = particles[conn.i];
                const p2 = particles[conn.j];
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
            }
            ctx.strokeStyle = 'rgba(0, 36, 156, 0.2)';
            ctx.stroke();
        }

        function drawDataFlow(time) {
            if (connectionCache.length === 0) return;
            const flowProgress = (time * SETTINGS.flowSpeed) % 1;
            const maxFlows = Math.min(connectionCache.length, isMobile ? 8 : 20);
            
            ctx.fillStyle = 'rgba(0, 36, 156, 0.5)';
            ctx.beginPath();
            for (let c = 0; c < maxFlows; c++) {
                const conn = connectionCache[c];
                const p1 = particles[conn.i];
                const p2 = particles[conn.j];
                const progress = (flowProgress + c * 0.15) % 1;
                const flowX = p1.x + (p2.x - p1.x) * progress;
                const flowY = p1.y + (p2.y - p1.y) * progress;
                ctx.moveTo(flowX + 1.5, flowY);
                ctx.arc(flowX, flowY, 1.5, 0, Math.PI * 2);
            }
            ctx.fill();
        }

        let scanGradient = null;
        function drawScanLine(time) {
            const scanY = (Math.sin(time * 0.0005) + 1) * 0.5 * height;
            const scanWidth = 100;
            if (!scanGradient) {
                scanGradient = ctx.createLinearGradient(0, 0, 0, 200);
                scanGradient.addColorStop(0, 'rgba(0, 36, 156, 0)');
                scanGradient.addColorStop(0.5, 'rgba(0, 36, 156, 0.04)');
                scanGradient.addColorStop(1, 'rgba(0, 36, 156, 0)');
            }
            ctx.save();
            ctx.translate(0, scanY - scanWidth);
            ctx.fillStyle = scanGradient;
            ctx.fillRect(0, 0, width, scanWidth * 2);
            ctx.restore();
        }

        function animate(timestamp) {
            animationId = requestAnimationFrame(animate);
            
            const elapsed = timestamp - lastFrameTime;
            if (elapsed < FRAME_INTERVAL) return;
            lastFrameTime = timestamp - (elapsed % FRAME_INTERVAL);

            frameCounter++;
            
            ctx.fillStyle = 'rgba(8, 21, 53, 0.12)';
            ctx.fillRect(0, 0, width, height);

            if (frameCounter % 3 === 0) drawScanLine(timestamp);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update(timestamp);
            }

            if (frameCounter % SETTINGS.cacheUpdateInterval === 0) {
                updateConnectionCache();
            }

            drawConnections();
            if (frameCounter % 2 === 0) drawDataFlow(timestamp);

            for (let i = 0; i < particles.length; i++) {
                particles[i].draw();
            }
        }

        let resizeTimeout;
        function debouncedResize() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeCanvas, 150);
        }

        function init() {
            resizeCanvas();
            window.addEventListener('resize', debouncedResize);
            
            ctx.fillStyle = COLORS.azulEstrutura;
            ctx.fillRect(0, 0, width, height);
            updateConnectionCache();
            
            requestAnimationFrame(animate);
        }

        init();
    })();

    // ============================================
    // ORB - Esfera fluida WebGL (OTIMIZADO)
    // ============================================
    (function initOrb() {
        const CONFIG = {
            size: isMobile ? 500 : 900,
            color1: '#0032D6',
            color2: '#00165E',
            color3: '#001D7D',
            hue: 0,
            mouseEffect: false,
            hoverIntensity: 0.1,
            rotateOnHover: false,
            forceHoverState: false,
            backgroundColor: '#000000'
        };
        
        let orbLastFrameTime = 0;

        function hexToRgb(hex) {
            hex = hex.replace('#', '');
            if (hex.length === 3) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            if (hex.length === 8) {
                hex = hex.substring(0, 6);
            }
            const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result
                ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
                : [0.03, 0.08, 0.21];
        }

        let canvas, gl, program;
        let animationId;
        let targetHover = 0;
        let currentHover = 0;
        let currentRot = 0;
        let lastTime = 0;

        const vertexShaderSource = `
            precision highp float;
            attribute vec2 a_position;
            varying vec2 vUv;
            void main() {
                vUv = a_position * 0.5 + 0.5;
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision highp float;

            uniform float iTime;
            uniform vec3 iResolution;
            uniform float hue;
            uniform float hover;
            uniform float rot;
            uniform float hoverIntensity;
            uniform vec3 backgroundColor;
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
                return -1.0 + 2.0 * fract(vec3(
                    p3.x + p3.y,
                    p3.x + p3.z,
                    p3.y + p3.z
                ) * p3.zyx);
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
                vec4 h = max(0.6 - vec4(
                    dot(d0, d0),
                    dot(d1, d1),
                    dot(d2, d2),
                    dot(d3, d3)
                ), 0.0);
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

            uniform vec3 baseColor1;
            uniform vec3 baseColor2;
            uniform vec3 baseColor3;
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
                
                float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.25)) * 0.5 + 0.5;
                float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
                float d0 = distance(uv, (r0 * invLen) * uv);
                float v0 = light1(1.0, 10.0, d0);

                v0 *= smoothstep(r0 * 1.05, r0, len);
                float innerFade = smoothstep(r0 * 0.8, r0 * 0.95, len);
                v0 *= mix(innerFade, 1.0, bgLuminance * 0.7);
                float cl = cos(ang + iTime * 1.0) * 0.5 + 0.5;
                
                float a = iTime * -0.3;
                vec2 pos = vec2(cos(a), sin(a)) * r0;
                float d = distance(uv, pos);
                float v1 = light2(1.2, 5.0, d);
                v1 *= light1(1.0, 50.0, d0);
                
                float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
                float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);
                
                vec3 colBase = mix(color1, color2, cl);
                float fadeAmount = mix(1.0, 0.1, bgLuminance);
                
                vec3 darkCol = mix(color3, colBase, v0);
                darkCol = (darkCol + v1 * 0.7) * v2 * v3;
                darkCol = clamp(darkCol, 0.0, 1.0);
                
                vec3 lightCol = (colBase + v1 * 0.7) * mix(1.0, v2 * v3, fadeAmount);
                lightCol = mix(backgroundColor, lightCol, v0);
                lightCol = clamp(lightCol, 0.0, 1.0);
                
                vec3 finalCol = mix(darkCol, lightCol, bgLuminance);
                
                return extractAlpha(finalCol);
            }

            vec4 mainImage(vec2 fragCoord) {
                vec2 center = iResolution.xy * 0.5;
                float size = min(iResolution.x, iResolution.y);
                vec2 uv = (fragCoord - center) / size * 2.0;
                
                float angle = rot;
                float s = sin(angle);
                float c = cos(angle);
                uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);
                
                uv.x += hover * hoverIntensity * 0.1 * sin(uv.y * 10.0 + iTime);
                uv.y += hover * hoverIntensity * 0.1 * sin(uv.x * 10.0 + iTime);
                
                return draw(uv);
            }

            void main() {
                vec2 fragCoord = vUv * iResolution.xy;
                vec4 col = mainImage(fragCoord);
                gl_FragColor = vec4(col.rgb * col.a, col.a);
            }
        `;

        function createShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Orb shader error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        function createProgram(gl, vertexShader, fragmentShader) {
            const prog = gl.createProgram();
            gl.attachShader(prog, vertexShader);
            gl.attachShader(prog, fragmentShader);
            gl.linkProgram(prog);
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                console.error('Orb program error:', gl.getProgramInfoLog(prog));
                gl.deleteProgram(prog);
                return null;
            }
            return prog;
        }

        function init() {
            const container = document.getElementById('orb-container');
            if (!container) return;

            canvas = document.createElement('canvas');
            canvas.style.cssText = `
                width: 100%;
                height: 100%;
                display: block;
            `;
            container.appendChild(canvas);

            gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
            if (!gl) {
                console.warn('Orb: WebGL não suportado');
                return;
            }

            const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
            if (!vertexShader || !fragmentShader) return;

            program = createProgram(gl, vertexShader, fragmentShader);
            if (!program) return;

            const positions = new Float32Array([
                -1, -1, 1, -1, -1, 1,
                -1, 1, 1, -1, 1, 1
            ]);

            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

            const positionLocation = gl.getAttribLocation(program, 'a_position');
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            window.addEventListener('resize', resize);
            
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mouseleave', () => { targetHover = 0; });

            resize();
            render(0);
            
            console.log('✅ Orb inicializado!');
        }

        function resize() {
            const container = canvas.parentElement;
            const dpr = Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5);
            const width = container.offsetWidth;
            const height = container.offsetHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }

        function handleMouseMove(e) {
            const container = canvas.parentElement;
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const width = rect.width;
            const height = rect.height;
            const size = Math.min(width, height);
            const centerX = width / 2;
            const centerY = height / 2;
            const uvX = ((x - centerX) / size) * 2.0;
            const uvY = ((y - centerY) / size) * 2.0;

            if (Math.sqrt(uvX * uvX + uvY * uvY) < 0.8) {
                targetHover = 1;
            } else {
                targetHover = 0;
            }
        }

        // Cache uniform locations
        let uniforms = null;
        function cacheUniforms() {
            uniforms = {
                iTime: gl.getUniformLocation(program, 'iTime'),
                iResolution: gl.getUniformLocation(program, 'iResolution'),
                hue: gl.getUniformLocation(program, 'hue'),
                hover: gl.getUniformLocation(program, 'hover'),
                rot: gl.getUniformLocation(program, 'rot'),
                hoverIntensity: gl.getUniformLocation(program, 'hoverIntensity'),
                backgroundColor: gl.getUniformLocation(program, 'backgroundColor'),
                baseColor1: gl.getUniformLocation(program, 'baseColor1'),
                baseColor2: gl.getUniformLocation(program, 'baseColor2'),
                baseColor3: gl.getUniformLocation(program, 'baseColor3')
            };
        }
        
        // Pre-compute colors
        let cachedColors = null;
        function cacheColors() {
            cachedColors = {
                bg: hexToRgb(CONFIG.backgroundColor),
                c1: hexToRgb(CONFIG.color1),
                c2: hexToRgb(CONFIG.color2),
                c3: hexToRgb(CONFIG.color3)
            };
        }

        function render(time) {
            animationId = requestAnimationFrame(render);
            
            const elapsed = time - orbLastFrameTime;
            if (elapsed < FRAME_INTERVAL) return;
            orbLastFrameTime = time - (elapsed % FRAME_INTERVAL);

            const t = time * 0.001;
            const dt = t - lastTime;
            lastTime = t;

            if (!uniforms) cacheUniforms();
            if (!cachedColors) cacheColors();

            let effectiveHover = 0;
            if (CONFIG.mouseEffect) {
                effectiveHover = CONFIG.forceHoverState ? 1 : targetHover;
                currentHover += (effectiveHover - currentHover) * 0.1;
            } else {
                currentHover = 0;
            }

            if (CONFIG.rotateOnHover && effectiveHover > 0.5) {
                currentRot += dt * 0.3;
            }

            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(program);
            
            gl.uniform1f(uniforms.iTime, t);
            gl.uniform3f(uniforms.iResolution, canvas.width, canvas.height, canvas.width / canvas.height);
            gl.uniform1f(uniforms.hue, CONFIG.hue);
            gl.uniform1f(uniforms.hover, currentHover);
            gl.uniform1f(uniforms.rot, currentRot);
            gl.uniform1f(uniforms.hoverIntensity, CONFIG.hoverIntensity);
            gl.uniform3f(uniforms.backgroundColor, cachedColors.bg[0], cachedColors.bg[1], cachedColors.bg[2]);
            gl.uniform3f(uniforms.baseColor1, cachedColors.c1[0], cachedColors.c1[1], cachedColors.c1[2]);
            gl.uniform3f(uniforms.baseColor2, cachedColors.c2[0], cachedColors.c2[1], cachedColors.c2[2]);
            gl.uniform3f(uniforms.baseColor3, cachedColors.c3[0], cachedColors.c3[1], cachedColors.c3[2]);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }

        init();
    })();

    // ============================================
    // Hora e temperatura (Uberlandia)
    // ============================================
    (function initInfoPanel() {
        const timeEl = document.getElementById('info-time');
        const tempEl = document.getElementById('info-temp');
        if (!timeEl || !tempEl) return;

        function updateClock() {
            const now = new Date();
            timeEl.textContent = now.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        async function updateTemperature() {
            try {
                tempEl.textContent = '...';
                const url = 'https://api.open-meteo.com/v1/forecast?latitude=-18.9186&longitude=-48.2772&current_weather=true&timezone=America%2FSao_Paulo';
                const response = await fetch(url, { cache: 'no-store' });
                if (!response.ok) throw new Error('Falha ao obter clima');
                const data = await response.json();
                const temp = data && data.current_weather && typeof data.current_weather.temperature === 'number'
                    ? Math.round(data.current_weather.temperature)
                    : null;
                tempEl.textContent = temp !== null ? `${temp}°C` : '--°C';
            } catch (err) {
                console.warn('Erro ao atualizar temperatura:', err);
                tempEl.textContent = '--°C';
            }
        }

        updateClock();
        setInterval(updateClock, 1000);
        updateTemperature();
        setInterval(updateTemperature, 10 * 60 * 1000);
    })();

    // ============================================
    // Nome do cliente editável no topo
    // ============================================
    (function initClientName() {
        const clientEl = document.getElementById('top-brand-client');
        if (!clientEl) return;

        function sanitize(text) {
            return text.trim().replace(/\s+/g, ' ').slice(0, 60);
        }

        function startEdit() {
            clientEl.setAttribute('contenteditable', 'true');
            const range = document.createRange();
            range.selectNodeContents(clientEl);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            clientEl.focus();
        }

        function finishEdit() {
            const value = sanitize(clientEl.textContent || '');
            clientEl.textContent = value || 'Cliente';
            clientEl.removeAttribute('contenteditable');
        }

        clientEl.addEventListener('click', () => startEdit());
        clientEl.addEventListener('blur', () => finishEdit());
        clientEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                finishEdit();
                clientEl.blur();
            }
        });

        // Detectar duplo espaço para editar
        let lastSpaceTime = 0;
        const DOUBLE_SPACE_DELAY = 400;

        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && e.target === document.body) {
                const now = Date.now();
                if (now - lastSpaceTime < DOUBLE_SPACE_DELAY) {
                    e.preventDefault();
                    startEdit();
                    lastSpaceTime = 0;
                } else {
                    lastSpaceTime = now;
                }
            }
        });
    })();

    // ============================================
    // Toggle visibilidade do top brand
    // ============================================
    (function initTopBrandToggle() {
        const topBrand = document.getElementById('top-brand');
        const hideBtn = document.getElementById('top-brand-hide');
        const showBtn = document.getElementById('top-brand-show');
        if (!topBrand || !hideBtn || !showBtn) return;

        hideBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            topBrand.classList.add('hidden');
            setTimeout(() => {
                showBtn.style.display = 'block';
            }, 300);
        });

        showBtn.addEventListener('click', () => {
            showBtn.style.display = 'none';
            topBrand.classList.remove('hidden');
        });
    })();

    console.log('✅ Audicom Reunião carregado!');

    // ============================================
    // Cursor customizado com logo
    // ============================================
    (function initCustomCursor() {
        const cursor = document.getElementById('custom-cursor');
        if (!cursor) return;

        let mouseX = 0;
        let mouseY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';

            // Detectar elementos clicáveis
            const target = e.target;
            const isClickable = target.tagName === 'A' || 
                              target.tagName === 'BUTTON' || 
                              target.getAttribute('contenteditable') === 'true' ||
                              target.classList.contains('top-brand-client') ||
                              target.closest('a, button');
            
            if (isClickable) {
                cursor.classList.add('hidden');
                document.body.style.cursor = 'pointer';
            } else {
                cursor.classList.remove('hidden');
                document.body.style.cursor = 'none';
            }
        });

        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '0.8';
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });
    })();
})();
