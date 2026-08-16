const SUPABASE_URL = "https://xarblclsauoltgbeeyiw.supabase.co";
const SUPABASE_KEY = "sb_publishable_jSGWrehYjhZjEq-O-2dzNw_0DzOWMTz";

const USERNAME = "amirali";
const PASSWORD = "sstttat";

let products = [];
let transactions = [];


/* =========================
   DATABASE
========================= */

async function loadData() {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/products?select=*&order=id.desc`,
            {
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            }
        );
const SUPABASE_URL = "https://xarblclsauoltgbeeyiw.supabase.co";
const SUPABASE_KEY = "sb_publishable_jSGWrehYjhZjEq-O-2dzNw_0DzOWMTz";

const USERNAME = "amirali";
const PASSWORD = "sstttat";

let products = [];
let transactions = [];


/* =========================
   DATABASE
========================= */

async function loadData() {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/products?select=*&order=id.desc`,
            {
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(await response.text());
        }

        products = await response.json();

        renderProducts();
        updateSaleProducts();
        updatePurchaseProducts();
        updateDashboard();

    } catch (error) {
        console.error(error);
        alert("خطا در اتصال به دیتابیس:\n" + error.message);
    }
}


async function loadTransactions() {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/transactions?select=*&order=id.desc`,
            {
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(await response.text());
        }

        transactions = await response.json();

        renderHistory();
        updateDashboard();

    } catch (error) {
        console.error(error);
        alert("خطا در دریافت تاریخچه:\n" + error.message);
    }
}


/* =========================
   LOGIN
========================= */

function login() {

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    if (username === USERNAME && password === PASSWORD) {

        document.getElementById("login").style.display = "none";
        document.getElementById("app").style.display = "block";

        loadData();
        loadTransactions();

    } else {

        document.getElementById("error").textContent =
            "نام کاربری یا رمز عبور اشتباه است.";
    }
}


function logout() {

    document.getElementById("app").style.display = "none";
    document.getElementById("login").style.display = "block";
}


/* =========================
   NAVIGATION
========================= */

function show(section) {

    const sections = [
        "dashboard",
        "products",
        "sales",
        "purchases",
        "history"
    ];

    sections.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {

            element.style.display =
                id === section ? "block" : "none";
        }
    });


    if (section === "products") {
        renderProducts();
    }


    if (section === "sales") {
        updateSaleProducts();
    }


    if (section === "purchases") {
        updatePurchaseProducts();
    }


    if (section === "history") {
        loadTransactions();
    }


    if (section === "dashboard") {
        updateDashboard();
    }
}


/* =========================
   PRODUCTS
========================= */

async function addProduct() {

    const name =
        document.getElementById("name").value.trim();

    const buy =
        Number(document.getElementById("buy").value);

    const sell =
        Number(document.getElementById("sell").value);

    const stock =
        Number(document.getElementById("stock").value);


    if (!name) {
        alert("نام کالا را وارد کنید.");
        return;
    }


    if (
        !Number.isFinite(buy) ||
        !Number.isFinite(sell) ||
        !Number.isFinite(stock) ||
        buy < 0 ||
        sell < 0 ||
        stock < 0
    ) {
        alert("مقادیر وارد شده صحیح نیست.");
        return;
    }


    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/products`,
            {
                method: "POST",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },

                body: JSON.stringify({
                    name: name,
                    buy_price: buy,
                    sell_price: sell,
                    stock: stock
                })
            }
        );


        if (!response.ok) {
            throw new Error(await response.text());
        }


        document.getElementById("name").value = "";
        document.getElementById("buy").value = "";
        document.getElementById("sell").value = "";
        document.getElementById("stock").value = "";


        alert("کالا با موفقیت ثبت شد.");

        await loadData();

    } catch (error) {

        console.error(error);

        alert(
            "ثبت کالا انجام نشد:\n" +
            error.message
        );
    }
}


