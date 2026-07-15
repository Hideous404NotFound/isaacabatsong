'use strict';

//Opening or closing side bar

const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

sidebarBtn.addEventListener("click", function() {elementToggleFunc(sidebar); })

//Activating Modal-testimonial (guarded: section may be commented out in HTML)

const testimonialsItem = document.querySelectorAll('[data-testimonials-item]');
const modalContainer = document.querySelector('[data-modal-container]');
const modalCloseBtn = document.querySelector('[data-modal-close-btn]');
const overlay = document.querySelector('[data-overlay]');

if (modalContainer && overlay) {
    const modalImg = document.querySelector('[data-modal-img]');
    const modalTitle = document.querySelector('[data-modal-title]');
    const modalText = document.querySelector('[data-modal-text]');

    const testimonialsModalFunc = function () {
        modalContainer.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    for (let i = 0; i < testimonialsItem.length; i++) {
        testimonialsItem[i].addEventListener('click', function () {
            modalImg.src = this.querySelector('[data-testimonials-avatar]').src;
            modalImg.alt = this.querySelector('[data-testimonials-avatar]').alt;
            modalTitle.innerHTML = this.querySelector('[data-testimonials-title]').innerHTML;
            modalText.innerHTML = this.querySelector('[data-testimonials-text]').innerHTML;

            testimonialsModalFunc();
        });
    }

    modalCloseBtn.addEventListener('click', testimonialsModalFunc);
    overlay.addEventListener('click', testimonialsModalFunc);
}

//Activating Filter Select and filtering options

const select = document.querySelector('[data-select]');
const selectItems = document.querySelectorAll('[data-select-item]');
const selectValue = document.querySelector('[data-select-value]');
const filterBtn = document.querySelectorAll('[data-filter-btn]');

select.addEventListener('click', function () {elementToggleFunc(this); });

for(let i = 0; i < selectItems.length; i++) {
    selectItems[i].addEventListener('click', function() {

        let selectedValue = this.innerText.toLowerCase();
        selectValue.innerText = this.innerText;
        elementToggleFunc(select);
        filterFunc(selectedValue);

    });
}

const filterItems = document.querySelectorAll('[data-filter-item]');

const filterFunc = function (selectedValue) {
    for(let i = 0; i < filterItems.length; i++) {
        if(selectedValue == "tout") {
            filterItems[i].classList.add('active');
        } else if (selectedValue == filterItems[i].dataset.category) {
            filterItems[i].classList.add('active');
        } else {
            filterItems[i].classList.remove('active');
        }
    }
}

//Enabling filter button for larger screens 

let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {
    
    filterBtn[i].addEventListener('click', function() {

        let selectedValue = this.innerText.toLowerCase();
        selectValue.innerText = this.innerText;
        filterFunc(selectedValue);

        lastClickedBtn.classList.remove('active');
        this.classList.add('active');
        lastClickedBtn = this;

    })
}

// Theme toggle with localStorage persistence
const themeToggle = document.querySelector('.theme-toggle');

// (Note: The body class is also initialized inline in HTML to prevent FOUC)
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
} else {
    document.body.classList.remove('light-theme');
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// Enabling Contact Form
const form = document.querySelector('[data-form]');
const formInputs = document.querySelectorAll('[data-form-input]');
const formBtn = document.querySelector('[data-form-btn]');

// Check validity on load (in case browser autofills)
if (form && formBtn) {
    if (form.checkValidity()) {
        formBtn.removeAttribute('disabled');
    } else {
        formBtn.setAttribute('disabled', '');
    }
}

if (formInputs && formBtn) {
    for (let i = 0; i < formInputs.length; i++) {
        formInputs[i].addEventListener('input', function () {
            if (form.checkValidity()) {
                formBtn.removeAttribute('disabled');
            } else {
                formBtn.setAttribute('disabled', '');
            }
        });
    }
}

// Enabling Page Navigation (No shadowing, modern robust logic)
const navigationLinks = document.querySelectorAll('[data-nav-link]');
const pages = document.querySelectorAll('[data-page]');

if (navigationLinks.length > 0 && pages.length > 0) {
    navigationLinks.forEach((link) => {
        link.addEventListener('click', function() {
            const targetPage = this.innerHTML.trim().toLowerCase();
            
            pages.forEach((page) => {
                if (page.dataset.page === targetPage) {
                    page.classList.add('active');
                } else {
                    page.classList.remove('active');
                }
            });

            navigationLinks.forEach((navLink) => {
                if (navLink === this) {
                    navLink.classList.add('active');
                } else {
                    navLink.classList.remove('active');
                }
            });

            window.scrollTo(0, 0);
        });
    });
}

// CTA button → navigate to Contact tab
const ctaBtn = document.querySelector('[data-nav-link-cta]');
if (ctaBtn) {
    ctaBtn.addEventListener('click', (e) => {
        e.preventDefault();
        pages.forEach((page) => {
            page.classList.toggle('active', page.dataset.page === 'contact');
        });
        navigationLinks.forEach((navLink) => {
            navLink.classList.toggle('active', navLink.innerHTML.trim().toLowerCase() === 'contact');
        });
        window.scrollTo(0, 0);
    });
}

// automatically add simple srcset attributes to every image (duplicates src so names stay unchanged)
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('img').forEach(img => {
        if (!img.hasAttribute('srcset')) {
            const src = img.getAttribute('src');
            if (src) {
                img.setAttribute('srcset', `${src} 1x, ${src} 2x`);
            }
        }
    });
});

// Lightbox functionality
const lightboxContainer = document.querySelector('[data-lightbox-container]');
const lightboxImg = document.querySelector('[data-lightbox-img]');
const lightboxTitle = document.querySelector('[data-lightbox-title]');
const lightboxCategory = document.querySelector('[data-lightbox-category]');
const lightboxCloseBtn = document.querySelector('[data-lightbox-close-btn]');
const lightboxOverlay = document.querySelector('[data-lightbox-overlay]');
const prevBtn = document.querySelector('[data-lightbox-prev]');
const nextBtn = document.querySelector('[data-lightbox-next]');

let currentIndex = 0;
let visibleProjects = [];

const updateLightbox = function (index) {
    const project = visibleProjects[index];
    const img = project.querySelector('img');
    const title = project.querySelector('.project-title').innerText;
    const category = project.querySelector('.project-category').innerText;

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxTitle.innerText = title;
    lightboxCategory.innerText = category;
    currentIndex = index;
}

const toggleLightbox = function () {
    lightboxContainer.classList.toggle('active');
    document.body.classList.toggle('modal-open');
}

// Use event delegation to handle clicks on project items
document.addEventListener('click', function (e) {
    const projectItem = e.target.closest('[data-filter-item]');
    if (projectItem) {
        e.preventDefault();
        
        // Get all currently visible projects (filtered)
        visibleProjects = Array.from(document.querySelectorAll('[data-filter-item].active'));
        const index = visibleProjects.indexOf(projectItem);
        
        if (index !== -1) {
            updateLightbox(index);
            toggleLightbox();
        }
    }
});

const showNext = function () {
    currentIndex = (currentIndex + 1) % visibleProjects.length;
    updateLightbox(currentIndex);
}

const showPrev = function () {
    currentIndex = (currentIndex - 1 + visibleProjects.length) % visibleProjects.length;
    updateLightbox(currentIndex);
}

nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
lightboxCloseBtn.addEventListener('click', toggleLightbox);
lightboxOverlay.addEventListener('click', toggleLightbox);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (!lightboxContainer.classList.contains('active')) return;
    if (e.key === 'Escape') toggleLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
});
