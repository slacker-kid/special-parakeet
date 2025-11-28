// Check Auth
const user = JSON.parse(localStorage.getItem('user'));
if (!user || !user.isAdmin) {
    window.location.href = 'login.html';
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Search Logic
const searchInput = document.getElementById('search-input');
const membersList = document.getElementById('members-list');
let searchTimeout;

searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value;

    if (query.length < 2) {
        membersList.innerHTML = '<div class="text-center text-gray-500 mt-10">Type at least 2 characters</div>';
        return;
    }

    searchTimeout = setTimeout(async () => {
        membersList.innerHTML = '<div class="text-center text-gray-500 mt-10"><i class="fa-solid fa-spinner fa-spin"></i> Searching...</div>';
        const response = await api.searchMember(query);

        if (response.result === 'success') {
            renderMembersList(response.members);
        } else {
            membersList.innerHTML = '<div class="text-center text-red-500 mt-10">Error searching members</div>';
        }
    }, 500);
});

function renderMembersList(members) {
    if (members.length === 0) {
        membersList.innerHTML = '<div class="text-center text-gray-500 mt-10">No members found</div>';
        return;
    }

    membersList.innerHTML = '';
    members.forEach(member => {
        const item = document.createElement('div');
        item.className = 'p-3 rounded-lg bg-black/20 hover:bg-pro-green/10 cursor-pointer transition-colors border border-transparent hover:border-pro-green/30 flex justify-between items-center';
        item.onclick = () => showMemberProfile(member);
        item.innerHTML = `
            <div>
                <h4 class="font-bold text-white">${member.name}</h4>
                <p class="text-xs text-gray-400">${member.email}</p>
            </div>
            <i class="fa-solid fa-chevron-right text-gray-600 text-xs"></i>
        `;
        membersList.appendChild(item);
    });
}

// Profile View Logic
let currentMemberEmail = '';
let currentAttendanceDates = [];

async function showMemberProfile(member) {
    currentMemberEmail = member.email;
    const profileView = document.getElementById('profile-view');

    // Fetch latest attendance data
    try {
        const response = await api.getMemberAttendance(member.email);
        if (response.result === 'success') {
            currentAttendanceDates = response.attendance;
        } else {
            currentAttendanceDates = [];
        }
    } catch (e) {
        console.error('Failed to fetch attendance', e);
        currentAttendanceDates = [];
    }

    // Format Date
    const joinedDate = new Date(member.created_at).toLocaleDateString();

    profileView.innerHTML = `
        <div class="w-full max-w-md animate-fade-in">

            
            <h2 class="text-3xl font-bold text-white mb-1 mt-12">${member.name}</h2>
            <p class="text-gray-400 mb-6">${member.email}</p>

            <div class="grid grid-cols-3 gap-4 mb-8">
                <div class="bg-black/30 p-3 rounded-lg">
                    <span class="block text-xs text-gray-500 uppercase">Age</span>
                    <span class="text-xl font-bold text-white">${member.age}</span>
                </div>
                <div class="bg-black/30 p-3 rounded-lg">
                    <span class="block text-xs text-gray-500 uppercase">Weight</span>
                    <span class="text-xl font-bold text-white">${member.weight}kg</span>
                </div>
                <div class="bg-black/30 p-3 rounded-lg">
                    <span class="block text-xs text-gray-500 uppercase">Height</span>
                    <span class="text-xl font-bold text-white">${member.height}cm</span>
                </div>
            </div>

            <div class="bg-black/30 p-4 rounded-xl mb-6 border border-gray-700">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-gray-400 text-sm">Membership Plan</span>
                    <span class="bg-pro-green text-black text-xs font-bold px-2 py-1 rounded">${member.plan}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-400 text-sm">Joined</span>
                    <span class="text-white text-sm">${joinedDate}</span>
                </div>
            </div>

            <!-- Attendance Calendar -->
            <div class="bg-pro-gray border border-gray-700 p-6 rounded-xl">
                <h3 class="text-lg font-bold text-white mb-4 text-left">Attendance Tracker</h3>
                <div id="admin-calendar" class="grid grid-cols-7 gap-2 text-sm">
                    <!-- Calendar will be injected here -->
                </div>
                <p class="text-xs text-gray-500 mt-4 text-left">Click a date to toggle attendance.</p>
            </div>
        </div>
    `;

    renderAdminCalendar();
}

function renderAdminCalendar() {
    const calendarEl = document.getElementById('admin-calendar');
    if (!calendarEl) return;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Days of week header
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let html = days.map(d => `<div class="text-gray-500 text-xs font-bold py-2">${d}</div>`).join('');

    // Get days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

    // Empty slots for previous month
    for (let i = 0; i < firstDayIndex; i++) {
        html += `<div></div>`;
    }

    // Days
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const isPresent = currentAttendanceDates.includes(dateStr);
        const isToday = i === today.getDate();

        const bgClass = isPresent ? 'bg-pro-green text-black' : 'bg-black/30 text-gray-400 hover:bg-white/10';
        const borderClass = isToday ? 'border border-white' : 'border border-transparent';

        html += `
            <div onclick="toggleAttendance('${dateStr}')" 
                 class="aspect-square flex items-center justify-center rounded-lg cursor-pointer transition-all ${bgClass} ${borderClass}">
                ${i}
            </div>
        `;
    }

    calendarEl.innerHTML = html;
}

async function toggleAttendance(date) {
    const isPresent = currentAttendanceDates.includes(date);
    const newStatus = isPresent ? 'absent' : 'present';

    // Optimistic Update
    if (isPresent) {
        currentAttendanceDates = currentAttendanceDates.filter(d => d !== date);
    } else {
        currentAttendanceDates.push(date);
    }
    renderAdminCalendar();

    try {
        const response = await api.updateAttendance(currentMemberEmail, date, newStatus);
        if (response.result !== 'success') {
            // Revert
            if (isPresent) currentAttendanceDates.push(date);
            else currentAttendanceDates = currentAttendanceDates.filter(d => d !== date);
            renderAdminCalendar();
            alert('Failed to update attendance');
        }
    } catch (e) {
        console.error(e);
        // Revert
        if (isPresent) currentAttendanceDates.push(date);
        else currentAttendanceDates = currentAttendanceDates.filter(d => d !== date);
        renderAdminCalendar();
        alert('Error updating attendance');
    }
}

// Add Member Logic
function toggleAddMemberModal() {
    const modal = document.getElementById('add-member-modal');
    modal.classList.toggle('hidden');
}

async function handleAddMember(e) {
    e.preventDefault();
    const btn = document.getElementById('add-btn');
    const originalText = btn.innerText;

    const memberData = {
        name: document.getElementById('new-name').value,
        email: document.getElementById('new-email').value,
        age: document.getElementById('new-age').value,
        weight: document.getElementById('new-weight').value,
        height: document.getElementById('new-height').value,
        plan: document.getElementById('new-plan').value
    };

    btn.innerText = 'Adding...';
    btn.disabled = true;

    try {
        const response = await api.addMember(memberData);

        if (response.result === 'success') {
            alert('Member added successfully!');
            toggleAddMemberModal();
            document.getElementById('add-member-form').reset();
            // Optionally refresh search if query matches
        } else {
            alert('Error: ' + response.message);
        }
    } catch (err) {
        alert('An error occurred.');
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}