function renderProducts() {

    const list =
        document.getElementById("productList");

    if (!list) return;


    if (!products.length) {

        list.innerHTML =
            "<p>هنوز کالایی ثبت نشده است.</p>";

        return;
    }


    list.innerHTML = products.map(product => `

        <div style="
            background:white;
            padding:15px;
            margin:10px 0;
            border-radius:10px;
            border:1px solid #ddd;
        ">

            <strong>
                ${escapeHtml(product.name)}
            </strong>

            <br>

            قیمت خرید:
            ${Number(product.buy_price || 0).toLocaleString()}
            تومان

            <br>

            قیمت فروش:
            ${Number(product.sell_price || 0).toLocaleString()}
            تومان

            <br>

            موجودی:
            ${Number(product.stock || 0)}

            <br><br>

            <button onclick="changeStock(${product.id}, 1)">
                + موجودی
            </button>

            <button onclick="changeStock(${product.id}, -1)">
                - موجودی
            </button>

            <button onclick="deleteProduct(${product.id})">
                حذف
            </button>

        </div>

    `).join("");
}


/* =========================
   CHANGE STOCK
========================= */

async function changeStock(id, amount) {

    const product =
        products.find(p => Number(p.id) === Number(id));

    if (!product) return;


    const newStock =
        Number(product.stock) + Number(amount);


    if (newStock < 0) {

        alert("موجودی کافی نیست.");
        return;
    }


    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`,
            {
                method: "PATCH",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    stock: newStock
                })
            }
        );


        if (!response.ok) {
            throw new Error(await response.text());
        }


        await loadData();

    } catch (error) {

        console.error(error);

        alert(
            "تغییر موجودی انجام نشد:\n" +
            error.message
        );
    }
}


/* =========================
   DELETE PRODUCT
========================= */

async function deleteProduct(id) {

    if (!confirm("این کالا حذف شود؟")) {
        return;
    }


    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`,
            {
                method: "DELETE",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            }
        );


        if (!response.ok) {
            throw new Error(await response.text());
        }


        await loadData();

    } catch (error) {

        console.error(error);

        alert(
            "حذف کالا انجام نشد:\n" +
            error.message
        );
    }
}


/* =========================
   SALE PRODUCTS
========================= */

function updateSaleProducts() {

    const select =
        document.getElementById("saleProduct");

    if (!select) return;


    if (!products.length) {

        select.innerHTML =
            "<option value=''>ابتدا کالا ثبت کنید</option>";

        return;
    }


    select.innerHTML = products.map(product => `

        <option value="${product.id}">
            ${escapeHtml(product.name)}
            - موجودی:
            ${Number(product.stock || 0)}
        </option>

    `).join("");
}


/* =========================
   PURCHASE PRODUCTS
========================= */

function updatePurchaseProducts() {

    const select =
        document.getElementById("purchaseProduct");

    if (!select) return;


    if (!products.length) {

        select.innerHTML =
            "<option value=''>ابتدا کالا ثبت کنید</option>";

        return;
    }


    select.innerHTML = products.map(product => `

        <option value="${product.id}">
            ${escapeHtml(product.name)}
            - موجودی:
            ${Number(product.stock || 0)}
        </option>

    `).join("");
}


/* =========================
   SALE
========================= */

async function addSale() {

    const id =
        Number(
            document.getElementById("saleProduct").value
        );

    const qty =
        Number(
            document.getElementById("saleQty").value
        );


    const product =
        products.find(p => Number(p.id) === id);


    if (!product) {

        alert("کالا انتخاب نشده است.");
        return;
    }


    if (!Number.isInteger(qty) || qty <= 0) {

        alert("تعداد صحیح وارد کنید.");
        return;
    }


    if (Number(product.stock) < qty) {

        alert("موجودی کافی نیست.");
        return;
    }


    try {

        const newStock =
            Number(product.stock) - qty;


        /*
         * اول موجودی کم می‌شود
         */

        const updateResponse =
            await fetch(
                `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`,
                {
                    method: "PATCH",

                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization": `Bearer ${SUPABASE_KEY}`,
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        stock: newStock
                    })
                }
            );


        if (!updateResponse.ok) {

            throw new Error(
                await updateResponse.text()
            );
        }


        const total =
            Number(product.sell_price) * qty;


        /*
         * ثبت معامله
         *
         * مهم:
         * اینجا فقط ستون‌های واقعی جدول استفاده می‌شوند:
         * product_id
         * type
         * quantity
         * unit_price
         * total_price
         */

        const transactionResponse =
            await fetch(
                `${SUPABASE_URL}/rest/v1/transactions`,
                {
                    method: "POST",

                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization": `Bearer ${SUPABASE_KEY}`,
                        "Content-Type": "application/json",
                        "Prefer": "return=representation"
                    },

                    body: JSON.stringify({

                        type: "sale",

                        product_id: product.id,

                        quantity: qty,

                        unit_price:
                            Number(product.sell_price),

                        total_price:
                            total

                    })
                }
            );


        if (!transactionResponse.ok) {

            throw new Error(
                await transactionResponse.text()
            );
        }


        const message =
            document.getElementById("saleMessage");

        if (message) {
            message.textContent =
                "فروش با موفقیت ثبت شد.";
        }


        const qtyInput =
            document.getElementById("saleQty");

        if (qtyInput) {
            qtyInput.value = "";
        }


        await loadData();
        await loadTransactions();


    } catch (error) {

        console.error(error);

        alert(
            "ثبت فروش انجام نشد:\n" +
            error.message
        );
    }
}


