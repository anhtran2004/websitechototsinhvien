// =========================
// CART FUNCTIONS
// =========================

// Lấy giỏ hàng
function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

// Lưu giỏ hàng
function setCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Tạo giá demo nếu chưa có
function generateDemoCart() {
    let cart = getCart();
    if (cart.length && cart[0].price) return;
    cart.forEach(i => i.price = 56000);
    setCart(cart);
}

// Render bảng giỏ hàng
function renderCartTable() {
    generateDemoCart();
    const cart = getCart();
    let tbody = '';

    cart.forEach((item, idx) => {
        tbody += `
        <tr>
            <td><input type="checkbox" class="cart-chk" data-idx="${idx}"></td>
            <td class="cart-thumb"><img src="${item.img}" alt=""></td>
            <td class="cart-title-cell">${item.name}</td>
            <td class="cart-price">${(item.price || 0).toLocaleString()} VNĐ</td>
            <td><button class="cart-remove-btn" data-idx="${idx}" title="Xóa"><i class="fa fa-trash"></i></button></td>
        </tr>`;
    });

    document.getElementById('cartBody').innerHTML =
        cart.length ? tbody :
            `<tr><td colspan="5" style="padding:32px;color:#aaa;font-size:17px;">Giỏ hàng trống</td></tr>`;

    // Gán sự kiện xóa
    document.querySelectorAll('.cart-remove-btn').forEach(btn => {
        btn.onclick = function () {
            if (confirm("Xóa sản phẩm này?")) {
                const idx = +this.getAttribute("data-idx");
                let cart = getCart();
                cart.splice(idx, 1);
                setCart(cart);
                renderCartTable();
                updateSum();
            }
        };
    });
}

// =========================
// UPDATE SUM
// =========================
function updateSum() {
    const cart = getCart();
    let sum = 0, cnt = 0;

    document.querySelectorAll('.cart-chk').forEach((chk, idx) => {
        if (chk.checked) {
            cnt++;
            sum += cart[idx].price || 0;
        }
    });

    document.getElementById('sumCount').innerText = cnt;
    document.getElementById('sumPrice').innerText = (sum.toLocaleString()) + " VNĐ";

    // Enable / disable nút thanh toán
    const payBtn = document.getElementById('payBtn');
    if (cnt > 0) {
        payBtn.classList.add('enabled');
        payBtn.disabled = false;
    } else {
        payBtn.classList.remove('enabled');
        payBtn.disabled = true;
    }
}

// =========================
// MAIN
// =========================
document.addEventListener('DOMContentLoaded', () => {

    renderCartTable();
    updateSum();

    // Tick chọn tất cả
    document.getElementById('selectAll').addEventListener('change', function () {
        document.querySelectorAll('.cart-chk').forEach(chk => chk.checked = this.checked);
        updateSum();
    });

    // Tick từng dòng
    document.getElementById('cartBody').addEventListener('change', updateSum);
    document.getElementById('cartBody').addEventListener('click', updateSum);


    // NÚT TIẾN HÀNH THANH TOÁN
    // =========================
    document.getElementById('payBtn').onclick = function () {
        if (!this.classList.contains('enabled')) return;

        // Lấy danh sách sản phẩm được chọn
        const cart = getCart();
        const selectedItems = [];

        document.querySelectorAll('.cart-chk').forEach((chk, idx) => {
            if (chk.checked) selectedItems.push(cart[idx]);
        });

        if (!selectedItems.length) return;

        // Lưu danh sách sản phẩm cần thanh toán sang localStorage
        localStorage.setItem("checkoutData", JSON.stringify(selectedItems));

        // Chuyển sang trang thanh toán
        window.location.href = "checkout.html";
    };

});
