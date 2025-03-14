// Main JavaScript file for CFD platform
'use strict';

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    initNavigation();
    initGoogleAuth();
    initAnimations();
    initFormValidation();
    initBackToTop();
    initTestimonialCarousel();
    initFAQ();
    initJobs();
    initInternships();
    initContactForm();
    initResponsive();
    
    // Check if user is already logged in
    checkAuthStatus();
});

// Navigation functionality
function initNavigation() {
    // Get the navbar elements
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links a');
    const body = document.body;
    
    // Handle hamburger menu click
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // Prevent scrolling when menu is open
            if (navLinks.classList.contains('active')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        });
    }
    
    // Close menu when clicking on a link
    navLinksItems.forEach(item => {
        item.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            body.style.overflow = '';
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (
            navLinks.classList.contains('active') && 
            !navLinks.contains(e.target) && 
            !hamburger.contains(e.target)
        ) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            body.style.overflow = '';
        }
    });
    
    // Add scroll effect to navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Handle smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Close mobile menu if open
                if (window.innerWidth <= 768) {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                    body.style.overflow = '';
                }
                
                // Calculate offset for fixed navbar
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add active class to current page link
    const currentPage = window.location.pathname.split('/').pop();
    
    navLinksItems.forEach(link => {
        const linkHref = link.getAttribute('href');
        
        if (linkHref === currentPage || 
            (currentPage === '' && linkHref === 'home.html') || 
            (currentPage === 'index.html' && linkHref === 'home.html')) {
            link.classList.add('active');
        }
    });
}

// Back to top button functionality
function initBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');
    
    if (backToTopButton) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        // Scroll to top when clicked
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Testimonial carousel functionality
function initTestimonialCarousel() {
    const testimonials = document.querySelectorAll('.testimonial-card');
    
    if (testimonials.length > 0) {
        // Add initial animation delay to create staggered effect
        testimonials.forEach((testimonial, index) => {
            testimonial.style.transitionDelay = `${index * 0.2}s`;
        });
    }
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
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate-on-scroll:not(.animated), .job-card:not(.animated), .internship-card:not(.animated), .resource-card:not(.animated)');
        const windowHeight = window.innerHeight;
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const elementVisible = 100;
            
            if (elementPosition < windowHeight - elementVisible) {
                element.classList.add('animated');
            }
        });
    };
    
    // Run on initial load
    animateOnScroll();
    
    // Add scroll event listener
    window.addEventListener('scroll', animateOnScroll);
    
    // Animate parallax shapes on mouse move
    const shapes = document.querySelectorAll('.shape');
    if (shapes.length > 0) {
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            shapes.forEach(shape => {
                const speed = shape.classList.contains('shape-1') ? 20 : 
                             shape.classList.contains('shape-2') ? 30 : 15;
                
                shape.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
            });
        });
    }
}

// Form validation
function initFormValidation() {
    const contactForm = document.getElementById('contact-form');
    const newsletterForm = document.querySelector('.newsletter-form');
    
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
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email === '' || !isValidEmail(email)) {
                emailInput.classList.add('error');
                showNotification('Please enter a valid email address.', 'error');
            } else {
                emailInput.classList.remove('error');
                showNotification('Thank you for subscribing to our newsletter!', 'success');
                this.reset();
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
    
    // Add to notification container
    const container = document.getElementById('notification-container');
    if (container) {
        container.appendChild(notification);
    } else {
        document.body.appendChild(notification);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Add this new function to initialize the FAQ functionality
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    const categoryButtons = document.querySelectorAll('.faq-category-btn');
    const categories = document.querySelectorAll('.faq-category');
    
    // Initialize accordion functionality
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                // Close all other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
            });
        });
    }
    
    // Initialize category tabs
    if (categoryButtons.length > 0) {
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                categoryButtons.forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Show corresponding category
                const categoryId = button.getAttribute('data-category');
                categories.forEach(category => {
                    category.classList.remove('active');
                    if (category.id === categoryId) {
                        category.classList.add('active');
                    }
                });
            });
        });
    }
}