/* =========================
   PURCHASE
========================= */

async function addPurchase() {

    const id =
        Number(
            document.getElementById("purchaseProduct").value
        );

    const qty =
        Number(
            document.getElementById("purchaseQty").value
        );


    const product =
        products.find(p => Number(p.id) === id);


    if (!product) {

        alert("کالا انتخاب نشده است.");
        return;
    }


    if (!Number.isInteger(qty) || qty <= 0) {

        alert("تعداد صحیح وارد کنید.");
        return;
    }


    try {

        const newStock =
            Number(product.stock) + qty;


        /*
         * افزایش موجودی
         */

        const updateResponse =
            await fetch(
                `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`,
                {
                    method: "PATCH",

                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization": `Bearer ${SUPABASE_KEY}`,
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        stock: newStock
                    })
                }
            );


        if (!updateResponse.ok) {

            throw new Error(
                await updateResponse.text()
            );
        }


        const total =
            Number(product.buy_price) * qty;


        /*
         * ثبت خرید
         */

        const transactionResponse =
            await fetch(
                `${SUPABASE_URL}/rest/v1/transactions`,
                {
                    method: "POST",

                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization": `Bearer ${SUPABASE_KEY}`,
                        "Content-Type": "application/json",
                        "Prefer": "return=representation"
                    },

                    body: JSON.stringify({

                        type: "purchase",

                        product_id: product.id,

                        quantity: qty,

                        unit_price:
                            Number(product.buy_price),

                        total_price:
                            total

                    })
                }
            );


        if (!transactionResponse.ok) {

            throw new Error(
                await transactionResponse.text()
            );
        }


        const message =
            document.getElementById("purchaseMessage");

        if (message) {
            message.textContent =
                "خرید با موفقیت ثبت شد.";
        }


        const qtyInput =
            document.getElementById("purchaseQty");

        if (qtyInput) {
            qtyInput.value = "";
        }


        await loadData();
        await loadTransactions();


    } catch (error) {

        console.error(error);

        alert(
            "ثبت خرید انجام نشد:\n" +
            error.message
        );
    }
}


/* =========================
   HISTORY
========================= */

function renderHistory() {

    const list =
        document.getElementById("historyList");

    if (!list) return;


    if (!transactions.length) {

        list.innerHTML =
            "<p>هنوز معامله‌ای ثبت نشده است.</p>";

        return;
    }


    list.innerHTML =
        transactions.map(t => {

            const product =
                products.find(
                    p =>
                        Number(p.id) ===
                        Number(t.product_id)
                );


            const productName =
                product
                    ? product.name
                    : "کالای حذف‌شده";


            const quantity =
                Number(t.quantity || 0);


            const total =
                Number(t.total_price || 0);


            return `

                <div style="
                    background:white;
                    padding:12px;
                    margin:8px 0;
                    border:1px solid #ddd;
                    border-radius:8px;
                ">

                    <strong>
                        ${
                            t.type === "sale"
                                ? "فروش"
                                : "خرید"
                        }
                    </strong>

                    <br>

                    کالا:
                    ${escapeHtml(productName)}

                    <br>

                    تعداد:
                    ${quantity}

                    <br>

                    مبلغ:
                    ${total.toLocaleString()}
                    تومان

                    <br>

                    تاریخ:
                    ${
                        t.created_at
                            ? new Date(
                                t.created_at
                              ).toLocaleString(
                                "fa-IR"
                              )
                            : "-"
                    }

                </div>

            `;

        }).join("");
}


