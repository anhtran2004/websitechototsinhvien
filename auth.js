// Dùng cho login.html và register.html

// Hiện lỗi từ form submit
function showError(msg) {
    const errEl = document.getElementById('error');
    errEl.innerText = msg;
    errEl.style.display = 'block';
}

// Đăng nhập
if (document.getElementById('loginForm')) {
    const form = document.getElementById('loginForm');
    const errEl = document.getElementById('error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errEl.style.display = 'none';

        const usernameOrEmail = document.getElementById('usernameOrEmail').value.trim();
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernameOrEmail, password })
            });
            const data = await res.json();
            if (!res.ok) {
                errEl.innerText = data.message || 'Đăng nhập thất bại';
                errEl.style.display = 'block';
                return;
            }
            if (data.token) localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user || {}));
            window.location = '/';
        } catch (err) {
            console.error(err);
            errEl.innerText = 'Lỗi kết nối tới server';
            errEl.style.display = 'block';
            // Thêm (hoặc cập nhật) đoạn này trong file xử lý login (sau khi nhận response từ /api/auth/login)
            // Mục tiêu: lưu token, user và gắn isAdmin nếu user.role === 'admin'

            async function handleLoginResponse(res) {
                // res: response body (đã parsed JSON) từ /api/auth/login
                if (res && res.token) localStorage.setItem('auth_token', res.token);
                if (res && res.user) localStorage.setItem('user', JSON.stringify(res.user));

                // Gắn cờ isAdmin cho UI/admin-page (chỉ dùng cho client-side demo)
                if (res && res.user && res.user.role && res.user.role.toLowerCase() === 'admin') {
                    localStorage.setItem('isAdmin', '1');
                } else {
                    localStorage.removeItem('isAdmin');
                }

                // Redirect sau khi login thành công
                window.location = '/admin.html';
            }
        }
    });
}

// Đăng ký
if (document.getElementById('registerForm')) {
    const form = document.getElementById('registerForm');
    const errEl = document.getElementById('error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errEl.style.display = 'none';

        const fullName = document.getElementById('fullName').value.trim();
        const username = document.getElementById('username').value.trim().toLowerCase();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            showError('Mật khẩu không trùng khớp.');
            return;
        }
        if (password.length < 6) {
            showError('Mật khẩu ít nhất 6 ký tự.');
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, username, email, password })
            });
            const data = await res.json();
            if (!res.ok) {
                showError(data.message || 'Đăng ký thất bại');
                return;
            }
            if (data.token) localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user || {}));
            window.location = '/';
        } catch (err) {
            console.error(err);
            showError('Lỗi kết nối tới server.');
        }
    });
}