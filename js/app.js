(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const TL = n => n.toLocaleString("tr-TR") + " ₺";
  const store = {
    get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  const CATS = [
    { id: "tech", name: "Teknoloji", icon: "🎧" },
    { id: "fashion", name: "Moda", icon: "👟" },
    { id: "home", name: "Ev & Yaşam", icon: "🪴" },
    { id: "beauty", name: "Kozmetik", icon: "🧴" },
    { id: "sport", name: "Spor", icon: "🧘" }
  ];
  const P = [
    { id: 1, n: "Kablosuz Kulaklık", c: "tech", p: 1290, o: 1590, r: 4.8, e: "🎧", bg: "#dfe3ff", d: "Aktif gürültü engelleme, 30 saat pil ömrü." },
    { id: 2, n: "Akıllı Saat", c: "tech", p: 2190, r: 4.6, e: "⌚", bg: "#d6f3ea", d: "Nabız, uyku ve adım takibi; 7 gün pil." },
    { id: 3, n: "Taşınabilir Hoparlör", c: "tech", p: 790, o: 990, r: 4.5, e: "🔊", bg: "#ffe7d6", d: "Suya dayanıklı, zengin bas, 12 saat çalma." },
    { id: 4, n: "Rahat Spor Ayakkabı", c: "fashion", p: 1450, r: 4.9, e: "👟", bg: "#ffdfe6", d: "Hafif taban, nefes alan kumaş." },
    { id: 5, n: "Keten Gömlek", c: "fashion", p: 650, o: 820, r: 4.4, e: "👕", bg: "#e6f0ff", d: "%100 keten, yazlık rahat kesim." },
    { id: 6, n: "Deri Sırt Çantası", c: "fashion", p: 1850, r: 4.7, e: "🎒", bg: "#f3e6d6", d: "Laptop bölmeli, su itici yüzey." },
    { id: 7, n: "Seramik Saksı Seti", c: "home", p: 420, r: 4.6, e: "🪴", bg: "#dff3dc", d: "3'lü set, mat ve sade tasarım." },
    { id: 8, n: "Aroma Mum", c: "home", p: 260, o: 320, r: 4.8, e: "🕯️", bg: "#fff2cf", d: "Soya vaksı, lavanta & vanilya." },
    { id: 9, n: "Yün Battaniye", c: "home", p: 890, r: 4.7, e: "🧣", bg: "#ece0ff", d: "Yumuşak dokulu, 150x200 cm." },
    { id: 10, n: "Nemlendirici Krem", c: "beauty", p: 340, r: 4.5, e: "🧴", bg: "#ffe0ee", d: "Hyaluronik asit, tüm cilt tipleri." },
    { id: 11, n: "Parfüm 50ml", c: "beauty", p: 980, o: 1200, r: 4.9, e: "🌸", bg: "#fde0f7", d: "Çiçeksi ve odunsu notalar." },
    { id: 12, n: "Yoga Matı", c: "sport", p: 450, r: 4.6, e: "🧘", bg: "#d9f4f1", d: "Kaymaz yüzey, 6 mm kalınlık." },
    { id: 13, n: "Termos Matara", c: "sport", p: 310, o: 380, r: 4.4, e: "🍵", bg: "#e0ecff", d: "24 saat sıcak, 12 saat soğuk." },
    { id: 14, n: "Koşu Kulaklığı", c: "sport", p: 720, r: 4.3, e: "🏃", bg: "#ffeacc", d: "Kulak arkası tasarım, terlemeye dayanıklı." }
  ];
  const byId = id => P.find(x => x.id === id);

  let state = { cat: "all", q: "", sort: "def" };
  let cart = store.get("cart", {});
  let favs = new Set(store.get("favs", []));

  /* ---------- Toast ---------- */
  let tt;
  const toast = m => { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 2200); };

  /* ---------- Kategoriler ---------- */
  $("#cats").innerHTML = CATS.map(c => `<button class="cat reveal" data-cat="${c.id}"><span>${c.icon}</span><b>${c.name}</b><small>${P.filter(p => p.c === c.id).length} ürün</small></button>`).join("");
  $("#chips").innerHTML = [{ id: "all", name: "Tümü" }, ...CATS].map(c => `<button class="chip${c.id === "all" ? " on" : ""}" data-cat="${c.id}">${c.name}</button>`).join("");

  function setCat(id) {
    state.cat = id;
    $$(".chip").forEach(c => c.classList.toggle("on", c.dataset.cat === id));
    renderGrid();
  }
  document.addEventListener("click", e => {
    const c = e.target.closest("[data-cat]");
    if (c) { setCat(c.dataset.cat); if (c.classList.contains("cat")) $("#urunler").scrollIntoView(); }
  });

  /* ---------- Ürünler ---------- */
  function renderGrid() {
    let list = P.filter(p => (state.cat === "all" || p.c === state.cat) && p.n.toLowerCase().includes(state.q));
    if (state.sort === "asc") list.sort((a, b) => a.p - b.p);
    if (state.sort === "desc") list.sort((a, b) => b.p - a.p);
    if (state.sort === "rate") list.sort((a, b) => b.r - a.r);
    $("#grid").innerHTML = list.map((p, i) => `
      <article class="card" style="--i:${i}" data-id="${p.id}">
        <div class="thumb" style="background:${p.bg}" data-view="${p.id}" tabindex="0" role="button" aria-label="${p.n} hızlı bakış">
          <span>${p.e}</span>
          ${p.o ? `<em class="tag">%${Math.round((1 - p.p / p.o) * 100)} indirim</em>` : ""}
          <button class="fav${favs.has(p.id) ? " on" : ""}" data-fav="${p.id}" aria-label="Favorilere ekle"><svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.5-9.3C1.2 8.5 3 5 6.4 5c2 0 3.5 1.1 4.3 2.5h.6C12.1 6.1 13.6 5 15.6 5 19 5 20.8 8.5 19.5 11.7 19.5 11.7 12 21 12 21z"/></svg></button>
        </div>
        <div class="info">
          <h3>${p.n}</h3>
          <div class="rate"><i>★</i> ${p.r}</div>
          <div class="buy"><div class="price"><b>${TL(p.p)}</b>${p.o ? `<s>${TL(p.o)}</s>` : ""}</div>
          <button class="add" data-add="${p.id}" aria-label="Sepete ekle">+</button></div>
        </div>
      </article>`).join("");
    $("#empty").hidden = list.length > 0;
    $("#resultInfo").textContent = `${list.length} ürün listeleniyor`;
  }

  $("#q").addEventListener("input", e => { state.q = e.target.value.trim().toLowerCase(); renderGrid(); });
  $("#sort").addEventListener("change", e => { state.sort = e.target.value; renderGrid(); });

  /* ---------- Favoriler ---------- */
  function updFav() {
    store.set("favs", [...favs]);
    const b = $("#favCount"); b.textContent = favs.size; b.classList.toggle("on", favs.size > 0); bump(b);
  }
  function toggleFav(id) {
    favs.has(id) ? favs.delete(id) : favs.add(id);
    updFav();
    $$(`[data-fav="${id}"]`).forEach(b => b.classList.toggle("on", favs.has(id)));
    toast(favs.has(id) ? "Favorilere eklendi ♥" : "Favorilerden çıkarıldı");
  }
  $("#favBtn").addEventListener("click", () => {
    if (!favs.size) return toast("Henüz favori ürününüz yok");
    state.cat = "all"; state.q = ""; $("#q").value = ""; setCat("all");
    $$(".card").forEach(c => c.hidden = !favs.has(+c.dataset.id));
    toast("Sadece favoriler gösteriliyor"); $("#urunler").scrollIntoView();
    $("#resultInfo").innerHTML = `Favoriler · <a href="#urunler" id="clearFav" style="color:var(--brand)">tümünü göster</a>`;
    $("#clearFav").onclick = () => renderGrid();
  });

  /* ---------- Sepet ---------- */
  const bump = el => { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); };
  const FREE = 500;
  function renderCart() {
    store.set("cart", cart);
    const ids = Object.keys(cart).map(Number);
    const count = ids.reduce((s, i) => s + cart[i], 0);
    const total = ids.reduce((s, i) => s + byId(i).p * cart[i], 0);
    const b = $("#cartCount"); b.textContent = count; b.classList.toggle("on", count > 0);
    $("#cartTotal").textContent = TL(total);
    $("#cartItems").innerHTML = ids.length ? ids.map(i => { const p = byId(i); return `
      <div class="line"><div class="t" style="background:${p.bg}">${p.e}</div>
      <div><h5>${p.n}</h5><small>${TL(p.p)}</small><br>
        <div class="qty"><button data-dec="${i}" aria-label="Azalt">−</button><span>${cart[i]}</span><button data-inc="${i}" aria-label="Artır">+</button></div></div>
      <button class="rm" data-rm="${i}">Kaldır</button></div>`; }).join("")
      : `<div class="cart-empty"><span>🛒</span>Sepetiniz henüz boş.</div>`;
    const left = FREE - total;
    $("#shipText").textContent = total === 0 ? `${TL(FREE)} üzeri ücretsiz kargo` : left > 0 ? `Ücretsiz kargo için ${TL(left)} daha ekleyin` : "🎉 Ücretsiz kargo kazandınız!";
    $("#shipFill").style.width = Math.min(100, total / FREE * 100) + "%";
    $("#checkout").disabled = !ids.length;
  }
  function addToCart(id, n = 1) {
    cart[id] = (cart[id] || 0) + n; renderCart(); bump($("#cartCount"));
    toast(`${byId(id).n} sepete eklendi`);
  }
  const openCart = on => {
    $("#drawer").classList.toggle("on", on); $("#overlay").classList.toggle("on", on);
    $("#drawer").setAttribute("aria-hidden", !on);
  };
  $("#cartBtn").onclick = () => openCart(true);
  $("#closeCart").onclick = $("#overlay").onclick = () => openCart(false);
  $("#checkout").onclick = () => { cart = {}; renderCart(); openCart(false); toast("Siparişiniz alındı (demo) 🎉"); };

  /* ---------- Hızlı bakış ---------- */
  function openModal(id) {
    const p = byId(id);
    $("#modalCard").innerHTML = `
      <button class="icon-btn m-x" data-close aria-label="Kapat">×</button>
      <div class="m-art" style="background:${p.bg}">${p.e}</div>
      <div class="m-info"><span class="rate"><i>★</i> ${p.r} · ${CATS.find(c => c.id === p.c).name}</span>
        <h3 style="font-size:1.5rem">${p.n}</h3><p>${p.d}</p>
        <div class="price"><b style="font-size:1.5rem">${TL(p.p)}</b>${p.o ? `<s>${TL(p.o)}</s>` : ""}</div>
        <button class="btn block" data-add="${p.id}">Sepete ekle</button></div>`;
    $("#modal").classList.add("on"); $("#modal").setAttribute("aria-hidden", "false");
  }
  const closeModal = () => { $("#modal").classList.remove("on"); $("#modal").setAttribute("aria-hidden", "true"); };

  /* ---------- Tek tıklama yöneticisi ---------- */
  document.addEventListener("click", e => {
    const t = e.target;
    let el;
    if ((el = t.closest("[data-fav]"))) { e.stopPropagation(); return toggleFav(+el.dataset.fav); }
    if ((el = t.closest("[data-add]"))) { return addToCart(+el.dataset.add); }
    if ((el = t.closest("[data-view]"))) return openModal(+el.dataset.view);
    if ((el = t.closest("[data-inc]"))) { cart[el.dataset.inc]++; return renderCart(); }
    if ((el = t.closest("[data-dec]"))) { const k = el.dataset.dec; if (--cart[k] <= 0) delete cart[k]; return renderCart(); }
    if ((el = t.closest("[data-rm]"))) { delete cart[el.dataset.rm]; return renderCart(); }
    if (t.closest("[data-close]") || t.id === "modal") return closeModal();
    if ((el = t.closest(".ad-x"))) { const ad = el.closest(".ad"); ad.classList.add("gone"); store.set("ad-" + [...ad.parentNode.children].indexOf(ad) + ad.parentNode.className, 1); }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeModal(); openCart(false); }
    if (e.key === "Enter" && e.target.matches("[data-view]")) openModal(+e.target.dataset.view);
  });

  /* ---------- Tema ---------- */
  const root = document.documentElement;
  const saved = store.get("theme", matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  root.dataset.theme = saved;
  $("#theme").onclick = () => { const n = root.dataset.theme === "dark" ? "light" : "dark"; root.dataset.theme = n; store.set("theme", n); };

  /* ---------- Header gölgesi ---------- */
  const hd = $("#header");
  addEventListener("scroll", () => hd.classList.toggle("scrolled", scrollY > 8), { passive: true });

  /* ---------- Scroll reveal + sayaç ---------- */
  const countUp = el => {
    const end = +el.dataset.count, dec = +(el.dataset.dec || 0), t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / 1600), v = end * (1 - Math.pow(1 - k, 3));
      el.textContent = dec ? v.toFixed(dec) : Math.round(v).toLocaleString("tr-TR"); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(es => es.forEach(x => {
    if (!x.isIntersecting) return;
    x.target.classList.add("in");
    $$("[data-count]", x.target).forEach(countUp);
    io.unobserve(x.target);
  }), { threshold: .15 });
  $$(".reveal").forEach(el => io.observe(el));

  /* ---------- Diğer ---------- */
  $("#copyCode").onclick = () => { navigator.clipboard?.writeText("HOSGELDIN"); toast("Kod kopyalandı: HOSGELDIN"); };
  $("#newsForm").onsubmit = e => { e.preventDefault(); e.target.reset(); toast("Teşekkürler, abone oldunuz ✉️"); };

  updFav(); renderCart(); renderGrid();
})();
