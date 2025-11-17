// ===========================
// Shared Profile Component
// For all pages
// ===========================

class ProfileComponent {
    constructor(navAuthSelector = '#navAuth', profileContainerSelector = '#profileContainer') {
        this.navAuth = document.querySelector(navAuthSelector);
        this.profileContainer = document.querySelector(profileContainerSelector);
        
        if (this.profileContainer) {
            this.profileTrigger = this.profileContainer.querySelector('.profile-trigger');
            this.profileDropdown = this.profileContainer.querySelector('.profile-dropdown');
            this.logoutBtn = this.profileContainer.querySelector('#logoutBtn');
            
            this.init();
        }
        
        this.checkLoginStatus();
    }
    
    init() {
        // Profile dropdown toggle
        this.profileTrigger?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.profileContainer?.contains(e.target)) {
                this.closeDropdown();
            }
        });
        
        // Logout handler
        this.logoutBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
        
        // Add click ripple to dropdown items
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!item.classList.contains('logout-btn')) {
                    this.createItemRipple(e, item);
                }
            });
        });
    }
    
    checkLoginStatus() {
        // Check if user is logged in
        const user = this.getUserData();
        
        if (user) {
            this.showProfile(user);
        } else {
            this.showAuthButtons();
        }
    }
    
    getUserData() {
        // Check localStorage for logged-in user
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                return JSON.parse(userData);
            } catch (e) {
                console.error('Error parsing user data:', e);
                return null;
            }
        }
        return null;
    }
    
    showProfile(user) {
        // Hide auth buttons
        if (this.navAuth) this.navAuth.style.display = 'none';
        
        // Show profile container
        if (this.profileContainer) {
            this.profileContainer.style.display = 'block';
            
            // Set user data
            const name = user.name || user.username || 'User';
            const email = user.email || 'user@example.com';
            const initials = this.getInitials(name);
            
            // Update profile trigger
            const profileName = this.profileContainer.querySelector('#profileName');
            const avatarInitials = this.profileContainer.querySelector('#avatarInitials');
            const avatarInitialsLarge = this.profileContainer.querySelector('#avatarInitialsLarge');
            
            if (profileName) profileName.textContent = name.split(' ')[0];
            if (avatarInitials) avatarInitials.textContent = initials;
            if (avatarInitialsLarge) avatarInitialsLarge.textContent = initials;
            
            // Update dropdown header
            const dropdownName = this.profileContainer.querySelector('#dropdownName');
            const dropdownEmail = this.profileContainer.querySelector('#dropdownEmail');
            
            if (dropdownName) dropdownName.textContent = name;
            if (dropdownEmail) dropdownEmail.textContent = email;
            
            // If user has avatar image
            if (user.avatar) {
                const profileAvatar = this.profileContainer.querySelector('#profileAvatar');
                const avatarPlaceholder = this.profileContainer.querySelector('#avatarPlaceholder');
                const dropdownAvatar = this.profileContainer.querySelector('#dropdownAvatar');
                const avatarPlaceholderLarge = this.profileContainer.querySelector('#avatarPlaceholderLarge');
                
                if (profileAvatar) {
                    profileAvatar.src = user.avatar;
                    profileAvatar.style.display = 'block';
                }
                if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
                
                if (dropdownAvatar) {
                    dropdownAvatar.src = user.avatar;
                    dropdownAvatar.style.display = 'block';
                }
                if (avatarPlaceholderLarge) avatarPlaceholderLarge.style.display = 'none';
            }
            
            // Trigger entrance animation
            setTimeout(() => {
                this.profileContainer.classList.add('profile-enter');
            }, 100);
        }
    }
    
    showAuthButtons() {
        // Show auth buttons
        if (this.navAuth) this.navAuth.style.display = 'flex';
        
        // Hide profile container
        if (this.profileContainer) this.profileContainer.style.display = 'none';
    }
    
    getInitials(name) {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    
    toggleDropdown() {
        const isOpen = this.profileDropdown?.classList.contains('show');
        
        if (isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }
    
    openDropdown() {
        this.profileDropdown?.classList.add('show');
        this.profileTrigger?.classList.add('active');
    }
    
    closeDropdown() {
        this.profileDropdown?.classList.remove('show');
        this.profileTrigger?.classList.remove('active');
    }
    
    createItemRipple(e, item) {
        const ripple = document.createElement('span');
        const rect = item.getBoundingClientRect();
        
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        item.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
    
    logout() {
        // Create logout animation
        if (this.profileContainer) {
            this.profileContainer.classList.add('profile-exit');
        }
        
        setTimeout(() => {
            // Clear user data
            localStorage.removeItem('userData');
            localStorage.removeItem('currentUser');
            
            // Show auth buttons
            this.showAuthButtons();
            
            // Show notification
            this.showLogoutNotification();
            
            // Optional: Redirect to login page
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }, 300);
    }
    
    showLogoutNotification() {
        const notification = document.createElement('div');
        notification.className = 'logout-notification';
        notification.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#10b981" stroke-width="2"/>
            </svg>
            <span>Logged out successfully</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Auto-initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize profile component
    if (document.querySelector('#profileContainer')) {
        window.profileComponent = new ProfileComponent();
    }
});
