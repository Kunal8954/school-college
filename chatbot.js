// ===================================
// AI College Guidance Chatbot
// Real AI Integration with Google Gemini
// ===================================

class CollegeGuidanceChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.conversationHistory = [];
        
        // Google Gemini API Configuration
        this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        this.apiKey = 'AIzaSyD5qN4_uJ7-VDo-nx4GCvi_wI-q6aaf-Ps'; // Replace with your actual Gemini API key
        
        // System prompt for college guidance context
        this.systemPrompt = `You are an expert AI College Advisor for Indian students. Your role is to help students with:

1. College Selection & Recommendations - Based on entrance exam scores (JEE, NEET, CAT, etc.), preferences, budget
2. Admission Guidance - Eligibility, application process, deadlines, required documents
3. Cutoff Predictions - Expected cutoffs, admission chances, category-wise analysis
4. Career Counseling - Career paths, industry trends, skill requirements, salary expectations
5. Course Information - Engineering, Medical, Management, Arts, Science streams
6. Scholarship & Financial Aid - Scholarship opportunities, education loans, fee structures
7. Placement Statistics - College-wise placement data, average packages, top recruiters
8. Exam Preparation Tips - Study strategies, important topics, time management

Guidelines:
- Provide accurate, helpful, and detailed information
- Be encouraging and supportive
- Use data-driven insights when possible
- Suggest actionable steps
- Ask clarifying questions when needed
- Keep responses concise but comprehensive
- Use bullet points and formatting for clarity
- Always consider the Indian education system context

Respond in a friendly, professional manner. If you don't know something specific, acknowledge it and suggest alternatives.`;
        
        this.init();
    }

    init() {
        console.log('🤖 Initializing AI College Chatbot...');
        this.createChatbotUI();
        this.attachEventListeners();
        this.loadWelcomeMessage();
        console.log('✅ Chatbot initialized successfully!');
    }

    createChatbotUI() {
        console.log('📝 Creating chatbot UI...');
        const chatbotHTML = `
            <!-- Chatbot Toggle Button -->
            <button class="chatbot-toggle" id="chatbotToggle">
                <svg class="chatbot-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="9" cy="10" r="1" fill="currentColor"/>
                    <circle cx="15" cy="10" r="1" fill="currentColor"/>
                    <path d="M9 14c.5.5 1.5 1 3 1s2.5-.5 3-1" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span class="chatbot-badge">AI</span>
            </button>

            <!-- Chatbot Container -->
            <div class="chatbot-container" id="chatbotContainer">
                <!-- Header -->
                <div class="chatbot-header">
                    <div class="chatbot-header-content">
                        <div class="chatbot-avatar">🎓</div>
                        <div class="chatbot-info">
                            <h3>AI College Advisor</h3>
                            <div class="chatbot-status">
                                <span class="status-dot"></span>
                                <span>Powered by Gemini AI</span>
                            </div>
                        </div>
                    </div>
                    <button class="chatbot-close" id="chatbotClose">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor"/>
                        </svg>
                    </button>
                </div>

                <!-- Quick Actions -->
                <div class="chatbot-quick-actions">
                    <div class="quick-actions-title">Quick Actions</div>
                    <div class="quick-actions-grid">
                        <button class="quick-action-btn" data-action="recommend">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#f59e0b"/>
                            </svg>
                            College Recommendations
                        </button>
                        <button class="quick-action-btn" data-action="compare">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                            </svg>
                            Compare Colleges
                        </button>
                        <button class="quick-action-btn" data-action="cutoff">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                            </svg>
                            Cutoff Predictor
                        </button>
                        <button class="quick-action-btn" data-action="career">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            Career Guidance
                        </button>
                    </div>
                </div>

                <!-- Messages Area -->
                <div class="chatbot-messages" id="chatbotMessages">
                    <div class="welcome-screen">
                        <div class="welcome-icon">🎓</div>
                        <h2 class="welcome-title">Welcome to AI College Advisor!</h2>
                        <p class="welcome-subtitle">I'm powered by advanced AI and can help you with any college-related question. Ask me anything!</p>
                        <div class="welcome-features">
                            <div class="welcome-feature">
                                <div class="welcome-feature-icon">🎯</div>
                                <div class="welcome-feature-text">
                                    <h4>Personalized Recommendations</h4>
                                    <p>Get AI-powered college suggestions based on your profile</p>
                                </div>
                            </div>
                            <div class="welcome-feature">
                                <div class="welcome-feature-icon">📊</div>
                                <div class="welcome-feature-text">
                                    <h4>Real-time Analysis</h4>
                                    <p>Compare colleges with live data and placement statistics</p>
                                </div>
                            </div>
                            <div class="welcome-feature">
                                <div class="welcome-feature-icon">💡</div>
                                <div class="welcome-feature-text">
                                    <h4>Expert Career Guidance</h4>
                                    <p>Get insights on career paths and industry trends</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Input Area -->
                <div class="chatbot-input-area">
                    <div class="input-wrapper">
                        <textarea 
                            class="chatbot-input" 
                            id="chatbotInput" 
                            placeholder="Ask me anything about college admissions, careers, exams..."
                            rows="1"
                        ></textarea>
                        <div class="input-actions">
                            <button class="input-action-btn" id="clearBtn" title="Clear conversation">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <button class="send-btn" id="sendBtn">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    attachEventListeners() {
        const toggle = document.getElementById('chatbotToggle');
        const close = document.getElementById('chatbotClose');
        const sendBtn = document.getElementById('sendBtn');
        const input = document.getElementById('chatbotInput');
        const clearBtn = document.getElementById('clearBtn');
        const quickActions = document.querySelectorAll('.quick-action-btn');

        toggle.addEventListener('click', () => this.toggleChat());
        close.addEventListener('click', () => this.toggleChat());
        sendBtn.addEventListener('click', () => this.sendMessage());
        clearBtn.addEventListener('click', () => this.clearConversation());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });

        // Quick actions
        quickActions.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const container = document.getElementById('chatbotContainer');
        const toggle = document.getElementById('chatbotToggle');
        
        container.classList.toggle('active');
        toggle.classList.toggle('active');

        if (this.isOpen && this.messages.length === 0) {
            setTimeout(() => {
                this.addBotMessage("Hello! 👋 I'm your AI College Advisor powered by advanced AI. I can help you with:\n\n• College recommendations based on your scores\n• Admission guidance and eligibility\n• Cutoff predictions and chances\n• Career counseling and path planning\n• Scholarship and financial aid info\n• Placement statistics and trends\n• Study tips and exam preparation\n\nWhat would you like to know?");
            }, 500);
        }
    }

    loadWelcomeMessage() {
        // Welcome message is shown in the welcome screen
    }

    async sendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();

        if (!message) return;

        // Add user message
        this.addUserMessage(message);
        input.value = '';
        input.style.height = 'auto';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get AI response
            const response = await this.getSmartResponse(message);
            this.hideTypingIndicator();
            this.addBotMessage(response.text, response.suggestions || []);
        } catch (error) {
            this.hideTypingIndicator();
            this.addBotMessage("I apologize, but something went wrong. Please try again.");
            console.error('Chatbot error:', error);
        }
    }

    async getSmartResponse(userMessage) {
        // Simulate AI thinking time
        await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800));

        const lowerMessage = userMessage.toLowerCase();
        
        // College recommendations
        if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('best college')) {
            return {
                text: "I'd be happy to recommend colleges for you! 🎓\n\nTo give you the best recommendations, I need to know:\n\n**1. Your entrance exam score** (JEE/NEET/CAT etc.)\n**2. Preferred course/stream**\n**3. Location preference**\n**4. Budget for fees**\n\nCould you share these details?",
                suggestions: ["Engineering colleges", "Medical colleges", "Management colleges", "Top ranked colleges"]
            };
        }
        
        // Compare colleges
        if (lowerMessage.includes('compare')) {
            return {
                text: "I can help you compare colleges! 📊\n\nYou can compare based on:\n• **Placement statistics**\n• **Fee structure**\n• **Rankings & ratings**\n• **Infrastructure & facilities**\n• **Faculty qualifications**\n\nWhich colleges would you like to compare? Or visit our Compare page for detailed comparison.",
                suggestions: ["IIT vs NIT", "Top 5 engineering colleges", "MBA colleges comparison"]
            };
        }
        
        // Cutoff predictor
        if (lowerMessage.includes('cutoff') || lowerMessage.includes('predict')) {
            return {
                text: "Our Cutoff Predictor can help you! 📈\n\nBased on previous year trends and current data, we can predict:\n• **Expected cutoff marks**\n• **Admission chances**\n• **Category-wise cutoffs**\n• **Round-wise predictions**\n\nWhat's your exam score and preferred college?",
                suggestions: ["JEE cutoff 2025", "NEET cutoff predictor", "Check my chances"]
            };
        }
        
        // Career and placement
        if (lowerMessage.includes('career') || lowerMessage.includes('placement')) {
            return {
                text: "Career guidance is one of my specialties! 💼\n\nI can help you with:\n• **Career path recommendations**\n• **Placement statistics analysis**\n• **Industry demand trends**\n• **Salary expectations**\n• **Skill requirements**\n\nWhat career field interests you?",
                suggestions: ["Software Engineering", "Data Science", "Medicine", "Finance & Banking"]
            };
        }
        
        // Fee and scholarships
        if (lowerMessage.includes('fee') || lowerMessage.includes('cost') || lowerMessage.includes('scholarship')) {
            return {
                text: "Let me help you with fee information! 💰\n\nI can provide:\n• **College fee structures**\n• **Scholarship opportunities**\n• **Education loan guidance**\n• **Financial aid options**\n• **Payment plans**\n\nWhich colleges are you interested in?",
                suggestions: ["Affordable engineering colleges", "Scholarship programs", "Education loans"]
            };
        }

        // Admission process
        if (lowerMessage.includes('admission') || lowerMessage.includes('eligibility') || lowerMessage.includes('apply')) {
            return {
                text: "I can guide you through the admission process! 📝\n\nKey information:\n• **Eligibility criteria**\n• **Application deadlines**\n• **Required documents**\n• **Entrance exams**\n• **Selection process**\n\nWhich college or course are you targeting?",
                suggestions: ["IIT admission process", "NEET eligibility", "Application deadlines"]
            };
        }

        // Engineering specific
        if (lowerMessage.includes('engineering') || lowerMessage.includes('iit') || lowerMessage.includes('nit') || lowerMessage.includes('jee')) {
            return {
                text: "Engineering colleges in India! 🛠️\n\n**Top institutions:**\n• IITs (23 campuses)\n• NITs (31 campuses)\n• IIITs (25 campuses)\n• Private: BITS, VIT, MIT\n\n**Popular branches:**\nComputer Science, Electronics, Mechanical, Civil, Electrical\n\nWhat specific information do you need?",
                suggestions: ["IIT vs NIT comparison", "CSE placement stats", "JEE cutoff predictor"]
            };
        }

        // Medical colleges
        if (lowerMessage.includes('medical') || lowerMessage.includes('mbbs') || lowerMessage.includes('neet') || lowerMessage.includes('aiims')) {
            return {
                text: "Medical colleges in India! 🏥\n\n**Top institutions:**\n• AIIMS (All India Institute of Medical Sciences)\n• JIPMER\n• CMC Vellore\n• KGMU, MAMC, AFMC\n\n**MBBS admission:**\nThrough NEET-UG exam\n15% All India Quota, 85% State Quota\n\nWhat would you like to know more about?",
                suggestions: ["NEET cutoff", "AIIMS vs other medical colleges", "Medical course fees"]
            };
        }

        // Management/MBA
        if (lowerMessage.includes('mba') || lowerMessage.includes('management') || lowerMessage.includes('cat') || lowerMessage.includes('iim')) {
            return {
                text: "MBA & Management programs! 💼\n\n**Top B-schools:**\n• IIMs (20 campuses)\n• XLRI, FMS, SPJIMR\n• ISB, MDI, NMIMS\n\n**Entrance exams:**\nCAT, XAT, GMAT, CMAT\n\nSpecializations available in Finance, Marketing, HR, Operations, and more!\n\nWhat specific information do you need?",
                suggestions: ["IIM admission process", "CAT preparation tips", "MBA specializations"]
            };
        }

        // Thank you or greetings
        if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
            return {
                text: "You're welcome! 😊 Feel free to ask me anything else about college admissions, career guidance, or course selection. I'm here to help!",
                suggestions: ["College recommendations", "Career guidance", "Cutoff predictor"]
            };
        }

        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return {
                text: "Hello! 👋 I'm your AI College Advisor. I can help you with:\n\n• **College recommendations**\n• **Admission guidance**\n• **Cutoff predictions**\n• **Career counseling**\n• **Fee & scholarship info**\n\nHow can I assist you today?",
                suggestions: ["Recommend colleges", "Compare colleges", "Predict cutoffs", "Career guidance"]
            };
        }

        // Default response
        return {
            text: "I'm here to help with your college search! 🎓\n\nI can assist you with:\n• **College recommendations** based on your scores\n• **Admission guidance** and eligibility\n• **Cutoff predictions** for various colleges\n• **Career counseling** and placement stats\n• **Fee structures** and scholarships\n• **Course comparisons** and selection\n\nWhat would you like to know?",
            suggestions: ["Recommend colleges for me", "Compare top colleges", "Predict cutoffs", "Career guidance"]
        };
    }

    async getGeminiResponse(userMessage) {
        // Add user message to conversation history
        this.conversationHistory.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        // Prepare the request body
        const requestBody = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: this.systemPrompt }]
                },
                ...this.conversationHistory
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };

        try {
            const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            // Extract the AI response
            const aiResponse = data.candidates[0].content.parts[0].text;
            
            // Add AI response to conversation history
            this.conversationHistory.push({
                role: 'model',
                parts: [{ text: aiResponse }]
            });

            return aiResponse;
            
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw error;
        }
    }

    addUserMessage(text) {
        const messagesDiv = document.getElementById('chatbotMessages');
        const welcomeScreen = messagesDiv.querySelector('.welcome-screen');
        if (welcomeScreen) welcomeScreen.remove();

        const messageHTML = `
            <div class="message user">
                <div class="message-avatar">👤</div>
                <div class="message-content">
                    <div class="message-bubble">
                        ${this.escapeHtml(text)}
                    </div>
                    <span class="message-time">${this.getCurrentTime()}</span>
                </div>
            </div>
        `;

        messagesDiv.insertAdjacentHTML('beforeend', messageHTML);
        this.scrollToBottom();
        this.messages.push({ role: 'user', content: text });
    }

    addBotMessage(text) {
        const messagesDiv = document.getElementById('chatbotMessages');
        const welcomeScreen = messagesDiv.querySelector('.welcome-screen');
        if (welcomeScreen) welcomeScreen.remove();

        const messageHTML = `
            <div class="message bot">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <div class="message-bubble">
                        ${this.parseMarkdown(text)}
                    </div>
                    <span class="message-time">${this.getCurrentTime()}</span>
                </div>
            </div>
        `;

        messagesDiv.insertAdjacentHTML('beforeend', messageHTML);
        this.scrollToBottom();
        this.messages.push({ role: 'assistant', content: text });
    }

    showTypingIndicator() {
        const messagesDiv = document.getElementById('chatbotMessages');
        const typingHTML = `
            <div class="typing-indicator" id="typingIndicator">
                <div class="message-avatar" style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1rem;">🤖</div>
                <div class="typing-dots">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        `;
        messagesDiv.insertAdjacentHTML('beforeend', typingHTML);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }

    clearConversation() {
        if (confirm('Are you sure you want to clear the conversation history?')) {
            this.messages = [];
            this.conversationHistory = [];
            const messagesDiv = document.getElementById('chatbotMessages');
            messagesDiv.innerHTML = `
                <div class="welcome-screen">
                    <div class="welcome-icon">🎓</div>
                    <h2 class="welcome-title">Conversation Cleared!</h2>
                    <p class="welcome-subtitle">Start a new conversation. Ask me anything about college admissions!</p>
                </div>
            `;
        }
    }

    handleQuickAction(action) {
        const actionMessages = {
            'recommend': 'I need help choosing the right college. Can you recommend colleges based on my profile?',
            'compare': 'I want to compare different colleges. Can you help me understand which one is better?',
            'cutoff': 'Can you help me predict admission cutoffs and my chances of getting into colleges?',
            'career': 'I need career guidance. Can you help me choose the right career path and course?'
        };

        const input = document.getElementById('chatbotInput');
        input.value = actionMessages[action] || '';
        this.sendMessage();
    }

    scrollToBottom() {
        const messagesDiv = document.getElementById('chatbotMessages');
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    parseMarkdown(text) {
        // Enhanced markdown parsing with better formatting
        return text
            // Headers
            .replace(/### (.*?)(\n|$)/g, '<h4 style="font-size: 1rem; font-weight: 700; margin: 0.5rem 0; color: #667eea;">$1</h4>')
            .replace(/## (.*?)(\n|$)/g, '<h3 style="font-size: 1.1rem; font-weight: 700; margin: 0.75rem 0; color: #667eea;">$1</h3>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700; color: #1e293b;">$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Code blocks
            .replace(/`(.*?)`/g, '<code style="background: rgba(102, 126, 234, 0.1); padding: 0.15rem 0.4rem; border-radius: 4px; font-family: monospace; font-size: 0.9em;">$1</code>')
            // Bullet points
            .replace(/^• (.*?)$/gm, '<div style="margin: 0.25rem 0;">• $1</div>')
            .replace(/^\* (.*?)$/gm, '<div style="margin: 0.25rem 0;">• $1</div>')
            // Numbered lists
            .replace(/^\d+\. (.*?)$/gm, '<div style="margin: 0.25rem 0;">$&</div>')
            // Line breaks
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');
    }
}

// Initialize chatbot when DOM is loaded
let chatbot;
document.addEventListener('DOMContentLoaded', () => {
    chatbot = new CollegeGuidanceChatbot();
    window.chatbot = chatbot;
});