// Add this new function to initialize the Jobs functionality
function initJobs() {
    // Load more jobs button functionality
    const loadMoreButton = document.querySelector('.jobs-grid + .load-more-container .load-more');
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', () => {
            // In a real application, this would make an AJAX call to load more jobs
            // For now, we'll just show a notification
            showNotification('Loading more jobs...', 'info');
            
            // Simulate loading delay
            setTimeout(() => {
                showNotification('No more jobs available at this time.', 'info');
            }, 2000);
        });
    }
    
    // Save job functionality
    const saveButtons = document.querySelectorAll('.save-job-button');
    if (saveButtons.length > 0) {
        saveButtons.forEach(button => {
            button.addEventListener('click', () => {
                const jobCard = button.closest('.job-card');
                const jobTitle = jobCard.querySelector('h3').textContent;
                
                // Toggle saved state
                if (button.classList.contains('saved')) {
                    button.classList.remove('saved');
                    button.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Save
                    `;
                    showNotification(`Removed "${jobTitle}" from saved jobs`, 'info');
                } else {
                    button.classList.add('saved');
                    button.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Saved
                    `;
                    showNotification(`Saved "${jobTitle}" to your profile`, 'success');
                    
                    // Add a subtle highlight effect to the card
                    jobCard.style.boxShadow = '0 8px 30px rgba(66, 133, 244, 0.3)';
                    setTimeout(() => {
                        jobCard.style.boxShadow = '';
                    }, 800);
                }
            });
        });
    }
    
    // Job search form
    const jobSearchForm = document.querySelector('.search-section .search-form');
    if (jobSearchForm) {
        jobSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // In a real application, this would submit the form data and filter results
            // For now, we'll just show a notification
            showNotification('Searching for jobs...', 'info');
            
            // Simulate search delay
            setTimeout(() => {
                showNotification('Search results updated', 'success');
                
                // Add animation to job cards to simulate refresh
                document.querySelectorAll('.job-card').forEach(card => {
                    card.classList.remove('animated');
                    setTimeout(() => {
                        card.classList.add('animated');
                    }, 10);
                });
            }, 1500);
        });
    }
}

// Add this new function to initialize the Internships functionality
function initInternships() {
    // Load more internships button functionality
    const loadMoreButton = document.querySelector('.internships-grid + .load-more-container .load-more');
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', () => {
            // In a real application, this would make an AJAX call to load more internships
            // For now, we'll just show a notification
            showNotification('Loading more internships...', 'info');
            
            // Simulate loading delay
            setTimeout(() => {
                showNotification('No more internships available at this time.', 'info');
            }, 2000);
        });
    }
    
    // Save internship functionality
    const saveButtons = document.querySelectorAll('.save-internship-button');
    if (saveButtons.length > 0) {
        saveButtons.forEach(button => {
            button.addEventListener('click', () => {
                const internshipCard = button.closest('.internship-card');
                const internshipTitle = internshipCard.querySelector('h3').textContent;
                
                // Toggle saved state
                if (button.classList.contains('saved')) {
                    button.classList.remove('saved');
                    button.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Save
                    `;
                    showNotification(`Removed "${internshipTitle}" from saved internships`, 'info');
                } else {
                    button.classList.add('saved');
                    button.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Saved
                    `;
                    showNotification(`Saved "${internshipTitle}" to your profile`, 'success');
                    
                    // Add a subtle highlight effect to the card
                    internshipCard.style.boxShadow = '0 8px 30px rgba(66, 133, 244, 0.3)';
                    setTimeout(() => {
                        internshipCard.style.boxShadow = '';
                    }, 800);
                }
            });
        });
    }
    
    // Internship search form
    const internshipSearchForm = document.querySelector('.search-section .search-form');
    if (internshipSearchForm) {
        internshipSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // In a real application, this would submit the form data and filter results
            // For now, we'll just show a notification
            showNotification('Searching for internships...', 'info');
            
            // Simulate search delay
            setTimeout(() => {
                showNotification('Search results updated', 'success');
                
                // Add animation to internship cards to simulate refresh
                document.querySelectorAll('.internship-card').forEach(card => {
                    card.classList.remove('animated');
                    setTimeout(() => {
                        card.classList.add('animated');
                    }, 10);
                });
            }, 1500);
        });
    }
}

