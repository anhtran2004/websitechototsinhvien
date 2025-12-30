// Dùng cho admin.html (Quản trị Chợ thuê SV)

// --- Khởi tạo DEMO dữ liệu nếu chưa có ---
if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify([
        { name: "Laptop", owner: "Nguyễn A", price: 5000000, status: "Đang cho thuê", imageUrl: "" },
        { name: "Balo", owner: "Trần B", price: 20000, status: "Sẵn sàng", imageUrl: "" },
        { name: "Máy ảnh Mini", owner: "Phạm C", price: 60000, status: "Sẵn sàng", imageUrl: "" }
    ]));
}
if (!localStorage.getItem('orders')) {
    localStorage.setItem('orders', JSON.stringify([
        { id: 101, user: "user1", product: "Laptop", date: "2025-12-01", status: "Chờ duyệt" },
        { id: 102, user: "user2", product: "Balo", date: "2025-12-03", status: "Đã duyệt" }
    ]));
}
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([
        { username: "admin", role: "admin", locked: false },
        { username: "user1", role: "user", locked: false },
        { username: "user2", role: "user", locked: false }
    ]));
}
if (!localStorage.getItem('reviews')) {
    localStorage.setItem('reviews', JSON.stringify([
        { id: 1, product: "Laptop", user: "user1", text: "Rất tốt!", star: 5 },
        { id: 2, product: "Balo", user: "user2", text: "Ổn.", star: 4 }
    ]));
}
if (!localStorage.getItem('revenue')) {
    localStorage.setItem('revenue', JSON.stringify([
        { month: "11/2025", total: 6000000 },
        { month: "12/2025", total: 12500000 }
    ]));
}

// --- Sidebar chuyển tab ---
function showPanel(index) {
    document.querySelectorAll('.panel').forEach((p, i) => p.classList.toggle('active', i == index));
    document.querySelectorAll('.menu-list li').forEach((li, i) => li.classList.toggle('active', i == index));
}
window.showPanel = showPanel;

// --- Dashboard ---
function dashboardUpdate() {
    document.getElementById('prodCount').innerText = getProducts().length;
    document.getElementById('orderCount').innerText = getOrders().length;
    document.getElementById('userCount').innerText = getUsers().length;
    let revenue = getRevenue().reduce((a, b) => a + b.total, 0);
    document.getElementById('revenueSum').innerText = revenue.toLocaleString();
    document.getElementById('hotProd').innerText = getProducts()[0] ?.name || "N/A";
    document.getElementById('orderMonth').innerText = getOrders().filter(x =>
        x.date && x.date.startsWith('2025-12')).length;
}

// --- Sản phẩm (update cho ảnh) ---
function getProducts() { return JSON.parse(localStorage.getItem('products') || '[]'); }
function setProducts(arr) { localStorage.setItem('products', JSON.stringify(arr)); }
function renderProducts() {
    let arr = getProducts();
    document.getElementById('prodList').innerHTML = arr.map((p, i) => `
    <tr>
        <td>${p.imageUrl ? `<img class="thumb" src="${p.imageUrl}" alt="${escapeHtml(p.name)}">` :
            `<div style="width:96px;height:72px;background:#f1f5f8;border-radius:6px;display:flex;align-items:center;justify-content:center;">No</div>`}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(p.owner)}</td>
        <td>${p.price || ""}</td>
        <td>${escapeHtml(p.status || "Sẵn sàng")}</td>
        <td><button class="btn btn-edit" onclick="editProduct(${i})">Sửa</button></td>
        <td><button class="btn btn-danger" onclick="delProduct(${i})">Xóa</button></td>
    </tr>
    `).join('');
}
window.renderProducts = renderProducts;

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

// Xử lý preview file khi chọn file upload
const prodImageInput = document.getElementById('prodImage');
const prodPreview = document.getElementById('prodPreview');
prodImageInput.addEventListener('change', () => {
    const f = prodImageInput.files && prodImageInput.files[0];
    if (!f) {
        prodPreview.style.display = 'none';
        prodPreview.src = '';
        return;
    }
    const url = URL.createObjectURL(f);
    prodPreview.src = url;
    prodPreview.style.display = 'inline-block';
});

