"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const burger = document.getElementById("burger");
    const nav = document.getElementById("nav");
    const links = document.querySelectorAll(".item-link");
    const sections = document.querySelectorAll("main section[id]");
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalText = document.getElementById("modalText");
    const modalClose = document.getElementById("modalClose");
    const installBtn = document.getElementById("installBtn");
    const form = document.getElementById("contactForm");
    const formError = document.getElementById("formError");

    document.getElementById("year").textContent = new Date().getFullYear();

    /* ---------- Mobil menyu ---------- */
    const closeMenu = () => {
        nav.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
    };

    burger.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("open");
        burger.classList.toggle("open", isOpen);
        burger.setAttribute("aria-expanded", String(isOpen));
    });

    /* ---------- Menyu havolalari: bosilganda bo'limga o'tish ---------- */
    links.forEach((link) => {
        link.addEventListener("click", (e) => {
            const id = link.getAttribute("href");
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            closeMenu();
        });
    });

    /* ---------- Scroll paytida aktiv havolani belgilash ---------- */
    const setActive = () => {
        const y = window.scrollY + 120;
        let current = sections[0].id;
        sections.forEach((sec) => {
            if (y >= sec.offsetTop) current = sec.id;
        });
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
            current = sections[sections.length - 1].id;
        }
        links.forEach((l) => {
            l.classList.toggle("active", l.getAttribute("href") === "#" + current);
        });
    };
    window.addEventListener("scroll", setActive, { passive: true });
    setActive();

    /* ---------- Sotib olish ---------- */
    const openModal = (title, text) => {
        modalTitle.textContent = title;
        modalText.textContent = text;
        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
    };

    const closeModal = () => {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
    };

    document.querySelectorAll(".card-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const plan = btn.dataset.plan;
            const price = btn.dataset.price;
            if (price === "Bepul") {
                openModal("Sinov faollashtirildi!", `"${plan}" tarifini sinab ko'rishingiz mumkin.`);
            } else {
                openModal("Sotib oldingiz! 🎉", `"${plan}" tarifi — ${price}. Xaridingiz uchun rahmat!`);
            }
        });
    });

    /* ---------- Ustoz tanlash ---------- */
    const teacherBtns = document.querySelectorAll(".teacher-btn");
    teacherBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            teacherBtns.forEach((b) => {
                b.classList.remove("chosen");
                b.textContent = "Tanlash";
            });
            btn.classList.add("chosen");
            btn.textContent = "Tanlandi ✓";
            openModal("Ustoz tanlandi!", `${btn.dataset.teacher} (${btn.dataset.style}) bilan darsni boshlashingiz mumkin.`);
        });
    });

    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });

    /* ---------- O'rnatib olish tugmasi ---------- */
    installBtn.addEventListener("click", () => {
        openModal("O'rnatib olish", "Ilova tez orada tayyor bo'ladi. Kuzatib boring!");
    });

    /* ---------- Aloqa formasi ---------- */
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const message = document.getElementById("message").value.trim();

        if (name.length < 2) {
            formError.textContent = "Iltimos, ismingizni kiriting.";
            return;
        }
        if (phone.length < 5) {
            formError.textContent = "Telefon yoki emailni to'g'ri kiriting.";
            return;
        }
        if (message.length < 5) {
            formError.textContent = "Xabar juda qisqa.";
            return;
        }

        formError.textContent = "";
        form.reset();
        openModal("Yuborildi!", "Xabaringiz qabul qilindi. Tez orada bog'lanamiz.");
    });
});
