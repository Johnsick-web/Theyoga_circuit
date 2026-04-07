document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Scroll Reveal Animation using IntersectionObserver
    const revealElements = document.querySelectorAll('.reveal');

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing once revealed if you only want it to happen once
                // observer.unobserve(entry.target);
            }
        });
    };

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Offset for fixed navbar
                    behavior: 'smooth'
                });
            }
        });
    });
    // Form submission handling connected to Python Backend
    const joinForm = document.getElementById('joinForm');
    const formMessage = document.getElementById('formMessage');

    if (joinForm) {
        joinForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent standard page reload

            // Collect form data
            const formData = {
                name: joinForm.name.value,
                email: joinForm.email.value,
                phone: joinForm.phone.value
            };

            // Display loading state
            formMessage.style.color = 'var(--text-secondary)';
            formMessage.textContent = 'Sending your details...';
            const submitBtn = joinForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;

            try {
                // Send standard POST request to our Python Backend at /api/join
                const response = await fetch('/api/join', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    formMessage.style.color = '#3C763D'; // Green success color
                    formMessage.textContent = 'Awesome! ' + result.message;
                    joinForm.reset();
                } else {
                    formMessage.style.color = '#A94442'; // Red error color
                    formMessage.textContent = 'Error: ' + (result.message || 'Failed to submit.');
                }
            } catch (error) {
                console.error('Submission error:', error);
                formMessage.style.color = '#A94442';
                formMessage.textContent = 'Error: Connection failed. Is the backend server running?';
            } finally {
                // Re-enable button
                submitBtn.disabled = false;
            }
        });
    }
});
