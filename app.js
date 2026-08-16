const USERS={amirali:"sstttat"};
const KEY="shop_inventory_v1";
let currentUser=sessionStorage.getItem("shop_user");
let data=JSON.parse(localStorage.getItem(KEY)||'{"products":[],"sales":[]}');

const fa=n=>Number(n||0).toLocaleString("fa-IR");
const save=()=>{localStorage.setItem(KEY,JSON.stringify(data));renderAll()};
const today=()=>new Date().toLocaleDateString("fa-IR");
function login(){
  const u=document.getElementById("username").value.trim(), p=document.getElementById("password").value;
  if(USERS[u]===p){currentUser=u;sessionStorage.setItem("shop_user",u);showApp()}
  else document.getElementById("loginMsg").textContent="نام کاربری یا رمز عبور اشتباه است.";
}
function logout(){sessionStorage.removeItem("shop_user");currentUser=null;document.getElementById("app").classList.add("hidden");document.getElementById("login").classList.remove("hidden")}
function showApp(){
 document.getElementById("login").classList.add("hidden");document.getElementById("app").classList.remove("hidden");
 document.getElementById("welcome").textContent=`کاربر: ${currentUser}`;
 renderAll();
}
function addProduct(){
 const name=pName.value.trim(), buy=+pBuy.value, sell=+pSell.value, stock=+pStock.value;
 if(!name||buy<0||sell<0||stock<0)return alert("اطلاعات کالا را کامل وارد کنید.");
 data.products.push({id:Date.now(),name,buy,sell,stock});
 pName.value=pBuy.value=pSell.value=pStock.value="";save();
}
function delProduct(id){
 if(!confirm("این کالا حذف شود؟"))return;
 data.products=data.products.filter(p=>p.id!==id);save();
}
function changeStock(id,delta){
 const p=data.products.find(x=>x.id===id); if(!p)return;
 if(p.stock+delta<0)return alert("موجودی کافی نیست.");
 p.stock+=delta;save();
}
function addSale(){
 const id=+saleProduct.value, qty=+saleQty.value, p=data.products.find(x=>x.id===id);
 if(!p||qty<1)return;
 if(p.stock<qty)return saleMsg.textContent="موجودی کافی نیست.";
 p.stock-=qty;
 data.sales.unshift({id:Date.now(),productId:p.id,name:p.name,qty,total:p.sell*qty,profit:(p.sell-p.buy)*qty,date:today(),user:currentUser});
 saleQty.value=1;saleMsg.textContent="فروش با موفقیت ثبت شد.";save();
}
function renderProducts(){
 const q=(search.value||"").trim().toLowerCase();
 const arr=data.products.filter(p=>p.name.toLowerCase().includes(q));
 productsTable.innerHTML=arr.length?`<div class="table-wrap"><table><thead><tr><th>کالا</th><th>خرید</th><th>فروش</th><th>موجودی</th><th>عملیات</th></tr></thead><tbody>
 ${arr.map(p=>`<tr><td>${esc(p.name)}</td><td>${fa(p.buy)}</td><td>${fa(p.sell)}</td><td class="${p.stock<5?'low':''}">${fa(p.stock)}</td>
 <td class="actions"><button onclick="changeStock(${p.id},1)">+۱</button><button onclick="changeStock(${p.id},-1)">−۱</button><button onclick="delProduct(${p.id})">حذف</button></td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">هنوز کالایی ثبت نشده است.</div>`;
}
function renderSales(){
 salesTable.innerHTML=data.sales.length?`<div class="table-wrap"><table><thead><tr><th>تاریخ</th><th>کالا</th><th>تعداد</th><th>مبلغ فروش</th><th>سود</th><th>کاربر</th></tr></thead><tbody>
 ${data.sales.map(s=>`<tr><td>${s.date}</td><td>${esc(s.name)}</td><td>${fa(s.qty)}</td><td>${fa(s.total)}</td><td>${fa(s.profit)}</td><td>${esc(s.user)}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">هنوز فروشی ثبت نشده است.</div>`;
}
function renderDashboard(){
 statProducts.textContent=fa(data.products.length);
 statInventory.textContent=fa(data.products.reduce((a,p)=>a+p.buy*p.stock,0));
 const ds=data.sales.filter(s=>s.date===today());
 statSales.textContent=fa(ds.reduce((a,s)=>a+s.total,0));
 statProfit.textContent=fa(data.sales.reduce((a,s)=>a+s.profit,0));
 recentSales.innerHTML=data.sales.slice(0,5).length?data.sales.slice(0,5).map(s=>`<p><b>${esc(s.name)}</b> × ${fa(s.qty)} — ${fa(s.total)} تومان</p>`).join(""):`<div class="empty">هنوز فروشی ثبت نشده است.</div>`;
}
function renderSaleSelect(){
 saleProduct.innerHTML=data.products.length?data.products.map(p=>`<option value="${p.id}">${esc(p.name)} — موجودی ${fa(p.stock)}</option>`).join(""):`<option>ابتدا کالا ثبت کنید</option>`;
}
function renderAll(){renderProducts();renderSales();renderDashboard();renderSaleSelect()}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{
 document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");
 document.querySelectorAll(".panel").forEach(x=>x.classList.add("hidden"));document.getElementById(b.dataset.tab).classList.remove("hidden");
});
if(currentUser)showApp();
