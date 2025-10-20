document.addEventListener('DOMContentLoaded', () => {
    // Initialize particle system with extra sparkly config
    particlesJS('cosmic-particles', {
        particles: {
            number: {
                value: 100,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: ['#ff6ad5', '#c774e8', '#ad8cff', '#8795e8', '#94d973']
            },
            shape: {
                type: ['circle', 'star'],
                stroke: {
                    width: 0,
                    color: '#fff'
                },
                polygon: {
                    nb_sides: 5
                }
            },
            opacity: {
                value: 0.6,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: true,
                    speed: 2,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#ff6ad5',
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 3,
                direction: 'none',
                random: true,
                straight: false,
                out_mode: 'out',
                bounce: false,
                attract: {
                    enable: true,
                    rotateX: 600,
                    rotateY: 1200
                }
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: true,
                    mode: 'repulse'
                },
                onclick: {
                    enable: true,
                    mode: 'push'
                },
                resize: true
            },
            modes: {
                repulse: {
                    distance: 100,
                    duration: 0.4
                },
                push: {
                    particles_nb: 4
                }
            }
        },
        retina_detect: true
    });

    // Add cursor trail effect
    const coords = { x: 0, y: 0 };
    const circles = document.querySelectorAll('.cursor-trail');

    const colors = [
        '#ff6ad5',
        '#c774e8',
        '#ad8cff',
        '#8795e8',
        '#94d973'
    ];

    circles.forEach(function (circle, index) {
        circle.x = 0;
        circle.y = 0;
        circle.style.backgroundColor = colors[index % colors.length];
    });

    window.addEventListener('mousemove', function(e){
        coords.x = e.clientX;
        coords.y = e.clientY;
    });

    function animateCircles() {
        let x = coords.x;
        let y = coords.y;

        circles.forEach(function (circle, index) {
            circle.style.left = x - 12 + 'px';
            circle.style.top = y - 12 + 'px';

            circle.style.scale = (circles.length - index) / circles.length;

            circle.x = x;
            circle.y = y;

            const nextCircle = circles[index + 1] || circles[0];
            x += (nextCircle.x - x) * 0.3;
            y += (nextCircle.y - y) * 0.3;
        });

        requestAnimationFrame(animateCircles);
    }

    animateCircles();

    // Super extra button effects
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('mouseover', (e) => {
            const x = e.pageX - button.offsetLeft;
            const y = e.pageY - button.offsetTop;

            button.style.setProperty('--xPos', `${x}px`);
            button.style.setProperty('--yPos', `${y}px`);
        });

        button.addEventListener('click', (e) => {
            // Create and append multiple emoji particles
            const emojis = ['✨', '💫', '⭐️', '🌟', '💅', '👑'];
            for (let i = 0; i < 5; i++) {
                const emoji = document.createElement('span');
                emoji.className = 'emoji-particle';
                emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                
                // Random position around click
                const x = e.clientX;
                const y = e.clientY;
                const deltaX = (Math.random() - 0.5) * 100;
                const deltaY = (Math.random() - 0.5) * 100;
                
                emoji.style.left = `${x}px`;
                emoji.style.top = `${y}px`;
                
                document.body.appendChild(emoji);
                
                // Animate
                setTimeout(() => {
                    emoji.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0)`;
                    emoji.style.opacity = '0';
                    setTimeout(() => emoji.remove(), 1000);
                }, 50);
            }
        });
    });

    // Extra animations for special vibes
    const calculateVibes = () => {
        const now = new Date();
        const hours = now.getHours();
        
        // Night mode vibes (10 PM - 6 AM)
        if (hours >= 22 || hours < 6) {
            document.documentElement.style.setProperty('--primary-color', '#6b4dd9');
            document.documentElement.style.setProperty('--secondary-color', '#4527a0');
        }
        // Morning vibes (6 AM - 12 PM)
        else if (hours >= 6 && hours < 12) {
            document.documentElement.style.setProperty('--primary-color', '#ff6ad5');
            document.documentElement.style.setProperty('--secondary-color', '#c774e8');
        }
        // Afternoon vibes (12 PM - 5 PM)
        else if (hours >= 12 && hours < 17) {
            document.documentElement.style.setProperty('--primary-color', '#ad8cff');
            document.documentElement.style.setProperty('--secondary-color', '#8795e8');
        }
        // Evening vibes (5 PM - 10 PM)
        else {
            document.documentElement.style.setProperty('--primary-color', '#94d973');
            document.documentElement.style.setProperty('--secondary-color', '#7cb342');
        }
    };

    // Update vibes every hour
    calculateVibes();
    setInterval(calculateVibes, 3600000);

    // Add some extra keyboard fun
    document.addEventListener('keydown', (e) => {
        if (e.key >= '0' && e.key <= '9') {
            const btn = document.querySelector(`[data-value="${e.key}"]`);
            if (btn) {
                btn.classList.add('animate__animated', 'animate__rubberBand');
                
                // Add some sparkle emojis
                const sparkle = document.createElement('span');
                sparkle.textContent = '✨';
                sparkle.style.position = 'absolute';
                sparkle.style.left = `${btn.offsetLeft + btn.offsetWidth / 2}px`;
                sparkle.style.top = `${btn.offsetTop}px`;
                sparkle.style.animation = 'sparkleFloat 1s forwards';
                document.body.appendChild(sparkle);
                
                setTimeout(() => {
                    btn.classList.remove('animate__animated', 'animate__rubberBand');
                    sparkle.remove();
                }, 1000);
            }
        }
    });
});
