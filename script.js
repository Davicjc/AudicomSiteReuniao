/**
 * AUDICOM TELECOM - Página Reunião
 * Script independente com efeitos de fundo
 * Fiber Canvas + Orb WebGL
 */

(function() {
    'use strict';

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
    // FIBER CANVAS - Animação de fibra ótica
    // ============================================
    (function initFiberCanvas() {
        const canvas = document.getElementById('fiber-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let animationId;
        let lastTime = 0;

        const isMobile = window.innerWidth <= 768;
        const SETTINGS = {
            particleCount: isMobile ? 30 : 80,
            connectionDistance: 150,
            particleSpeed: 0.3,
            flowSpeed: 0.002,
            glowIntensity: 0.8
        };

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

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < SETTINGS.connectionDistance) {
                        const opacity = (1 - distance / SETTINGS.connectionDistance) * 0.3;
                        
                        const gradient = ctx.createLinearGradient(
                            particles[i].x, particles[i].y,
                            particles[j].x, particles[j].y
                        );
                        
                        gradient.addColorStop(0, `rgba(0, 36, 156, ${opacity})`);
                        gradient.addColorStop(0.5, `rgba(143, 153, 168, ${opacity * 0.5})`);
                        gradient.addColorStop(1, `rgba(0, 36, 156, ${opacity})`);

                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = gradient;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function drawDataFlow(time) {
            const flowProgress = (time * SETTINGS.flowSpeed) % 1;

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < SETTINGS.connectionDistance * 0.7) {
                        const progress = (flowProgress + (i + j) * 0.1) % 1;
                        const flowX = particles[i].x + (particles[j].x - particles[i].x) * progress;
                        const flowY = particles[i].y + (particles[j].y - particles[i].y) * progress;

                        const packetOpacity = (1 - distance / SETTINGS.connectionDistance) * 0.8;
                        const packetSize = 1.5;

                        ctx.beginPath();
                        ctx.arc(flowX, flowY, packetSize, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(0, 36, 156, ${packetOpacity})`;
                        ctx.fill();

                        ctx.beginPath();
                        ctx.arc(flowX, flowY, packetSize * 3, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(0, 36, 156, ${packetOpacity * 0.2})`;
                        ctx.fill();
                    }
                }
            }
        }

        function drawScanLine(time) {
            const scanY = (Math.sin(time * 0.0005) + 1) * 0.5 * height;
            const scanWidth = 100;

            const gradient = ctx.createLinearGradient(0, scanY - scanWidth, 0, scanY + scanWidth);
            gradient.addColorStop(0, 'rgba(0, 36, 156, 0)');
            gradient.addColorStop(0.5, 'rgba(0, 36, 156, 0.05)');
            gradient.addColorStop(1, 'rgba(0, 36, 156, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, scanY - scanWidth, width, scanWidth * 2);
        }

        function animate(timestamp) {
            const deltaTime = timestamp - lastTime;
            lastTime = timestamp;

            ctx.fillStyle = 'rgba(8, 21, 53, 0.1)';
            ctx.fillRect(0, 0, width, height);

            drawScanLine(timestamp);

            particles.forEach(particle => {
                particle.update(timestamp);
            });

            drawConnections();
            drawDataFlow(timestamp);

            particles.forEach(particle => {
                particle.draw();
            });

            animationId = requestAnimationFrame(animate);
        }

        function init() {
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
            
            ctx.fillStyle = COLORS.azulEstrutura;
            ctx.fillRect(0, 0, width, height);
            
            requestAnimationFrame(animate);
        }

        init();
    })();

    // ============================================
    // ORB - Esfera fluida WebGL
    // ============================================
    (function initOrb() {
        const isMobile = window.innerWidth <= 768;
        
        const CONFIG = {
            size: isMobile ? 600 : 1100,
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
            const dpr = Math.min(window.devicePixelRatio, 2);
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

        function render(time) {
            const t = time * 0.001;
            const dt = t - lastTime;
            lastTime = t;

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

            const bgRgb = hexToRgb(CONFIG.backgroundColor);
            const color1Rgb = hexToRgb(CONFIG.color1);
            const color2Rgb = hexToRgb(CONFIG.color2);
            const color3Rgb = hexToRgb(CONFIG.color3);
            
            gl.uniform1f(gl.getUniformLocation(program, 'iTime'), t);
            gl.uniform3f(gl.getUniformLocation(program, 'iResolution'), canvas.width, canvas.height, canvas.width / canvas.height);
            gl.uniform1f(gl.getUniformLocation(program, 'hue'), CONFIG.hue);
            gl.uniform1f(gl.getUniformLocation(program, 'hover'), currentHover);
            gl.uniform1f(gl.getUniformLocation(program, 'rot'), currentRot);
            gl.uniform1f(gl.getUniformLocation(program, 'hoverIntensity'), CONFIG.hoverIntensity);
            gl.uniform3f(gl.getUniformLocation(program, 'backgroundColor'), bgRgb[0], bgRgb[1], bgRgb[2]);
            gl.uniform3f(gl.getUniformLocation(program, 'baseColor1'), color1Rgb[0], color1Rgb[1], color1Rgb[2]);
            gl.uniform3f(gl.getUniformLocation(program, 'baseColor2'), color2Rgb[0], color2Rgb[1], color2Rgb[2]);
            gl.uniform3f(gl.getUniformLocation(program, 'baseColor3'), color3Rgb[0], color3Rgb[1], color3Rgb[2]);

            gl.drawArrays(gl.TRIANGLES, 0, 6);

            animationId = requestAnimationFrame(render);
        }

        init();
    })();

    console.log('✅ Audicom Reunião carregado!');
})();
