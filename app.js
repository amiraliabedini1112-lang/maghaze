const USERNAME = "amirali";
const PASSWORD = "sstttat";

let products = [];

try {
    products = JSON.parse(localStorage.getItem("products") || "[]");
    if (!Array.isArray(products)) products = [];
} catch {
    products = [];
}

function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (username === USERNAME && password === PASSWORD) {
        document.getElementById("login").style.display = "none";
        document.getElementById("app").style.display = "block";

        renderProducts();
        updateSaleProducts();
    } else {
        document.getElementById("error").textContent =
            "نام کاربری یا رمز عبور اشتباه است.";
    }
}

function logout() {
    document.getElementById("app").style.display = "none";
    document.getElementById("login").style.display = "block";
}

function show(section) {
    document.getElementById("products").style.display =
        section === "products" ? "block" : "none";

    document.getElementById("sales").style.display =
        section === "sales" ? "block" : "none";

    updateSaleProducts();
}

function save() {
    localStorage.setItem("products", JSON.stringify(products));
}

function addProduct() {
    const name = document.getElementById("name").value.trim();
    const buy = Number(document.getElementById("buy").value);
    const sell = Number(document.getElementById("sell").value);
    const stock = Number(document.getElementById("stock").value);

    if (!name) {
        alert("نام کالا را وارد کنید.");
        return;
    }

    products.push({
        id: Date.now(),
        name,
        buy,
        sell,
        stock
    });

    save();

    document.getElementById("name").value = "";
    document.getElementById("buy").value = "";
    document.getElementById("sell").value = "";
    document.getElementById("stock").value = "";

    renderProducts();
    updateSaleProducts();
}

function renderProducts() {
    const list = document.getElementById("productList");

    if (!products.length) {
        list.innerHTML = "<p>هنوز کالایی ثبت نشده است.</p>";
        return;
    }

    list.innerHTML = products.map(p => `
        <div style="
            background:white;
            border:1px solid #ddd;
            padding:15px;
            margin:10px 0;
            border-radius:10px;
        ">
            <strong>${p.name}</strong>
            <br>
            قیمت خرید: ${Number(p.buy).toLocaleString()} تومان
            <br>
            قیمت فروش: ${Number(p.sell).toLocaleString()} تومان
            <br>
            موجودی: ${p.stock}
            <br><br>

            <button onclick="changeStock(${p.id},1)">+ موجودی</button>
            <button onclick="changeStock(${p.id},-1)">- موجودی</button>
            <button onclick="deleteProduct(${p.id})">حذف</button>
        </div>
    `).join("");
}
function changeStock(id, amount) {
    const product = products.find(p => p.id === id);

    if (!product) return;

    if (product.stock + amount < 0) {
        alert("موجودی کافی نیست.");
        return;
    }

    product.stock += amount;

    save();
    renderProducts();
    updateSaleProducts();
}

function deleteProduct(id) {
    if (!confirm("این کالا حذف شود؟")) return;

    products = products.filter(p => p.id !== id);

    save();
    renderProducts();
    updateSaleProducts();
}

function updateSaleProducts() {
    const select = document.getElementById("saleProduct");

    if (!select) return;

    if (!products.length) {
        select.innerHTML = "<option>ابتدا کالا ثبت کنید</option>";
        return;
    }

    select.innerHTML = products.map(p => `
        <option value="${p.id}">
            ${p.name} - موجودی: ${p.stock}
        </option>
    `).join("");
}

function addSale() {
    const id = Number(document.getElementById("saleProduct").value);
    const qty = Number(document.getElementById("saleQty").value);

    const product = products.find(p => p.id === id);

    if (!product) {
        alert("کالا انتخاب نشده است.");
        return;
    }

    if (qty <= 0) {
        alert("تعداد صحیح وارد کنید.");
        return;
    }

    if (product.stock < qty) {
        alert("موجودی کافی نیست.");
        return;
    }

    product.stock -= qty;

    save();
    renderProducts();
    updateSaleProducts();

    document.getElementById("saleMessage").textContent =
        "فروش با موفقیت ثبت شد.";
}
