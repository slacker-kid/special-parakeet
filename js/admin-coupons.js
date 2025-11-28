// Admin Coupon Management Logic

// Check authentication
const user = JSON.parse(localStorage.getItem('user'));
if (!user || !user.isAdmin) {
    window.location.href = 'login.html';
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCoupons();
    loadUsers();
});

// Toggle Modal
function toggleCreateCouponModal() {
    const modal = document.getElementById('create-coupon-modal');
    modal.classList.toggle('hidden');
}

// Generate Random Code
function generateCouponCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('coupon-code').value = code;
}

// Load Users for Dropdown
async function loadUsers() {
    const select = document.getElementById('target-user');
    try {
        const response = await api.getUsers();
        if (response.result === 'success') {
            response.users.forEach(u => {
                const option = document.createElement('option');
                option.value = u.email; // Using email as identifier for now
                option.textContent = `${u.name} (${u.email})`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Failed to load users', error);
    }
}

// Load Coupons List
async function loadCoupons() {
    const tbody = document.getElementById('coupons-table-body');
    tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center">Loading coupons...</td></tr>';

    try {
        const response = await api.getCoupons();
        if (response.result === 'success') {
            const coupons = response.coupons;

            if (coupons.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">No coupons found. Create one to get started.</td></tr>';
                return;
            }

            tbody.innerHTML = coupons.map(coupon => `
                <tr class="hover:bg-white/5 transition-colors">
                    <td class="px-6 py-4 font-medium text-white">${coupon.code}</td>
                    <td class="px-6 py-4">${coupon.name}</td>
                    <td class="px-6 py-4 truncate max-w-xs">${coupon.description}</td>
                    <td class="px-6 py-4 text-xs">
                        <span class="bg-gray-700 px-2 py-1 rounded text-gray-300">
                            ${coupon.target_user === 'all' ? 'All Users' : coupon.target_user}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-xs text-gray-400">${coupon.unlock_condition || 'None'}</td>
                    <td class="px-6 py-4 text-xs text-pro-green">${new Date(coupon.valid_till).toLocaleDateString()}</td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="deleteCoupon(${coupon.rowIndex})" class="text-red-500 hover:text-red-400 text-sm">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-red-500">Failed to load coupons.</td></tr>';
        }
    } catch (error) {
        console.error('Failed to load coupons', error);
        tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-red-500">Error loading coupons.</td></tr>';
    }
}

// Handle Create Coupon
async function handleCreateCoupon(e) {
    e.preventDefault();

    const btn = document.getElementById('create-btn');
    const originalText = btn.innerText;
    btn.innerText = 'Creating...';
    btn.disabled = true;

    const couponData = {
        name: document.getElementById('coupon-name').value,
        code: document.getElementById('coupon-code').value,
        description: document.getElementById('coupon-description').value,
        target_user: document.getElementById('target-user').value,
        valid_till: document.getElementById('valid-till').value,
        unlock_condition: document.getElementById('unlock-condition').value
    };

    try {
        const response = await api.createCoupon(couponData);
        if (response.result === 'success') {
            alert('Coupon created successfully!');
            toggleCreateCouponModal();
            document.getElementById('create-coupon-form').reset();
            loadCoupons(); // Refresh list
        } else {
            alert('Failed to create coupon: ' + response.message);
        }
    } catch (error) {
        alert('An error occurred. Please try again.');
        console.error(error);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// Delete Coupon
async function deleteCoupon(rowIndex) {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
        const response = await api.deleteCoupon(rowIndex);
        if (response.result === 'success') {
            loadCoupons(); // Refresh list
        } else {
            alert('Failed to delete coupon: ' + response.message);
        }
    } catch (error) {
        alert('Error deleting coupon');
    }
}
