class SlayCalculator {
    constructor() {
        this.state = {
            currentNumber: '0',
            previousNumber: null,
            operator: null,
            waitingForSecondNumber: false,
            calculationHistory: [],
            mood: 'bestie',
            vibeCheck: 100,
            slayMode: false
        };

        this.reactions = [
            "bestie ate that! 💅",
            "period! ✨",
            "slay! 👑",
            "it's giving math! 🤪",
            "icon behavior! 💫",
            "no thoughts, just vibes! 🌟",
            "werk! 💅✨",
            "as they should! 👏",
            "living for this! 🔥",
            "i'm obsessed! 😌"
        ];

        this.moodEmojis = {
            'bestie': '😌',
            'slay': '💅',
            'extra': '🤪',
            'iconic': '👑',
            'main character': '💫',
            'queen': '👸',
            'understood the assignment': '📝'
        };

        this.quotes = [
            "bestie, it's giving math! ✨",
            "slay all day with calculations! 💅",
            "no thoughts, just numbers! 🧠",
            "icon behavior incoming! 👑",
            "material gorl doing material math! 💫",
            "we ate that calculation! 😌",
            "pop off king/queen! 👑",
            "living my best math life! ✨"
        ];

        this.initializeEventListeners();
        this.updateDisplay();
        this.startVibeCheck();
    }

    initializeEventListeners() {
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleButtonPress(e.target);
                this.addSparkles(e);
                this.vibeCheck();
            });
        });

        // Easter egg: Double-click to enter SLAY MODE
        document.querySelector('.calculator-container').addEventListener('dblclick', () => {
            this.toggleSlayMode();
        });
    }

    handleButtonPress(button) {
        this.playRandomSound();
        
        if (button.classList.contains('number')) {
            this.handleNumber(button.dataset.value);
        } else if (button.classList.contains('operator')) {
            this.handleOperator(button.dataset.action);
        } else if (button.classList.contains('special')) {
            this.handleSpecial(button.dataset.action);
        }

        this.showRandomReaction();
    }

    handleNumber(num) {
        if (this.state.waitingForSecondNumber) {
            this.state.currentNumber = num;
            this.state.waitingForSecondNumber = false;
        } else {
            this.state.currentNumber = this.state.currentNumber === '0' ? 
                num : this.state.currentNumber + num;
        }
        this.updateDisplay();
    }

    handleOperator(operator) {
        if (operator === 'equals') {
            this.calculateResult();
            this.showExtraReaction();
        } else {
            this.state.operator = operator;
            this.state.previousNumber = this.state.currentNumber;
            this.state.waitingForSecondNumber = true;
        }
        this.updateDisplay();
    }

    calculateResult() {
        if (!this.state.operator || !this.state.previousNumber) return;

        const prev = parseFloat(this.state.previousNumber);
        const current = parseFloat(this.state.currentNumber);
        let result;

        switch (this.state.operator) {
            case 'add':
                result = prev + current;
                break;
            case 'subtract':
                result = prev - current;
                break;
            case 'multiply':
                result = prev * current;
                break;
            case 'divide':
                result = prev / current;
                break;
        }

        this.state.currentNumber = result.toString();
        this.state.operator = null;
        this.state.previousNumber = null;
        this.updateMood('slay');
        this.showExtraReaction();
    }

    updateDisplay() {
        document.querySelector('.current-calculation').textContent = this.state.currentNumber;
        document.querySelector('.binary-display').textContent = 
            this.convertToBinary(parseFloat(this.state.currentNumber));

        if (this.state.operator) {
            document.querySelector('.calculation-history').textContent = 
                `${this.state.previousNumber} ${this.getOperatorSymbol(this.state.operator)}`;
        } else {
            document.querySelector('.calculation-history').textContent = '';
        }

        document.querySelector('.mood-text').textContent = 
            `bestie is ${this.state.mood}...`;
        
        document.querySelector('.mood-emoji').textContent = 
            this.moodEmojis[this.state.mood] || '😌';
    }

    showRandomReaction() {
        const reaction = this.reactions[Math.floor(Math.random() * this.reactions.length)];
        const bubble = document.querySelector('.reaction-bubble');
        bubble.textContent = reaction;
        bubble.style.animation = 'none';
        bubble.offsetHeight; // Trigger reflow
        bubble.style.animation = null;
    }

    showExtraReaction() {
        const container = document.querySelector('.calculator-container');
        container.classList.add('slay-mode');
        setTimeout(() => container.classList.remove('slay-mode'), 1000);
        
        this.updateQuote();
    }

    updateQuote() {
        const quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        document.querySelector('.quote-text').textContent = quote;
    }

    toggleSlayMode() {
        this.state.slayMode = !this.state.slayMode;
        const container = document.querySelector('.calculator-container');
        if (this.state.slayMode) {
            container.style.animation = 'slayTime 1s infinite';
            this.updateMood('iconic');
        } else {
            container.style.animation = '';
            this.updateMood('bestie');
        }
    }

    updateMood(mood) {
        this.state.mood = mood;
        document.querySelector('.mood-emoji').textContent = this.moodEmojis[mood];
    }

    vibeCheck() {
        this.state.vibeCheck = Math.min(100, this.state.vibeCheck + 5);
        const vibeEmoji = this.state.vibeCheck > 80 ? '✨' : 
                         this.state.vibeCheck > 50 ? '💫' : '🌙';
        document.querySelector('.vibe-check').textContent = vibeEmoji;
    }

    startVibeCheck() {
        setInterval(() => {
            this.state.vibeCheck = Math.max(0, this.state.vibeCheck - 1);
            if (this.state.vibeCheck < 20) {
                this.updateMood('needs coffee');
            }
        }, 1000);

        // Random mood changes
        setInterval(() => {
            const moods = Object.keys(this.moodEmojis);
            this.updateMood(moods[Math.floor(Math.random() * moods.length)]);
        }, 10000);

        // Update quotes
        setInterval(() => {
            this.updateQuote();
        }, 5000);
    }

    addSparkles(event) {
        const button = event.target;
        const rect = button.getBoundingClientRect();
        
        for (let i = 0; i < 5; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = `${rect.left + Math.random() * rect.width}px`;
            sparkle.style.top = `${rect.top + Math.random() * rect.height}px`;
            sparkle.style.width = `${Math.random() * 10 + 5}px`;
            sparkle.style.height = sparkle.style.width;
            document.body.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 1000);
        }
    }

    playRandomSound() {
        const sounds = [
            'https://www.myinstants.com/media/sounds/pop-cat.mp3',
            'https://www.myinstants.com/media/sounds/vine-boom.mp3',
            'https://www.myinstants.com/media/sounds/skibidi.mp3'
        ];
        
        const audio = new Audio(sounds[Math.floor(Math.random() * sounds.length)]);
        audio.volume = 0.1;
        audio.play().catch(() => {});
    }

    convertToBinary(num) {
        return Math.abs(Math.round(num)).toString(2).padStart(8, '0');
    }

    getOperatorSymbol(operator) {
        const symbols = {
            add: '+',
            subtract: '-',
            multiply: '×',
            divide: '÷'
        };
        return symbols[operator] || '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new SlayCalculator();
});
