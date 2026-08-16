// ===============================
// اتصال به Supabase
// ===============================

const SUPABASE_URL = "https://xarblclsauoltgbeeyiw.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_jSGWrehYjhZjEq-O-2dzNw_0DzOWMTz";

const { createClient } = supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ===============================
// نام کاربری و رمز ورود سایت
// ===============================

const USERNAME = "amirali";
const PASSWORD = "sstttat";


// لیست کالاها
let products = [];


// ===============================
// پیام‌ها
// ===============================

function setMessage(id, text, success = false) {

    const element = document.getElementById(id);

    if (!element) return;

    element.textContent = text;

    element.style.color = success
        ? "green"
        : "red";
}


// ===============================
// تست اتصال دیتابیس
// ===============================

async function testDatabase() {

    const status =
        document.getElementById("dbStatus");

    try {

        const { error } = await db
            .from("products")
            .select("id")
            .limit(1);

        if (error) {
            throw error;
        }

        if (status) {

            status.textContent =
                "دیتابیس متصل است ✓";

            status.style.color =
                "green";
        }

        return true;

    } catch (error) {

        console.error(
            "Database Error:",
            error
        );

        if (status) {

            status.textContent =
                "خطا در اتصال به دیتابیس";

            status.style.color =
                "red";
        }

        return false;
    }
}


// ===============================
// ورود
// ===============================

async function login() {

    const username =
        document
            .getElementById("username")
            .value
            .trim();

    const password =
        document
            .getElementById("password")
            .value;


    if (
        username !== USERNAME ||
        password !== PASSWORD
    ) {

        setMessage(
            "error",
            "نام کاربری یا رمز عبور اشتباه است."
        );

        return;
    }


    document
        .getElementById("login")
        .style.display = "none";


    document
        .getElementById("app")
        .style.display = "block";


    const connected =
        await testDatabase();


    if (connected) {

        await loadProducts();
    }
}


// ===============================
// خروج
// ===============================

function logout() {

    document
        .getElementById("app")
        .style.display = "none";


    document
        .getElementById("login")
        .style.display = "block";
}


// ===============================
// تغییر صفحه
// ===============================

function show(section) {

    document
        .getElementById("products")
        .style.display =
        section === "products"
            ? "block"
            : "none";


    document
        .getElementById("sales")
        .style.display =
        section === "sales"
            ? "block"
            : "none";


    updateSaleProducts();
}


// ===============================
// دریافت کالاها از دیتابیس
// ===============================

async function loadProducts() {

    const { data, error } =
        await db
            .from("products")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(error);

        setMessage(
            "productMessage",
            "خطا در دریافت کالاها: " +
            error.message
        );

        return;
    }


    products = data || [];


    renderProducts();

    updateSaleProducts();
}


// ===============================
// ثبت کالا
// ===============================

async function addProduct() {

    const name =
        document
            .getElementById("name")
            .value
            .trim();


    const buy =
        Number(
            document
                .getElementById("buy")
                .value
        );


    const sell =
        Number(
            document
                .getElementById("sell")
                .value
        );


    const stock =
        Number(
            document
                .getElementById("stock")
                .value
        );


    // بررسی نام
    if (!name) {

        setMessage(
            "productMessage",
            "نام کالا را وارد کنید."
        );

        return;
    }


    // بررسی اعداد
    if (
        !Number.isFinite(buy) ||
        !Number.isFinite(sell) ||
        !Number.isFinite(stock)
    ) {

        setMessage(
            "productMessage",
            "قیمت‌ها و موجودی را درست وارد کنید."
        );

        return;
    }


    // جلوگیری از عدد منفی
    if (
        buy < 0 ||
        sell < 0 ||
        stock < 0
    ) {

        setMessage(
            "productMessage",
            "قیمت و موجودی نمی‌تواند منفی باشد."
        );

        return;
    }


    // ===========================
    // ذخیره در Supabase
    // ===========================

    const { data, error } =
        await db
            .from("products")
            .insert({

                name: name,

                buy_price: buy,

                sell_price: sell,

                stock: stock

            })
            .select()
            .single();


    // اگر خطا
    if (error) {

        console.error(
            "INSERT ERROR:",
            error
        );

        setMessage(
            "productMessage",
            "ثبت نشد: " +
            error.message
        );

        return;
    }


    // اضافه کردن کالا به لیست
    products.unshift(data);


    // خالی کردن فرم
    document
        .getElementById("name")
        .value = "";


    document
        .getElementById("buy")
        .value = "";


    document
        .getElementById("sell")
        .value = "";


    document
        .getElementById("stock")
        .value = "";


    // پیام موفقیت
    setMessage(
        "productMessage",
        "کالا با موفقیت در دیتابیس ثبت شد ✓",
        true
    );


    renderProducts();

    updateSaleProducts();
}


// ===============================
// نمایش کالاها
// ===============================

