const SUPABASE_URL = "https://xarblclsauoltgbeeyiw.supabase.co";
const SUPABASE_KEY = "sb_publishable_jSGWrehYjhZjEq-O-2dzNw_0DzOWMTz";

const USERNAME = "amirali";
const PASSWORD = "sstttat";

let products = [];
let transactions = [];


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
        alert("خطا در اتصال به دیتابیس");
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
    }
}


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

    if (buy < 0 || sell < 0 || stock < 0) {
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

        alert("ثبت کالا انجام نشد:\n" + error.message);

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
                ${product.name}
            </strong>

            <br>

            قیمت خرید:
            ${Number(product.buy_price).toLocaleString()}
            تومان

            <br>

            قیمت فروش:
            ${Number(product.sell_price).toLocaleString()}
            تومان

            <br>

            موجودی:
            ${product.stock}

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


async function changeStock(id, amount) {

    const product =
        products.find(p => p.id === id);

    if (!product) return;


    const newStock =
        Number(product.stock) + amount;


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

        alert("تغییر موجودی انجام نشد.");

    }
}


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

        alert("حذف کالا انجام نشد.");

    }
}


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
            ${product.name} - موجودی: ${product.stock}
        </option>

    `).join("");
}


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
            ${product.name} - موجودی: ${product.stock}
        </option>

    `).join("");
}


async function addSale() {

    const id =
        Number(document.getElementById("saleProduct").value);

    const qty =
        Number(document.getElementById("saleQty").value);


    const product =
        products.find(p => p.id === id);


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


    try {

        const newStock =
            product.stock - qty;


        const updateResponse = await fetch(
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
            throw new Error(await updateResponse.text());
        }


        const total =
            Number(product.sell_price) * qty;


        const transactionResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/transactions`,
            {
                method: "POST",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    type: "sale",

                    product_id: product.id,

                    product_name: product.name,

                    qty: qty,

                    unit_price: product.sell_price,

                    total: total

                })
            }
        );


        if (!transactionResponse.ok) {
            throw new Error(await transactionResponse.text());
        }


        document.getElementById("saleMessage").textContent =
            "فروش با موفقیت ثبت شد.";


        await loadData();
        await loadTransactions();


    } catch (error) {

        console.error(error);

        alert("ثبت فروش انجام نشد:\n" + error.message);

    }
}


async function addPurchase() {

    const id =
        Number(document.getElementById("purchaseProduct").value);

    const qty =
        Number(document.getElementById("purchaseQty").value);


    const product =
        products.find(p => p.id === id);


    if (!product) {

        alert("کالا انتخاب نشده است.");

        return;
    }


    if (qty <= 0) {

        alert("تعداد صحیح وارد کنید.");

        return;
    }


    try {

        const newStock =
            Number(product.stock) + qty;


        const updateResponse = await fetch(
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
            throw new Error(await updateResponse.text());
        }


        const total =
            Number(product.buy_price) * qty;


        const transactionResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/transactions`,
            {
                method: "POST",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    type: "purchase",

                    product_id: product.id,

                    product_name: product.name,

                    qty: qty,

                    unit_price: product.buy_price,

                    total: total

                })
            }
        );


        if (!transactionResponse.ok) {
            throw new Error(await transactionResponse.text());
        }


        document.getElementById("purchaseMessage").textContent =
            "خرید با موفقیت ثبت شد.";


        await loadData();
        await loadTransactions();


    } catch (error) {

        console.error(error);

        alert("ثبت خرید انجام نشد:\n" + error.message);

    }
}


function renderHistory() {

    const list =
        document.getElementById("historyList");

    if (!list) return;


    if (!transactions.length) {

        list.innerHTML =
            "<p>هنوز معامله‌ای ثبت نشده است.</p>";

        return;
    }


    list.innerHTML = transactions.map(t => `

        <div style="
            background:white;
            padding:12px;
            margin:8px 0;
            border:1px solid #ddd;
            border-radius:8px;
        ">

            <strong>
                ${t.type === "sale" ? "فروش" : "خرید"}
            </strong>

            <br>

            کالا:
            ${t.product_name}

            <br>

            تعداد:
            ${t.qty}

            <br>

            مبلغ:
            ${Number(t.total).toLocaleString()}
            تومان

            <br>

            تاریخ:
            ${new Date(t.created_at).toLocaleString("fa-IR")}

        </div>

    `).join("");
}


function updateDashboard() {

    const productsElement =
        document.getElementById("dashboardProducts");

    const stockValueElement =
        document.getElementById("dashboardStockValue");

    const salesElement =
        document.getElementById("dashboardSales");


    if (productsElement) {

        productsElement.textContent =
            products.length;

    }


    if (stockValueElement) {

        const value =
            products.reduce(
                (sum, p) =>
                    sum +
                    Number(p.buy_price || 0) *
                    Number(p.stock || 0),
                0
            );

        stockValueElement.textContent =
            value.toLocaleString();

    }


    if (salesElement) {

        const value =
            transactions
                .filter(t => t.type === "sale")
                .reduce(
                    (sum, t) =>
                        sum + Number(t.total || 0),
                    0
                );

        salesElement.textContent =
            value.toLocaleString();

    }


    const recent =
        document.getElementById("recentTransactions");

    if (!recent) return;


    if (!transactions.length) {

        recent.textContent =
            "هنوز معامله‌ای ثبت نشده است.";

        return;
    }


    recent.innerHTML =
        transactions
            .slice(0, 5)
            .map(t => `
                <div>
                    ${t.type === "sale" ? "فروش" : "خرید"}
                    -
                    ${t.product_name}
                    -
                    ${t.qty}
                </div>
            `)
            .join("");
}
