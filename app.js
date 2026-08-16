```javascript
const SUPABASE_URL = "https://xarblclsauoltgbeeyiw.supabase.co";
const SUPABASE_KEY = "sb_publishable_jSGWrehYjhZjEq-O-2dzNw_0DzOWMTz";

const USERNAME = "amirali";
const PASSWORD = "sstttat";

let products = [];
let transactions = [];


/* =========================
   SUPABASE REQUEST
========================= */

function supabaseHeaders(extra = {}) {
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        ...extra
    };
}


/* =========================
   LOAD PRODUCTS
========================= */

async function loadData() {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/products?select=*&order=id.desc`,
            {
                method: "GET",
                headers: supabaseHeaders()
            }
        );

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "خطا در دریافت کالاها");
        }

        products = await response.json();

        renderProducts();
        updateSaleProducts();
        updatePurchaseProducts();
        updateDashboard();

    } catch (error) {
        console.error("loadData:", error);
        alert("خطا در دریافت کالاها:\n" + error.message);
    }
}


/* =========================
   LOAD TRANSACTIONS
========================= */

async function loadTransactions() {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/transactions?select=*&order=created_at.desc`,
            {
                method: "GET",
                headers: supabaseHeaders()
            }
        );

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "خطا در دریافت معاملات");
        }

        transactions = await response.json();

        renderHistory();
        updateDashboard();

    } catch (error) {
        console.error("loadTransactions:", error);
        alert("خطا در دریافت تاریخچه:\n" + error.message);
    }
}


/* =========================
   LOGIN
========================= */

function login() {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorElement = document.getElementById("error");

    const username = usernameInput
        ? usernameInput.value.trim()
        : "";

    const password = passwordInput
        ? passwordInput.value
        : "";

    if (username === USERNAME && password === PASSWORD) {

        document.getElementById("login").style.display = "none";
        document.getElementById("app").style.display = "block";

        if (errorElement) {
            errorElement.textContent = "";
        }

        loadData();
        loadTransactions();

    } else {

        if (errorElement) {
            errorElement.textContent =
                "نام کاربری یا رمز عبور اشتباه است.";
        }
    }
}


/* =========================
   LOGOUT
========================= */

function logout() {
    document.getElementById("app").style.display = "none";
    document.getElementById("login").style.display = "block";

    const passwordInput =
        document.getElementById("password");

    if (passwordInput) {
        passwordInput.value = "";
    }
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

        const element = document.getElementById(id);

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
   ADD PRODUCT
========================= */

async function addProduct() {

    const nameElement = document.getElementById("name");
    const buyElement = document.getElementById("buy");
    const sellElement = document.getElementById("sell");
    const stockElement = document.getElementById("stock");

    const name = nameElement
        ? nameElement.value.trim()
        : "";

    const buy = buyElement
        ? Number(buyElement.value)
        : 0;

    const sell = sellElement
        ? Number(sellElement.value)
        : 0;

    const stock = stockElement
        ? Number(stockElement.value)
        : 0;


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

                headers: supabaseHeaders({
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                }),

                body: JSON.stringify({
                    name: name,
                    buy_price: buy,
                    sell_price: sell,
                    stock: stock
                })
            }
        );


        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "ثبت کالا ناموفق بود.");
        }


        if (nameElement) nameElement.value = "";
        if (buyElement) buyElement.value = "";
        if (sellElement) sellElement.value = "";
        if (stockElement) stockElement.value = "";


        alert("کالا با موفقیت ثبت شد.");

        await loadData();

    } catch (error) {

        console.error("addProduct:", error);

        alert(
            "ثبت کالا انجام نشد:\n" +
            error.message
        );
    }
}


/* =========================
   RENDER PRODUCTS
========================= */

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

    const product = products.find(
        p => Number(p.id) === Number(id)
    );

    if (!product) {
        alert("کالا پیدا نشد.");
        return;
    }


    const newStock =
        Number(product.stock || 0) + Number(amount);


    if (newStock < 0) {
        alert("موجودی کافی نیست.");
        return;
    }


    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`,
            {
                method: "PATCH",

                headers: supabaseHeaders({
                    "Content-Type": "application/json"
                }),

                body: JSON.stringify({
                    stock: newStock
                })
            }
        );


        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "تغییر موجودی ناموفق بود.");
        }


        await loadData();

    } catch (error) {

        console.error("changeStock:", error);

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

                headers: supabaseHeaders()
            }
        );


        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "حذف کالا ناموفق بود.");
        }


        await loadData();
        await loadTransactions();

    } catch (error) {

        console.error("deleteProduct:", error);

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
            `<option value="">ابتدا کالا ثبت کنید</option>`;

        return;
    }


    select.innerHTML =
        products.map(product => `

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
            `<option value="">ابتدا کالا ثبت کنید</option>`;

        return;
    }


    select.innerHTML =
        products.map(product => `

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

    const productElement =
        document.getElementById("saleProduct");

    const qtyElement =
        document.getElementById("saleQty");


    const id = productElement
        ? Number(productElement.value)
        : NaN;

    const qty = qtyElement
        ? Number(qtyElement.value)
        : NaN;


    const product = products.find(
        p => Number(p.id) === id
    );


    if (!product) {
        alert("کالا انتخاب نشده است.");
        return;
    }


    if (!Number.isInteger(qty) || qty <= 0) {
        alert("تعداد صحیح وارد کنید.");
        return;
    }


    const currentStock =
        Number(product.stock || 0);


    if (currentStock < qty) {
        alert("موجودی کافی نیست.");
        return;
    }


    try {

        const newStock =
            currentStock - qty;


        /*
         * کم کردن موجودی
         */

        const updateResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`,
            {
                method: "PATCH",

                headers: supabaseHeaders({
                    "Content-Type": "application/json"
                }),

                body: JSON.stringify({
                    stock: newStock
                })
            }
        );


        if (!updateResponse.ok) {

            const text =
                await updateResponse.text();

            throw new Error(
                text || "تغییر موجودی ناموفق بود."
            );
        }


        const unitPrice =
            Number(product.sell_price || 0);

        const totalPrice =
            unitPrice * qty;


        /*
         * ثبت معامله فروش
         *
         * ستون‌های واقعی:
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

                    headers: supabaseHeaders({
                        "Content-Type": "application/json",
                        "Prefer": "return=representation"
                    }),

                    body: JSON.stringify({
                        product_id: product.id,
                        type: "sale",
                        quantity: qty,
                        unit_price: unitPrice,
                        total_price: totalPrice
                    })
                }
            );


        if (!transactionResponse.ok) {

            const errorText =
                await transactionResponse.text();


            /*
             * برگرداندن موجودی
             * اگر ثبت معامله شکست خورد
             */

            await fetch(
                `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`,
                {
                    method: "PATCH",

                    headers: supabaseHeaders({
                        "Content-Type": "application/json"
                    }),

                    body: JSON.stringify({
                        stock: currentStock
                    })
                }
            );


            throw new Error(
                errorText || "ثبت فروش ناموفق بود."
            );
        }


        const message =
            document.getElementById("saleMessage");

        if (message) {
            message.textContent =
                "فروش با موفقیت ثبت شد.";
        }


        if (qtyElement) {
            qtyElement.value = "1";
        }


        await loadData();
        await loadTransactions();


    } catch (error) {

        console.error("addSale:", error);

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

    const productElement =
        document.getElementById("purchaseProduct");

    const qtyElement =
        document.getElementById("purchaseQty");


    const id = productElement
        ? Number(productElement.value)
        : NaN;

    const qty = qtyElement
        ? Number(qtyElement.value)
        : NaN;


    const product = products.find(
        p => Number(p.id) === id
    );


    if (!product) {
        alert("کالا انتخاب نشده است.");
        return;
    }


    if (!Number.isInteger(qty) || qty <= 0) {
        alert("تعداد صحیح وارد کنید.");
        return;
    }


    const currentStock =
        Number(product.stock || 0);


    try {

        const newStock =
            currentStock + qty;


        /*
         * افزایش موجودی
         */

        const updateResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`,
            {
                method: "PATCH",

                headers: supabaseHeaders({
                    "Content-Type": "application/json"
                }),

                body: JSON.stringify({
                    stock: newStock
                })
            }
        );


        if (!updateResponse.ok) {

            const text =
                await updateResponse.text();

            throw new Error(
                text || "تغییر موجودی ناموفق بود."
            );
        }


        const unitPrice =
            Number(product.buy_price || 0);

        const totalPrice =
            unitPrice * qty;


        /*
         * ثبت معامله خرید
         */

        const transactionResponse =
            await fetch(
                `${SUPABASE_URL}/rest/v1/transactions`,
                {
                    method: "POST",

                    headers: supabaseHeaders({
                        "Content-Type": "application/json",
                        "Prefer": "return=representation"
                    }),

                    body: JSON.stringify({
                        product_id: product.id,
                        type: "purchase",
                        quantity: qty,
                        unit_price: unitPrice,
                        total_price: totalPrice
                    })
                }
            );


        if (!transactionResponse.ok) {

            const errorText =
                await transactionResponse.text();


            /*
             * برگرداندن موجودی
             * اگر ثبت معامله شکست خورد
             */

            await fetch(
                `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`,
                {
                    method: "PATCH",

                    headers: supabaseHeaders({
                        "Content-Type": "application/json"
                    }),

                    body: JSON.stringify({
                        stock: currentStock
                    })
                }
            );


            throw new Error(
                errorText || "ثبت خرید ناموفق بود."
            );
        }


        const message =
            document.getElementById("purchaseMessage");

        if (message) {
            message.textContent =
                "خرید با موفقیت ثبت شد.";
        }


        if (qtyElement) {
            qtyElement.value = "1";
        }


        await loadData();
        await loadTransactions();


    } catch (error) {

        console.error("addPurchase:", error);

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
        transactions.map(transaction => {

            const product =
                products.find(
                    p =>
                        Number(p.id) ===
                        Number(transaction.product_id)
                );


            const productName =
                product
                    ? product.name
                    : "کالای حذف‌شده";


            const typeText =
                transaction.type === "sale"
                    ? "فروش"
                    : "خرید";


            const quantity =
                Number(
                    transaction.quantity || 0
                );


            const total =
                Number(
                    transaction.total_price || 0
                );


            let dateText = "-";


            if (transaction.created_at) {

                const date =
                    new Date(
                        transaction.created_at
                    );

                if (!Number.isNaN(date.getTime())) {

                    dateText =
                        date.toLocaleString("fa-IR");
                }
            }


            return `

                <div style="
                    background:white;
                    padding:12px;
                    margin:8px 0;
                    border:1px solid #ddd;
                    border-radius:8px;
                ">

                    <strong>
                        ${typeText}
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
                    ${dateText}

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

        const stockValue =
            products.reduce(
                (sum, product) => {

                    return sum +
                        Number(
                            product.buy_price || 0
                        ) *
                        Number(
                            product.stock || 0
                        );

                },
                0
            );


        stockValueElement.textContent =
            stockValue.toLocaleString();
    }


    if (salesElement) {

        const today =
            new Date();

        const todayYear =
            today.getFullYear();

        const todayMonth =
            today.getMonth();

        const todayDate =
            today.getDate();


        const todaySales =
            transactions
                .filter(transaction => {

                    if (
                        transaction.type !==
                        "sale"
                    ) {
                        return false;
                    }


                    if (!transaction.created_at) {
                        return false;
                    }


                    const date =
                        new Date(
                            transaction.created_at
                        );


                    return (
                        date.getFullYear() ===
                        todayYear &&

                        date.getMonth() ===
                        todayMonth &&

                        date.getDate() ===
                        todayDate
                    );

                })
                .reduce(
                    (sum, transaction) => {

                        return sum +
                            Number(
                                transaction.total_price || 0
                            );

                    },
                    0
                );


        salesElement.textContent =
            todaySales.toLocaleString();
    }


    const recent =
        document.getElementById(
            "recentTransactions"
        );


    if (!recent) return;


    if (!transactions.length) {

        recent.innerHTML =
            "هنوز معامله‌ای ثبت نشده است.";

        return;
    }


    recent.innerHTML =
        transactions
            .slice(0, 5)
            .map(transaction => {

                const product =
                    products.find(
                        p =>
                            Number(p.id) ===
                            Number(transaction.product_id)
                    );


                const productName =
                    product
                        ? product.name
                        : "کالای حذف‌شده";


                const typeText =
                    transaction.type === "sale"
                        ? "فروش"
                        : "خرید";


                return `

                    <div style="
                        margin:6px 0;
                    ">

                        ${typeText}

                        -

                        ${escapeHtml(productName)}

                        -

                        تعداد:

                        ${Number(
                            transaction.quantity || 0
                        )}

                    </div>

                `;

            })
            .join("");
}


/* =========================
   ESCAPE HTML
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
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const loginBox =
            document.getElementById("login");

        const appBox =
            document.getElementById("app");


        if (loginBox) {
            loginBox.style.display = "block";
        }


        if (appBox) {
            appBox.style.display = "none";
        }


        /*
         * اجازه ورود با Enter
         */

        const passwordInput =
            document.getElementById("password");


        if (passwordInput) {

            passwordInput.addEventListener(
                "keydown",
                function (event) {

                    if (event.key === "Enter") {
                        login();
                    }

                }
            );
        }


        const usernameInput =
            document.getElementById("username");


        if (usernameInput) {

            usernameInput.addEventListener(
                "keydown",
                function (event) {

                    if (event.key === "Enter") {
                        login();
                    }

                }
            );
        }

    }
);
```