function renderProducts() {

    const list =
        document.getElementById(
            "productList"
        );


    if (!products.length) {

        list.innerHTML =
            "<p>هنوز کالایی ثبت نشده است.</p>";

        return;
    }


    list.innerHTML =
        products
            .map(product => {

                return `

                <div class="product-card">

                    <strong>
                        ${escapeHtml(product.name)}
                    </strong>

                    <br>

                    قیمت خرید:
                    ${Number(
                        product.buy_price
                    ).toLocaleString()}
                    تومان

                    <br>

                    قیمت فروش:
                    ${Number(
                        product.sell_price
                    ).toLocaleString()}
                    تومان

                    <br>

                    موجودی:
                    ${Number(
                        product.stock
                    ).toLocaleString()}

                    <br><br>

                    <button
                        onclick="changeStock('${product.id}', 1)"
                    >
                        + موجودی
                    </button>

                    <button
                        onclick="changeStock('${product.id}', -1)"
                    >
                        - موجودی
                    </button>

                    <button
                        onclick="deleteProduct('${product.id}')"
                    >
                        حذف
                    </button>

                </div>

                `;

            })
            .join("");
}


// ===============================
// تغییر موجودی
// ===============================

async function changeStock(
    id,
    amount
) {

    const product =
        products.find(
            p => String(p.id) === String(id)
        );


    if (!product) return;


    const newStock =
        Number(product.stock) +
        amount;


    if (newStock < 0) {

        alert(
            "موجودی کافی نیست."
        );

        return;
    }


    const { data, error } =
        await db
            .from("products")
            .update({

                stock: newStock

            })
            .eq("id", id)
            .select()
            .single();


    if (error) {

        alert(
            "ذخیره موجودی انجام نشد: " +
            error.message
        );

        return;
    }


    const index =
        products.findIndex(
            p => String(p.id) === String(id)
        );


    products[index] = data;


    renderProducts();

    updateSaleProducts();
}


// ===============================
// حذف کالا
// ===============================

async function deleteProduct(id) {

    if (
        !confirm(
            "این کالا حذف شود؟"
        )
    ) {

        return;
    }


    const { error } =
        await db
            .from("products")
            .delete()
            .eq("id", id);


    if (error) {

        alert(
            "حذف انجام نشد: " +
            error.message
        );

        return;
    }


    products =
        products.filter(
            p => String(p.id) !== String(id)
        );


    renderProducts();

    updateSaleProducts();
}


// ===============================
// کالاهای بخش فروش
// ===============================

function updateSaleProducts() {

    const select =
        document.getElementById(
            "saleProduct"
        );


    if (!select) return;


    if (!products.length) {

        select.innerHTML =
            "<option value=''>ابتدا کالا ثبت کنید</option>";

        return;
    }


    select.innerHTML =
        products
            .map(product => {

                return `

                <option value="${product.id}">

                    ${escapeHtml(product.name)}

                    -
                    موجودی:
                    ${product.stock}

                </option>

                `;

            })
            .join("");
}


// ===============================
// ثبت فروش
// ===============================

async function addSale() {

    const id =
        document
            .getElementById("saleProduct")
            .value;


    const qty =
        Number(
            document
                .getElementById("saleQty")
                .value
        );


    const product =
        products.find(
            p => String(p.id) === String(id)
        );


    if (!product) {

        setMessage(
            "saleMessage",
            "کالا انتخاب نشده است."
        );

        return;
    }


    if (
        !Number.isInteger(qty) ||
        qty <= 0
    ) {

        setMessage(
            "saleMessage",
            "تعداد صحیح وارد کنید."
        );

        return;
    }


    if (
        Number(product.stock) < qty
    ) {

        setMessage(
            "saleMessage",
            "موجودی کافی نیست."
        );

        return;
    }


    const newStock =
        Number(product.stock) -
        qty;


    // کم کردن موجودی
    const { error: stockError } =
        await db
            .from("products")
            .update({

                stock: newStock

            })
            .eq("id", id);


    if (stockError) {

        setMessage(
            "saleMessage",
            "ثبت فروش نشد: " +
            stockError.message
        );

        return;
    }


    // ثبت تاریخچه فروش
    const { error: saleError } =
        await db
            .from("transactions")
            .insert({

                product_id: id,

                type: "sale",

                quantity: qty,

                unit_price:
                    Number(
                        product.sell_price
                    ),

                total_price:
                    Number(
                        product.sell_price
                    ) * qty

            });


    if (saleError) {

        setMessage(
            "saleMessage",
            "موجودی کم شد ولی تاریخچه فروش ثبت نشد: " +
            saleError.message
        );

        await loadProducts();

        return;
    }


    setMessage(
        "saleMessage",
        "فروش با موفقیت ثبت شد ✓",
        true
    );


    await loadProducts();
}


// ===============================
// جلوگیری از خراب شدن HTML
// ===============================

function escapeHtml(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}