/* =========================
   DASHBOARD
========================= */

function updateDashboard() {

    const productsElement =
        document.getElementById(
            "dashboardProducts"
        );


    const stockValueElement =
        document.getElementById(
            "dashboardStockValue"
        );


    const salesElement =
        document.getElementById(
            "dashboardSales"
        );


    if (productsElement) {

        productsElement.textContent =
            products.length;
    }


    if (stockValueElement) {

        const value =
            products.reduce(

                (sum, p) =>

                    sum +

                    Number(
                        p.buy_price || 0
                    ) *

                    Number(
                        p.stock || 0
                    ),

                0
            );


        stockValueElement.textContent =
            value.toLocaleString();
    }


    if (salesElement) {

        const value =
            transactions

                .filter(
                    t =>
                        t.type === "sale"
                )

                .reduce(

                    (sum, t) =>

                        sum +

                        Number(
                            t.total_price || 0
                        ),

                    0
                );


        salesElement.textContent =
            value.toLocaleString();
    }


    const recent =
        document.getElementById(
            "recentTransactions"
        );


    if (!recent) return;


    if (!transactions.length) {

        recent.textContent =
            "هنوز معامله‌ای ثبت نشده است.";

        return;
    }


    recent.innerHTML =
        transactions

            .slice(0, 5)

            .map(t => {

                const product =
                    products.find(
                        p =>
                            Number(p.id) ===
                            Number(t.product_id)
                    );


                const productName =
                    product
                        ? product.name
                        : "کالای حذف‌شده";


                return `

                    <div>

                        ${
                            t.type === "sale"
                                ? "فروش"
                                : "خرید"
                        }

                        -

                        ${escapeHtml(productName)}

                        -

                        ${Number(
                            t.quantity || 0
                        )}

                    </div>

                `;

            })

            .join("");
}


/* =========================
   SECURITY / HTML
========================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   STARTUP
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * اگر قبلاً app مخفی است،
         * کاری انجام نمی‌دهیم.
         */

        const loginBox =
            document.getElementById("login");

        const appBox =
            document.getElementById("app");


        if (loginBox && appBox) {

            appBox.style.display = "none";
            loginBox.style.display = "block";
        }

    }
);
        if (!response.ok) {
            throw new Error(await response.text());
        }

        products = await response.json();

        renderProducts();
        updateSaleProducts();
        updatePurchaseProducts();
        updateDashboard();

    } catch (error) {
        console.error(error);
        alert("خطا در اتصال به دیتابیس:\n" + error.message);
    }
}