async function addProduct() {
    let name = document.getElementById('prodName').value.trim();
    let owner = document.getElementById('prodOwner').value.trim();
    let price = document.getElementById('prodPrice').value.trim();
    if (!name || !owner || !price)
        return alert("Đầy đủ thông tin!");
    const file = prodImageInput.files && prodImageInput.files[0];

    const pushProduct = (imageDataUrl) => {
        let arr = getProducts();
        arr.unshift({ name, owner, price, status: "Sẵn sàng", imageUrl: imageDataUrl || "" });
        setProducts(arr); renderProducts(); dashboardUpdate();
        document.getElementById('prodName').value = '';
        document.getElementById('prodOwner').value = '';
        document.getElementById('prodPrice').value = '';
        prodImageInput.value = '';
        prodPreview.src = ''; prodPreview.style.display = 'none';
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const dataUrl = e.target.result;
            pushProduct(dataUrl);
        };
        reader.onerror = function () { alert('Không đọc được ảnh'); pushProduct(''); };
        reader.readAsDataURL(file);
    } else {
        pushProduct('');
    }
}
document.getElementById('btnAddProduct').onclick = addProduct;

function delProduct(idx) {
    if (!confirm("Xóa sản phẩm này?")) return;
    let arr = getProducts();
    arr.splice(idx, 1); setProducts(arr); renderProducts(); dashboardUpdate();
}
window.delProduct = delProduct;

function editProduct(idx) {
    let arr = getProducts(), p = arr[idx];
    let name = prompt("Tên:", p.name) || p.name;
    let owner = prompt("Chủ:", p.owner) || p.owner;
    let price = prompt("Giá:", p.price) || p.price;
    let status = prompt("Trạng thái (Sẵn sàng/Đang cho thuê):", p.status) || p.status;
    if (confirm('Bạn có muốn thay ảnh sản phẩm này không?')) {
        const tmpInput = document.createElement('input');
        tmpInput.type = 'file';
        tmpInput.accept = 'image/*';
        tmpInput.onchange = function () {
            const file = tmpInput.files && tmpInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const dataUrl = e.target.result;
                    arr[idx] = { name, owner, price, status, imageUrl: dataUrl };
                    setProducts(arr); renderProducts(); dashboardUpdate();
                };
                reader.readAsDataURL(file);
            } else {
                arr[idx] = { name, owner, price, status, imageUrl: p.imageUrl || "" };
                setProducts(arr); renderProducts(); dashboardUpdate();
            }
        };
        tmpInput.style.display = 'none';
        document.body.appendChild(tmpInput);
        tmpInput.click();
        setTimeout(() => document.body.removeChild(tmpInput), 5000);
    } else {
        arr[idx] = { name, owner, price, status, imageUrl: p.imageUrl || "" };
        setProducts(arr); renderProducts(); dashboardUpdate();
    }
}
window.editProduct = editProduct;

// --- Đơn thuê ---
function getOrders() { return JSON.parse(localStorage.getItem('orders') || '[]'); }
function setOrders(arr) { localStorage.setItem('orders', JSON.stringify(arr)); }
function renderOrders() {
    let arr = getOrders();
    document.getElementById('orderList').innerHTML = arr.map((o, i) => `
    <tr>
        <td>${o.id || i + 1}</td><td>${escapeHtml(o.user)}</td><td>${escapeHtml(o.product)}</td>
        <td>${o.date || ""}</td>
        <td>${escapeHtml(o.status || "Chờ duyệt")}</td>
        <td>
            ${o.status === "Đã duyệt" ? '' : `<button class="btn" onclick="approveOrder(${i})">Duyệt</button>`}
        </td>
        <td><button class="btn btn-danger" onclick="delOrder(${i})">Xóa</button></td>
    </tr>
    `).join('');
}
window.renderOrders = renderOrders;

function approveOrder(idx) {
    let arr = getOrders(); arr[idx].status = "Đã duyệt";
    setOrders(arr); renderOrders();
}
window.approveOrder = approveOrder;
function delOrder(idx) {
    if (!confirm("Xóa đơn hàng?")) return;
    let arr = getOrders(); arr.splice(idx, 1);
    setOrders(arr); renderOrders(); dashboardUpdate();
}
window.delOrder = delOrder;

// --- Người dùng ---
function getUsers() { return JSON.parse(localStorage.getItem('users') || '[]'); }
function setUsers(arr) { localStorage.setItem('users', JSON.stringify(arr)); }
function renderUsers() {
    let arr = getUsers();
    document.getElementById('userList').innerHTML = arr.map((u, i) => `
    <tr>
        <td>${escapeHtml(u.username)}</td><td>${escapeHtml(u.role)}</td>
        <td>
            ${u.locked ? '<span style="color:red;">Đã khóa</span>' :
            `<button class="btn btn-danger" onclick="lockUser(${i})">Khóa</button>`}
        </td>
    </tr>
    `).join('');
}
window.renderUsers = renderUsers;

