// Dùng cho home.html

// Demo fallback data
let allItems = [
    {
        id: "1",
        name: "Laptop dell",
        img: "https://cdn.pixabay.com/photo/2017/02/08/23/01/laptop-2055520_1280.jpg",
        author: "Nguyễn Văn A",
        progress: "Đang thuê đến: 05/12/2025",
        price: 56000
    },
    {
        id: "2",
        name: "Balo thể thao",
        img: "https://cdn.pixabay.com/photo/2016/11/08/05/34/backpack-1807462_1280.jpg",
        author: "Trần B",
        progress: "Đang thuê đến: 06/12/2025",
        price: 56000
    },
    {
        id: "3",
        name: "Sách kỹ năng mềm",
        img: "https://cdn.pixabay.com/photo/2016/06/01/13/09/study-1425987_1280.jpg",
        author: "Lê C",
        progress: "Đang thuê đến: 07/12/2025",
        price: 56000
    },
    {
        id: "4",
        name: "Áo cử nhân tốt nghiệp",
        img: "https://cdn.pixabay.com/photo/2017/05/13/11/43/graduation-2311314_1280.jpg",
        author: "Huỳnh D",
        progress: "",
        price: 56000
    },
    {
        id: "5",
        name: "Giáo trình Cấu trúc dữ liệu",
        img: "https://cdn.pixabay.com/photo/2016/01/19/15/05/books-1149959_1280.jpg",
        author: "Võ E",
        progress: "",
        price: 56000
    },
    {
        id: "6",
        name: "Máy ảnh Mini",
        img: "https://cdn.pixabay.com/photo/2016/11/21/12/59/camera-1842202_1280.jpg",
        author: "Phạm F",
        progress: "",
        price: 56000
    }
];

let mainItems = allItems.slice(0, 3);
let recommendItems = allItems.slice(3);

function renderMainItems() {
    document.getElementById('mainList').innerHTML =
        mainItems.map(item => `
        <div class="item-card" data-id="${item.id}" data-name="${item.name}" data-img="${item.img}">
            <img class="item-thumb" src="${item.img}" alt="">
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-author">Chủ: ${item.author}</div>
                <div class="item-progress">${item.progress}</div>
                <div class="item-actions">
                    <button class="cart-btn">Thêm vào giỏ</button>
                    <button class="detail-btn" onclick="window.location='product_detail.html?id=${item.id}'">Xem chi tiết</button>
                </div>
            </div>
        </div>
        `).join('');
    bindCartBtn();
}
function renderRecommendItems() {
    document.getElementById('recommendList').innerHTML =
        recommendItems.map(item => `
        <div class="item-card" data-id="${item.id}" data-name="${item.name}" data-img="${item.img}">
            <img class="item-thumb" src="${item.img}" alt="">
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-author">Chủ: ${item.author}</div>
                <div class="item-actions">
                    <button class="cart-btn">Thêm vào giỏ</button>
                    <button class="detail-btn" onclick="window.location='product_detail.html?id=${item.id}'">Xem chi tiết</button>
                </div>
            </div>
        </div>
        `).join('');
    bindCartBtn();
}
function renderAllItems() {
    document.getElementById('allItemsList').innerHTML =
        allItems.map(item => `
        <div class="item-card" data-id="${item.id}" data-name="${item.name}" data-img="${item.img}">
            <img class="item-thumb" src="${item.img}" alt="">
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-author">Chủ: ${item.author}</div>
                ${item.progress ? `<div class="item-progress">${item.progress}</div>` : ""}
                <div class="item-actions">
                    <button class="cart-btn">Thêm vào giỏ</button>
                    <button class="detail-btn" onclick="window.location='product_detail.html?id=${item.id}'">Xem chi tiết</button>
                </div>
            </div>
        </div>
        `).join('');
    bindCartBtn();
}

