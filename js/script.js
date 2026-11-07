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

    /* ---------- To'lov oynasi (Sinab ko'rish / Xarid qilish) ----------
       DEMO_MODE = true bo'lsa: karta ma'lumotlari hech qayerga yuborilmaydi va
       pul yechilmaydi. Haqiqiy sotuv uchun Payme / Click / Uzum kabi to'lov tizimiga
       ulang (karta raqamini o'z serveringizga yubormang, tizimning to'lov sahifasidan
       foydalaning), keyin DEMO_MODE ni false qiling va processPayment() ni yozing. */
    const DEMO_MODE = true;

    const checkout = document.getElementById("checkout");
    const coForm = document.getElementById("checkoutForm");
    const coCardFields = document.getElementById("coCardFields");
    const coBrand = document.getElementById("coBrand");
    const coSubmit = document.getElementById("coSubmit");
    const coFormError = document.getElementById("coFormError");
    const f = {
        name: document.getElementById("coName"),
        phone: document.getElementById("coPhone"),
        email: document.getElementById("coEmail"),
        card: document.getElementById("coCard"),
        exp: document.getElementById("coExp"),
        cvv: document.getElementById("coCvv"),
        terms: document.getElementById("coTerms"),
    };
    let plan = null;
    let opener = null;

    const digits = (s) => s.replace(/\D/g, "");
    const money = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " so'm";

    function cardBrand(num) {
        if (/^8600/.test(num)) return "Uzcard";
        if (/^9860/.test(num)) return "Humo";
        if (/^4/.test(num)) return "Visa";
        if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(num)) return "Mastercard";
        return "";
    }

    function luhn(num) {
        let sum = 0;
        let dbl = false;
        for (let i = num.length - 1; i >= 0; i--) {
            let d = Number(num[i]);
            if (dbl) {
                d *= 2;
                if (d > 9) d -= 9;
            }
            sum += d;
            dbl = !dbl;
        }
        return sum % 10 === 0;
    }

    const needsCvv = () => ["Visa", "Mastercard"].includes(cardBrand(digits(f.card.value)));

    /* Tekshiruvlar: xato bo'lsa matn qaytaradi, to'g'ri bo'lsa bo'sh satr */
    const validators = {
        name: () => {
            const v = f.name.value.trim();
            return v.length >= 5 && v.split(/\s+/).length >= 2 ? "" : "Ism va familiyangizni kiriting.";
        },
        phone: () => (digits(f.phone.value).length === 9 ? "" : "Telefon raqamni to'liq kiriting (9 ta raqam)."),
        email: () => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim()) ? "" : "Email manzilni to'g'ri kiriting."),
        card: () => {
            const n = digits(f.card.value);
            if (n.length !== 16) return "Karta raqami 16 ta raqamdan iborat bo'lishi kerak.";
            return luhn(n) ? "" : "Karta raqami noto'g'ri.";
        },
        exp: () => {
            const m = f.exp.value.match(/^(\d{2})\/(\d{2})$/);
            if (!m) return "Muddatni OO/YY ko'rinishida kiriting.";
            const month = Number(m[1]);
            const year = 2000 + Number(m[2]);
            if (month < 1 || month > 12) return "Oy 01 dan 12 gacha bo'lishi kerak.";
            const now = new Date();
            const expired = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
            return expired ? "Kartaning amal qilish muddati tugagan." : "";
        },
        cvv: () => (needsCvv() && digits(f.cvv.value).length !== 3 ? "CVV 3 ta raqamdan iborat." : ""),
        terms: () => (f.terms.checked ? "" : "Davom etish uchun shartlarga rozilik bering."),
    };

    function setError(key, msg) {
        const out = document.getElementById("err-" + key);
        const box = f[key].closest(".co-group") || f[key];
        out.textContent = msg;
        box.classList.toggle("is-invalid", Boolean(msg));
        f[key].setAttribute("aria-invalid", msg ? "true" : "false");
    }

    /* Yozish paytida avtomatik formatlash */
    f.phone.addEventListener("input", () => {
        let d = digits(f.phone.value);
        if (d.length > 9 && d.startsWith("998")) d = d.slice(3);
        d = d.slice(0, 9);
        f.phone.value = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(" ");
    });

    f.card.addEventListener("input", () => {
        const d = digits(f.card.value).slice(0, 16);
        f.card.value = d.replace(/(\d{4})(?=\d)/g, "$1 ");
        coBrand.textContent = cardBrand(d);
    });

    f.exp.addEventListener("input", () => {
        let d = digits(f.exp.value).slice(0, 4);
        if (d.length === 1 && d > "1") d = "0" + d;
        f.exp.value = d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
    });

    f.cvv.addEventListener("input", () => {
        f.cvv.value = digits(f.cvv.value).slice(0, 3);
    });

    Object.keys(f).forEach((key) => {
        const ev = key === "terms" ? "change" : "blur";
        f[key].addEventListener(ev, () => {
            if (key === "card" || key === "exp" || key === "cvv") {
                if (plan && plan.amount === 0) return;
            }
            if (ev === "blur" && f[key].value === "" && !f[key].classList.contains("is-invalid") &&
                !(f[key].closest(".co-group") || f[key]).classList.contains("is-invalid")) return;
            setError(key, validators[key]());
        });
        if (ev === "blur") {
            f[key].addEventListener("input", () => {
                const box = f[key].closest(".co-group") || f[key];
                if (box.classList.contains("is-invalid")) setError(key, validators[key]());
            });
        }
    });

    function openCheckout(opts, trigger) {
        plan = opts;
        opener = trigger;
        const paid = opts.amount > 0;
        document.getElementById("coPlan").textContent = opts.name;
        document.getElementById("coTitle").textContent = paid ? "Buyurtmani rasmiylashtirish" : "Sinovni boshlash";
        document.getElementById("coAmount").textContent = paid ? money(opts.amount) + " / oy" : "Bepul";
        coCardFields.hidden = !paid;
        document.getElementById("coDemo").hidden = !DEMO_MODE;
        coSubmit.textContent = paid ? money(opts.amount) + " to'lash" : "Sinovni boshlash";
        coFormError.textContent = "";
        Object.keys(f).forEach((k) => setError(k, ""));
        checkout.classList.add("show");
        checkout.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
        setTimeout(() => f.name.focus(), 60);
    }

    function closeCheckout() {
        if (!checkout.classList.contains("show")) return;
        checkout.classList.remove("show");
        checkout.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        coForm.reset();          // karta ma'lumotlari sahifada qolmasligi uchun
        coBrand.textContent = "";
        coSubmit.disabled = false;
        if (opener && opener.focus) opener.focus();
    }

    function processPayment() {
        if (!DEMO_MODE) return Promise.reject(new Error("To'lov tizimi hali ulanmagan."));
        return new Promise((resolve) => setTimeout(resolve, 900));
    }

    document.querySelectorAll(".card-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            openCheckout({ name: btn.dataset.plan, amount: Number(btn.dataset.amount) || 0 }, btn);
        });
    });

    coForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const paid = plan.amount > 0;
        const keys = ["name", "phone", "email"].concat(paid ? ["card", "exp", "cvv"] : [], ["terms"]);
        let firstBad = null;
        keys.forEach((k) => {
            const msg = validators[k]();
            setError(k, msg);
            if (msg && !firstBad) firstBad = f[k];
        });
        if (firstBad) {
            firstBad.focus();
            return;
        }

        const order = { plan: plan.name, amount: plan.amount, name: f.name.value.trim(), email: f.email.value.trim() };
        const last4 = paid ? digits(f.card.value).slice(-4) : "";

        coFormError.textContent = "";
        coSubmit.disabled = true;
        coSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Kutilmoqda...';
        try {
            await processPayment(order);
        } catch (err) {
            coFormError.textContent = err.message || "Xatolik yuz berdi. Qayta urinib ko'ring.";
            coSubmit.disabled = false;
            coSubmit.textContent = paid ? money(plan.amount) + " to'lash" : "Sinovni boshlash";
            return;
        }

        closeCheckout();
        let text = paid
            ? `"${order.plan}" tarifi: ${money(order.amount)} / oy.\nKarta: •••• ${last4}`
            : `"${order.plan}" tarifi faollashtirildi.`;
        if (DEMO_MODE) text += "\n\nDemo rejim: haqiqiy to'lov amalga oshirilmadi.";
        openModal(paid ? "Sotib oldingiz!" : "Sinov faollashtirildi!", text);
    });

    document.getElementById("coFill").addEventListener("click", () => {
        f.name.value = "Ali Valiyev";
        f.phone.value = "90 123 45 67";
        f.email.value = "ali@example.com";
        f.card.value = "4242 4242 4242 4242";
        coBrand.textContent = "Visa";
        f.exp.value = "12/" + String((new Date().getFullYear() + 3) % 100).padStart(2, "0");
        f.cvv.value = "123";
        f.terms.checked = true;
        Object.keys(f).forEach((k) => setError(k, ""));
    });

    document.getElementById("coClose").addEventListener("click", closeCheckout);
    checkout.addEventListener("mousedown", (e) => {
        if (e.target === checkout) closeCheckout();
    });

    /* Tab tugmasi oyna ichida aylanib yursin */
    checkout.addEventListener("keydown", (e) => {
        if (e.key !== "Tab") return;
        const items = [...checkout.querySelectorAll("button, input, a[href]")].filter((el) => el.offsetParent !== null && !el.disabled);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
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
            btn.innerHTML = 'Tanlandi <i class="fa-solid fa-check" aria-hidden="true"></i>';
            openModal("Ustoz tanlandi!", `${btn.dataset.teacher} (${btn.dataset.style}) bilan darsni boshlashingiz mumkin.`);
        });
    });

    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeModal();
            closeCheckout();
        }
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