async function loadTransactions() {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/transactions?select=*&order=id.desc`,
            {
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(await response.text());
        }

        transactions = await response.json();

        renderHistory();
        updateDashboard();

    } catch (error) {
        console.error(error);
        alert("خطا در دریافت تاریخچه:\n" + error.message);
    }
}


/* =========================
   LOGIN
========================= */

function login() {

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    if (username === USERNAME && password === PASSWORD) {

        document.getElementById("login").style.display = "none";
        document.getElementById("app").style.display = "block";

        loadData();
        loadTransactions();

    } else {

        document.getElementById("error").textContent =
            "نام کاربری یا رمز عبور اشتباه است.";
    }
}


function logout() {

    document.getElementById("app").style.display = "none";
    document.getElementById("login").style.display = "block";
}


/* =========================
   NAVIGATION
========================= */

function show(section) {

    const sections = [
        "dashboard",
        "products",
        "sales",
        "purchases",
        "history"
    ];

    sections.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {

            element.style.display =
                id === section ? "block" : "none";
        }
    });


    if (section === "products") {
        renderProducts();
    }


    if (section === "sales") {
        updateSaleProducts();
    }


    if (section === "purchases") {
        updatePurchaseProducts();
    }


    if (section === "history") {
        loadTransactions();
    }


    if (section === "dashboard") {
        updateDashboard();
    }
}


/* =========================
   PRODUCTS
========================= */

async function addProduct() {

    const name =
        document.getElementById("name").value.trim();

    const buy =
        Number(document.getElementById("buy").value);

    const sell =
        Number(document.getElementById("sell").value);

    const stock =
        Number(document.getElementById("stock").value);


    if (!name) {
        alert("نام کالا را وارد کنید.");
        return;
    }


    if (
        !Number.isFinite(buy) ||
        !Number.isFinite(sell) ||
        !Number.isFinite(stock) ||
        buy < 0 ||
        sell < 0 ||
        stock < 0
    ) {
        alert("مقادیر وارد شده صحیح نیست.");
        return;
    }


    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/products`,
            {
                method: "POST",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },

                body: JSON.stringify({
                    name: name,
                    buy_price: buy,
                    sell_price: sell,
                    stock: stock
                })
            }
        );


        if (!response.ok) {
            throw new Error(await response.text());
        }


        document.getElementById("name").value = "";
        document.getElementById("buy").value = "";
        document.getElementById("sell").value = "";
        document.getElementById("stock").value = "";


        alert("کالا با موفقیت ثبت شد.");

        await loadData();

    } catch (error) {

        console.error(error);

        alert(
            "ثبت کالا انجام نشد:\n" +
            error.message
        );
    }
}


function renderProducts() {

    const list =
        document.getElementById("productList");

    if (!list) return;


    if (!products.length) {

        list.innerHTML =
            "<p>هنوز کالایی ثبت نشده است.</p>";

        return;
    }


    list.innerHTML = products.map(product => `

        <div style="
            background:white;
            padding:15px;
            margin:10px 0;
            border-radius:10px;
            border:1px solid #ddd;
        ">

            <strong>
                ${escapeHtml(product.name)}
            </strong>

            <br>

            قیمت خرید:
            ${Number(product.buy_price || 0).toLocaleString()}
            تومان

            <br>

            قیمت فروش:
            ${Number(product.sell_price || 0).toLocaleString()}
            تومان

            <br>

            موجودی:
            ${Number(product.stock || 0)}

            <br><br>

            <button onclick="changeStock(${product.id}, 1)">
                + موجودی
            </button>

            <button onclick="changeStock(${product.id}, -1)">
                - موجودی
            </button>

            <button onclick="deleteProduct(${product.id})">
                حذف
            </button>

        </div>

    `).join("");
}


/* =========================
   CHANGE STOCK
========================= */

async function changeStock(id, amount) {

    const product =
        products.find(p => Number(p.id) === Number(id));

    if (!product) return;


    const newStock =
        Number(product.stock) + Number(amount);


    if (newStock < 0) {

        alert("موجودی کافی نیست.");
        return;
    }


    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`,
            {
                method: "PATCH",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    stock: newStock
                })
            }
        );


        if (!response.ok) {
            throw new Error(await response.text());
        }


        await loadData();

    } catch (error) {

        console.error(error);

        alert(
            "تغییر موجودی انجام نشد:\n" +
            error.message
        );
    }
}


/* =========================
   DELETE PRODUCT
========================= */

async function deleteProduct(id) {

    if (!confirm("این کالا حذف شود؟")) {
        return;
    }


    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`,
            {
                method: "DELETE",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            }
        );


        if (!response.ok) {
            throw new Error(await response.text());
        }


        await loadData();

    } catch (error) {

        console.error(error);

        alert(
            "حذف کالا انجام نشد:\n" +
            error.message
        );
    }
}


/* =========================
   SALE PRODUCTS
========================= */

function updateSaleProducts() {

    const select =
        document.getElementById("saleProduct");

    if (!select) return;


    if (!products.length) {

        select.innerHTML =
            "<option value=''>ابتدا کالا ثبت کنید</option>";

        return;
    }


    select.innerHTML = products.map(product => `

        <option value="${product.id}">
            ${escapeHtml(product.name)}
            - موجودی:
            ${Number(product.stock || 0)}
        </option>

    `).join("");
}


/* =========================
   PURCHASE PRODUCTS
========================= */