// Add a responsive helper to detect device types and orientations
function initResponsive() {
    // Check if device is touch-enabled
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    document.body.classList.toggle('touch-device', isTouchDevice);
    
    // Handle orientation changes
    const handleOrientationChange = () => {
        const isLandscape = window.matchMedia('(orientation: landscape)').matches;
        document.body.classList.toggle('landscape', isLandscape);
        document.body.classList.toggle('portrait', !isLandscape);
        
        // Adjust heights for mobile devices in landscape to handle smaller viewport height
        if (isLandscape && window.innerWidth <= 768) {
            document.querySelectorAll('.page-header').forEach(header => {
                header.style.minHeight = 'auto';
            });
        } else {
            document.querySelectorAll('.page-header').forEach(header => {
                header.style.minHeight = '';
            });
        }
    };
    
    // Run on load and when orientation changes
    handleOrientationChange();
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    
    // Add touch-specific event listeners
    if (isTouchDevice) {
        // Use touchstart for faster response on touch devices
        document.querySelectorAll('.cta-button, .secondary-button, .load-more, .nav-links a').forEach(button => {
            button.addEventListener('touchstart', () => {
                button.classList.add('touch-active');
            }, { passive: true });
            
            button.addEventListener('touchend', () => {
                button.classList.remove('touch-active');
                // Remove class after animation completes
                setTimeout(() => {
                    button.classList.remove('touch-active');
                }, 300);
            }, { passive: true });
        });
    }
    
    // Fix for iOS 100vh issue
    const setAppHeight = () => {
        document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    window.addEventListener('resize', setAppHeight);
    setAppHeight();
    
    // Optimize for low-end devices
    const isLowEndDevice = () => {
        const memory = navigator.deviceMemory;
        return memory && memory <= 4; // 4GB or less is considered low-end
    };
    
    if (isLowEndDevice()) {
        document.body.classList.add('low-end-device');
        // Disable some animations for better performance
        document.querySelectorAll('.animate-on-scroll, .shape').forEach(el => {
            el.classList.add('reduced-motion');
        });
    }
}

// Add this new function to initialize the Contact Form functionality
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Reset all error states
            const errorElements = document.querySelectorAll('.error-message');
            errorElements.forEach(el => {
                el.classList.remove('visible');
                el.textContent = '';
            });
            
            document.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('error');
            });
            
            // Get form fields
            const nameField = document.getElementById('name');
            const emailField = document.getElementById('email');
            const subjectField = document.getElementById('subject');
            const messageField = document.getElementById('message');
            const privacyField = document.getElementById('privacy');
            
            // Validate form
            let isValid = true;
            
            // Name validation
            if (!nameField.value.trim()) {
                showError('name', 'Please enter your name');
                isValid = false;
            } else if (nameField.value.trim().length < 2) {
                showError('name', 'Name must be at least 2 characters');
                isValid = false;
            }
            
            // Email validation
            if (!emailField.value.trim()) {
                showError('email', 'Please enter your email address');
                isValid = false;
            } else if (!isValidEmail(emailField.value.trim())) {
                showError('email', 'Please enter a valid email address');
                isValid = false;
            }
            
            // Subject validation
            if (!subjectField.value || subjectField.value === '') {
                showError('subject', 'Please select a subject');
                isValid = false;
            }
            
            // Message validation
            if (!messageField.value.trim()) {
                showError('message', 'Please enter your message');
                isValid = false;
            } else if (messageField.value.trim().length < 10) {
                showError('message', 'Message must be at least 10 characters');
                isValid = false;
            }
            
            // Privacy checkbox validation
            if (!privacyField.checked) {
                showError('privacy', 'You must agree to the Privacy Policy');
                isValid = false;
            }
            
            // If valid, submit form
            if (isValid) {
                // Disable submit button
                const submitButton = contactForm.querySelector('button[type="submit"]');
                const originalText = submitButton.innerHTML;
                submitButton.disabled = true;
                submitButton.innerHTML = `
                    <span>Sending...</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rotate">
                        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path>
                    </svg>
                `;
                
                // Simulate form submission (in a real application, this would be an AJAX call)
                setTimeout(() => {
                    // Reset the form
                    contactForm.reset();
                    
                    // Re-enable submit button
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalText;
                    
                    // Show success notification
                    showNotification('Your message has been sent successfully! We\'ll get back to you soon.', 'success');
                }, 1500);
            }
        });
    }
    
    // Helper function for showing errors
    function showError(fieldId, message) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        const formGroup = document.getElementById(fieldId).closest('.form-group') || 
                         document.getElementById(fieldId).closest('.form-checkbox');
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('visible');
        }
        
        if (formGroup) {
            formGroup.classList.add('error');
        }
    }
} 