// Cart logic
function getCart() { return JSON.parse(localStorage.getItem('cart') || '[]'); }
function setCart(cart) { localStorage.setItem('cart', JSON.stringify(cart)); }
function updateCartCount() {
    document.getElementById('cartCount').innerText = getCart().length;
}
function bindCartBtn() {
    document.querySelectorAll('.cart-btn').forEach(btn => {
        btn.onclick = function () {
            const card = this.closest('.item-card');
            const id = card.getAttribute('data-id');
            const itemData = allItems.find(i => i.id === id);
            const item = {
                id: itemData.id,
                name: itemData.name,
                img: itemData.img,
                price: itemData.price
            };
            let cart = getCart();
            if (cart.some(i => i.id === item.id)) {
                alert("Sản phẩm đã có trong giỏ!");
                return;
            }
            cart.push(item);
            setCart(cart);
            updateCartCount();
            alert("Đã thêm vào giỏ hàng!");
        }
    });
}

// Giỏ hàng popup
document.getElementById('cartBtn').onclick = function () {
    renderCart();
    document.getElementById('cartPopup').style.display = 'flex';
};
function renderCart() {
    const cart = getCart();
    const list = document.getElementById('cartList');
    if (!cart.length) {
        list.innerHTML = '<div class="cart-empty">Giỏ hàng trống</div>';
    } else {
        list.innerHTML = cart.map(item =>
            `<div class="cart-item">
                <img src="${item.img}" alt="">
                <div>
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-id" style="font-size:13px;color:#aaa;">Mã: ${item.id}</div>
                </div>
                <button class="cart-remove" data-id="${item.id}">&times;</button>
            </div>`
        ).join('');
    }
}
document.getElementById('cartList').onclick = function (e) {
    if (e.target.classList.contains('cart-remove')) {
        let cart = getCart();
        cart = cart.filter(i => i.id !== e.target.getAttribute('data-id'));
        setCart(cart);
        renderCart();
        updateCartCount();
    }
};
document.body.addEventListener('click', function (e) {
    const popup = document.getElementById('cartPopup');
    if (popup.style.display === 'flex') {
        if (!popup.contains(e.target)
            && e.target.id !== 'cartBtn' && !e.target.closest('#cartBtn')) {
            popup.style.display = 'none';
        }
    }
});

document.querySelector('.search-btn').onclick = function () {
    const kw = document.querySelector('.search-in').value.trim().toLowerCase();
    showAllItemsFiltered(kw);
    document.getElementById('mainView').style.display = "none";
    document.getElementById('allItemsView').style.display = "block";
};
document.querySelector('.search-in').onkeydown = function (e) {
    if (e.key === "Enter") document.querySelector('.search-btn').click();
};
function showAllItemsFiltered(keyword) {
    let filtered = allItems.filter(item =>
        item.name.toLowerCase().includes(keyword) ||
        item.author.toLowerCase().includes(keyword)
    );
    const allItemsListDiv = document.getElementById('allItemsList');
    if (filtered.length) {
        allItemsListDiv.innerHTML = filtered.map(item => `
            <div class="item-card" data-id="${item.id}" data-name="${item.name}" data-img="${item.img}">
                <img class="item-thumb" src="${item.img}" alt="">
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-author">Chủ: ${item.author}</div>
                    ${item.progress ? `<div class="item-progress">${item.progress}</div>` : ""}
                    <div class="item-actions">
                        <button class="cart-btn">Thêm vào giỏ</button>
                        <button class="detail-btn" onclick="window.location='product_detail.html?id=${item.id}'">Xem chi tiết</button>
                    </div>
                </div>
            </div>
            `).join('');
        bindCartBtn();
    } else {
        allItemsListDiv.innerHTML = '<div style="padding:32px;color:#666;font-size:17px;">Không tìm thấy sản phẩm phù hợp.</div>';
    }
}
// Welcome username
let username = localStorage.getItem("username") || "khách";
document.querySelector('.username').innerText = username;

// Khởi tạo
renderMainItems();
renderRecommendItems();
renderAllItems();
updateCartCount();