function updatePurchaseProducts() {

    const select =
        document.getElementById("purchaseProduct");

    if (!select) return;


    if (!products.length) {

        select.innerHTML =
            "<option value=''>ابتدا کالا ثبت کنید</option>";

        return;
    }


    select.innerHTML = products.map(product => `

        <option value="${product.id}">
            ${escapeHtml(product.name)}
            - موجودی:
            ${Number(product.stock || 0)}
        </option>

    `).join("");
}


/* =========================
   SALE
========================= */

async function addSale() {

    const id =
        Number(
            document.getElementById("saleProduct").value
        );

    const qty =
        Number(
            document.getElementById("saleQty").value
        );


    const product =
        products.find(p => Number(p.id) === id);


    if (!product) {

        alert("کالا انتخاب نشده است.");
        return;
    }


    if (!Number.isInteger(qty) || qty <= 0) {

        alert("تعداد صحیح وارد کنید.");
        return;
    }


    if (Number(product.stock) < qty) {

        alert("موجودی کافی نیست.");
        return;
    }


    try {

        const newStock =
            Number(product.stock) - qty;


        /*
         * اول موجودی کم می‌شود
         */

        const updateResponse =
            await fetch(
                `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`,
                {
                    method: "PATCH",

                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization": `Bearer ${SUPABASE_KEY}`,
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        stock: newStock
                    })
                }
            );


        if (!updateResponse.ok) {

            throw new Error(
                await updateResponse.text()
            );
        }


        const total =
            Number(product.sell_price) * qty;


        /*
         * ثبت معامله
         *
         * مهم:
         * اینجا فقط ستون‌های واقعی جدول استفاده می‌شوند:
         * product_id
         * type
         * quantity
         * unit_price
         * total_price
         */

        const transactionResponse =
            await fetch(
                `${SUPABASE_URL}/rest/v1/transactions`,
                {
                    method: "POST",

                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization": `Bearer ${SUPABASE_KEY}`,
                        "Content-Type": "application/json",
                        "Prefer": "return=representation"
                    },

                    body: JSON.stringify({

                        type: "sale",

                        product_id: product.id,

                        quantity: qty,

                        unit_price:
                            Number(product.sell_price),

                        total_price:
                            total

                    })
                }
            );


        if (!transactionResponse.ok) {

            throw new Error(
                await transactionResponse.text()
            );
        }


        const message =
            document.getElementById("saleMessage");

        if (message) {
            message.textContent =
                "فروش با موفقیت ثبت شد.";
        }


        const qtyInput =
            document.getElementById("saleQty");

        if (qtyInput) {
            qtyInput.value = "";
        }


        await loadData();
        await loadTransactions();


    } catch (error) {

        console.error(error);

        alert(
            "ثبت فروش انجام نشد:\n" +
            error.message
        );
    }
}


/* =========================
   PURCHASE
========================= */

async function addPurchase() {

    const id =
        Number(
            document.getElementById("purchaseProduct").value
        );

    const qty =
        Number(
            document.getElementById("purchaseQty").value
        );


    const product =
        products.find(p => Number(p.id) === id);


    if (!product) {

        alert("کالا انتخاب نشده است.");
        return;
    }


    if (!Number.isInteger(qty) || qty <= 0) {

        alert("تعداد صحیح وارد کنید.");
        return;
    }


    try {

        const newStock =
            Number(product.stock) + qty;


        /*
         * افزایش موجودی
         */

        const updateResponse =
            await fetch(
                `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`,
                {
                    method: "PATCH",

                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization": `Bearer ${SUPABASE_KEY}`,
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        stock: newStock
                    })
                }
            );


        if (!updateResponse.ok) {

            throw new Error(
                await updateResponse.text()
            );
        }


        const total =
            Number(product.buy_price) * qty;


        /*
         * ثبت خرید
         */

        const transactionResponse =
            await fetch(
                `${SUPABASE_URL}/rest/v1/transactions`,
                {
                    method: "POST",

                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization": `Bearer ${SUPABASE_KEY}`,
                        "Content-Type": "application/json",
                        "Prefer": "return=representation"
                    },

                    body: JSON.stringify({

                        type: "purchase",

                        product_id: product.id,

                        quantity: qty,

                        unit_price:
                            Number(product.buy_price),

                        total_price:
                            total

                    })
                }
            );


        if (!transactionResponse.ok) {

            throw new Error(
                await transactionResponse.text()
            );
        }


        const message =
            document.getElementById("purchaseMessage");

        if (message) {
            message.textContent =
                "خرید با موفقیت ثبت شد.";
        }


        const qtyInput =
            document.getElementById("purchaseQty");

        if (qtyInput) {
            qtyInput.value = "";
        }


        await loadData();
        await loadTransactions();


    } catch (error) {

        console.error(error);

        alert(
            "ثبت خرید انجام نشد:\n" +
            error.message
        );
    }
}


