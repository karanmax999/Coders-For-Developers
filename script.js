'use strict';

// Main JavaScript file for CFD platform

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    initNavigation();
    initGoogleAuth();
    initAnimations();
    initFormValidation();
    
    // Check if user is already logged in
    checkAuthStatus();
});

// Navigation functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks && navLinks.classList.contains('active') && 
            !navLinks.contains(e.target) && 
            !hamburger.contains(e.target)) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
    
    // Add scroll event for navbar
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });
}

// Google Authentication
function initGoogleAuth() {
    // Load Google API
    window.onGoogleLibraryLoad = () => {
        google.accounts.id.initialize({
            client_id: '330204507967-6vcpfter18g4q1p1ea1uhnd2j2hchtl8.apps.googleusercontent.com',
            callback: handleGoogleSignIn,
            auto_select: false
        });
        
        // Display Google Sign-In button
        const signInButton = document.getElementById('google-signin-button');
        if (signInButton) {
            google.accounts.id.renderButton(signInButton, {
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular'
            });
        }
    };
    
    // Add script to load Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

// Handle Google Sign-In
function handleGoogleSignIn(response) {
    // Get ID token from response
    const idToken = response.credential;
    
    // Send token to backend for verification
    fetch('/api/auth/google', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: idToken })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Store auth data in localStorage
            localStorage.setItem('auth_token', idToken);
            localStorage.setItem('auth_time', Date.now());
            
            // Update UI for logged-in user
            updateUIForLoggedInUser(response);
        } else {
            console.error('Authentication failed:', data.message);
            showNotification('Authentication failed. Please try again.', 'error');
        }
    })
    .catch(error => {
        console.error('Error during authentication:', error);
        showNotification('An error occurred. Please try again later.', 'error');
    });
}

// Update UI for logged-in user
function updateUIForLoggedInUser(response) {
    // Parse JWT to get user info
    const payload = parseJwt(response.credential);
    
    // Update navigation
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        // Create user menu
        const userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        userMenu.innerHTML = `
            <div class="user-avatar">
                <img src="${payload.picture}" alt="${payload.name}">
            </div>
            <div class="user-info">
                <span>${payload.name}</span>
                <button id="sign-out-button">Sign Out</button>
            </div>
        `;
        
        // Replace sign-in button with user menu
        const signInButton = document.getElementById('google-signin-button');
        if (signInButton && signInButton.parentNode) {
            signInButton.parentNode.replaceChild(userMenu, signInButton);
        } else {
            navLinks.appendChild(userMenu);
        }
        
        // Add sign-out event listener
        document.getElementById('sign-out-button').addEventListener('click', signOut);
    }
    
    // Show welcome notification
    showNotification(`Welcome, ${payload.name}!`, 'success');
}

// Sign out function
function signOut() {
    // Clear auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_time');
    
    // Reload page to reset UI
    window.location.reload();
}

// Check if user is already authenticated
function checkAuthStatus() {
    const token = localStorage.getItem('auth_token');
    const authTime = localStorage.getItem('auth_time');
    
    if (token && authTime) {
        // Check if token is expired (24 hours)
        const now = Date.now();
        const tokenAge = now - parseInt(authTime);
        const tokenMaxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (tokenAge < tokenMaxAge) {
            // Token is still valid, update UI
            const payload = parseJwt(token);
            updateUIForLoggedInUser({ credential: token });
        } else {
            // Token expired, clear it
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_time');
        }
    }
}

// Parse JWT token
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error parsing JWT:', e);
        return {};
    }
}

// Animations
function initAnimations() {
    // Animate elements when they come into view
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (elementPosition < screenPosition) {
                element.classList.add('animated');
            }
        });
    };
    
    // Add animation classes to elements
    document.querySelectorAll('.empower-content h1, .empower-content p, .cta-button').forEach(el => {
        el.classList.add('animate-on-scroll');
    });
    
    // Run on scroll
    window.addEventListener('scroll', animateOnScroll);
    
    // Run once on page load
    animateOnScroll();
}

// Form validation
function initFormValidation() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form fields
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            
            // Validate fields
            let isValid = true;
            
            if (name === '') {
                showError('name', 'Name is required');
                isValid = false;
            } else {
                clearError('name');
            }
            
            if (email === '') {
                showError('email', 'Email is required');
                isValid = false;
            } else if (!isValidEmail(email)) {
                showError('email', 'Please enter a valid email');
                isValid = false;
            } else {
                clearError('email');
            }
            
            if (message === '') {
                showError('message', 'Message is required');
                isValid = false;
            } else {
                clearError('message');
            }
            
            // If form is valid, submit it
            if (isValid) {
                // Simulate form submission
                showNotification('Your message has been sent!', 'success');
                contactForm.reset();
            }
        });
    }
}

// Show error message for form field
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = field.nextElementSibling;
    
    field.classList.add('error');
    
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.textContent = message;
    } else {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
    }
}

// Clear error message for form field
function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = field.nextElementSibling;
    
    field.classList.remove('error');
    
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.textContent = '';
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add close button
    const closeButton = document.createElement('span');
    closeButton.className = 'notification-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(notification);
    });
    
    notification.appendChild(closeButton);
    
    // Add to body
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 5000);
}