function lockUser(idx) {
    if (!confirm("Khóa tài khoản này?")) return;
    let arr = getUsers(); arr[idx].locked = true; setUsers(arr); renderUsers();
}
window.lockUser = lockUser;

// --- Đánh giá ---
function getReviews() { return JSON.parse(localStorage.getItem('reviews') || '[]'); }
function setReviews(arr) { localStorage.setItem('reviews', JSON.stringify(arr)); }
function renderReviews() {
    let arr = getReviews();
    document.getElementById('reviewList').innerHTML = arr.map((r, i) => `
    <tr>
        <td>${r.id}</td>
        <td>${escapeHtml(r.product)}</td>
        <td>${escapeHtml(r.user)}</td>
        <td>${escapeHtml(r.text)}</td>
        <td>${'★'.repeat(r.star).padEnd(5, '☆')}</td>
        <td><button class="btn btn-danger" onclick="delReview(${i})">Xóa</button></td>
    </tr>
    `).join('');
}
window.renderReviews = renderReviews;

function delReview(idx) {
    if (!confirm("Xóa đánh giá này?")) return;
    let arr = getReviews(); arr.splice(idx, 1); setReviews(arr); renderReviews();
}
window.delReview = delReview;

// --- Doanh thu ---
function getRevenue() { return JSON.parse(localStorage.getItem('revenue') || '[]'); }
function renderRevenue() {
    let arr = getRevenue();
    document.getElementById('revenueList').innerHTML = arr.map(x =>
        `<tr><td>${escapeHtml(x.month)}</td><td>${Number(x.total).toLocaleString()}</td></tr>`
    ).join('');
}
window.renderRevenue = renderRevenue;

// --- Thống kê sản phẩm ---
function renderStat() {
    let arr = getProducts();
    // Theo chủ sở hữu
    let byOwner = {};
    arr.forEach(p => byOwner[p.owner] = (byOwner[p.owner] || 0) + 1);
    let html = '<b>Theo chủ sở hữu:</b><ul>';
    for (let k in byOwner) html += `<li>${escapeHtml(k)}: ${byOwner[k]} sản phẩm</li>`;
    html += '</ul>'; document.getElementById('statByOwner').innerHTML = html;
    // Theo trạng thái
    let byStatus = {};
    arr.forEach(p => byStatus[p.status] = (byStatus[p.status] || 0) + 1);
    html = '<b>Theo trạng thái:</b><ul>';
    for (let k in byStatus) html += `<li>${escapeHtml(k)}: ${byStatus[k]}</li>`;
    html += '</ul>'; document.getElementById('statByStatus').innerHTML = html;
    // Top sản phẩm (thô)
    document.getElementById('statHot').innerHTML = '<b>Sản phẩm đầu tiên:</b> ' + (arr[0] ?.name || "Chưa có");
}
window.renderStat = renderStat;

// Đăng xuất admin
function logout() {
    localStorage.removeItem("isAdmin");
    window.location = 'login.html';
}
window.logout = logout;

// --- Rerender tất cả khi vào trang ---
function rerenderAll() {
    dashboardUpdate();
    renderProducts();
    renderOrders();
    renderUsers();
    renderReviews();
    renderRevenue();
    renderStat();
}
rerenderAll();
// File được include trong trang admin (ví dụ <script src="js/admin.js"></script>)
// Mục tiêu: buộc redirect nếu user không phải admin. Kiểm tra ưu tiên token+user, fallback isAdmin flag.

(function () {
    // Kiểm tra token & user object
    const token = localStorage.getItem('auth_token');
    const userJson = localStorage.getItem('user');
    const isAdminFlag = localStorage.getItem('isAdmin');

    function redirectToLogin(msg) {
        // Thông báo ngắn rồi redirect
        if (msg) console.warn(msg);
        window.location = 'login.html';
    }

    // Nếu không có token, redirect ngay
    if (!token) {
        redirectToLogin('Không tìm thấy token — chuyển về login');
        return;
    }

    // Nếu user có role admin thì ok
    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            if (user && user.role && user.role.toLowerCase() === 'admin') {
                // OK: là admin
                return;
            }
        } catch (e) {
            // parse lỗi -> tiếp tục kiểm tra isAdminFlag
            console.warn('Không parse được user từ localStorage', e);
        }
    }

    // Fallback: nếu có cờ isAdmin (dùng cho demo)
    if (isAdminFlag === '1') {
        return;
    }

    // Nếu tới đây nghĩa là không xác nhận là admin
    redirectToLogin('Tài khoản không có quyền admin');
})();