/* =========================
   HISTORY
========================= */

function renderHistory() {

    const list =
        document.getElementById("historyList");

    if (!list) return;


    if (!transactions.length) {

        list.innerHTML =
            "<p>هنوز معامله‌ای ثبت نشده است.</p>";

        return;
    }


    list.innerHTML =
        transactions.map(t => {

            const product =
                products.find(
                    p =>
                        Number(p.id) ===
                        Number(t.product_id)
                );


            const productName =
                product
                    ? product.name
                    : "کالای حذف‌شده";


            const quantity =
                Number(t.quantity || 0);


            const total =
                Number(t.total_price || 0);


            return `

                <div style="
                    background:white;
                    padding:12px;
                    margin:8px 0;
                    border:1px solid #ddd;
                    border-radius:8px;
                ">

                    <strong>
                        ${
                            t.type === "sale"
                                ? "فروش"
                                : "خرید"
                        }
                    </strong>

                    <br>

                    کالا:
                    ${escapeHtml(productName)}

                    <br>

                    تعداد:
                    ${quantity}

                    <br>

                    مبلغ:
                    ${total.toLocaleString()}
                    تومان

                    <br>

                    تاریخ:
                    ${
                        t.created_at
                            ? new Date(
                                t.created_at
                              ).toLocaleString(
                                "fa-IR"
                              )
                            : "-"
                    }

                </div>

            `;

        }).join("");
}


/* =========================
   DASHBOARD
========================= */

function updateDashboard() {

    const productsElement =
        document.getElementById(
            "dashboardProducts"
        );


    const stockValueElement =
        document.getElementById(
            "dashboardStockValue"
        );


    const salesElement =
        document.getElementById(
            "dashboardSales"
        );


    if (productsElement) {

        productsElement.textContent =
            products.length;
    }


    if (stockValueElement) {

        const value =
            products.reduce(

                (sum, p) =>

                    sum +

                    Number(
                        p.buy_price || 0
                    ) *

                    Number(
                        p.stock || 0
                    ),

                0
            );


        stockValueElement.textContent =
            value.toLocaleString();
    }


    if (salesElement) {

        const value =
            transactions

                .filter(
                    t =>
                        t.type === "sale"
                )

                .reduce(

                    (sum, t) =>

                        sum +

                        Number(
                            t.total_price || 0
                        ),

                    0
                );


        salesElement.textContent =
            value.toLocaleString();
    }


    const recent =
        document.getElementById(
            "recentTransactions"
        );


    if (!recent) return;


    if (!transactions.length) {

        recent.textContent =
            "هنوز معامله‌ای ثبت نشده است.";

        return;
    }


    recent.innerHTML =
        transactions

            .slice(0, 5)

            .map(t => {

                const product =
                    products.find(
                        p =>
                            Number(p.id) ===
                            Number(t.product_id)
                    );


                const productName =
                    product
                        ? product.name
                        : "کالای حذف‌شده";


                return `

                    <div>

                        ${
                            t.type === "sale"
                                ? "فروش"
                                : "خرید"
                        }

                        -

                        ${escapeHtml(productName)}

                        -

                        ${Number(
                            t.quantity || 0
                        )}

                    </div>

                `;

            })

            .join("");
}


/* =========================
   SECURITY / HTML
========================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   STARTUP
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * اگر قبلاً app مخفی است،
         * کاری انجام نمی‌دهیم.
         */

        const loginBox =
            document.getElementById("login");

        const appBox =
            document.getElementById("app");


        if (loginBox && appBox) {

            appBox.style.display = "none";
            loginBox.style.display = "block";
        }

    }
);
