/**
 * Profile Sidebar Logic
 * Handles the profile button, sidebar toggling, and user data display.
 */

document.addEventListener('DOMContentLoaded', () => {
    initProfile();
});

function initProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    const authContainer = document.querySelector('.auth-buttons-container'); // We'll add this class to the container in HTML

    // If we can't find a specific container, try to find the one with login/register links
    // This is a fallback for existing pages
    const headerRight = document.querySelector('nav .hidden.md\\:flex.items-center.space-x-4');

    if (user) {
        // User is logged in
        if (headerRight) {
            // Remove existing login/register buttons if they exist
            // We'll just clear the container and add our profile button
            headerRight.innerHTML = `
                <div class="relative search-container group mr-4">
                    <input type="text" placeholder="Search"
                        class="bg-pro-gray text-gray-300 rounded-md py-1.5 px-3 pl-3 pr-10 focus:outline-none focus:ring-0 border border-gray-700 transition-all duration-300 w-48 focus:w-64 placeholder-gray-500 text-sm">
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <i class="fa-solid fa-magnifying-glass text-gray-500 group-focus-within:text-pro-green transition-colors"></i>
                    </div>
                </div>
                <button onclick="toggleSidebar()" class="profile-btn group relative">
                    <img src="assets/profile-icon.png" alt="Profile" class="w-10 h-10 rounded-full border-2 border-gray-600 group-hover:border-pro-green transition-all duration-300 object-cover">
                    <div class="absolute bottom-0 right-0 w-3 h-3 bg-pro-green rounded-full border-2 border-pro-dark"></div>
                </button>
            `;
        }

        // Also update mobile menu if present
        const mobileAuth = document.querySelector('#mobile-menu .flex.space-x-2.mt-2');
        if (mobileAuth) {
            mobileAuth.innerHTML = `
                <button onclick="toggleSidebar()" class="w-full text-center py-2 bg-pro-gray border border-gray-600 rounded-md text-white hover:border-pro-green flex items-center justify-center gap-2">
                    <img src="assets/profile-icon.png" alt="Profile" class="w-6 h-6 rounded-full">
                    <span>My Profile</span>
                </button>
            `;
        }

        createSidebar(user);
    }
}

function createSidebar(user) {
    const sidebarHTML = `
        <!-- Sidebar Overlay -->
        <div id="sidebar-overlay" onclick="toggleSidebar()" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] hidden opacity-0 transition-opacity duration-300"></div>

        <!-- Sidebar -->
        <div id="profile-sidebar" class="fixed top-0 right-0 h-full w-80 bg-pro-dark border-l border-gray-800 z-[70] transform translate-x-full transition-transform duration-300 shadow-2xl flex flex-col">
            
            <!-- Header -->
            <div class="p-6 border-b border-gray-800 flex justify-between items-center bg-pro-gray/50">
                <h3 class="text-xl font-bold text-white">My Profile</h3>
                <button onclick="toggleSidebar()" class="text-gray-400 hover:text-white transition-colors">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>

            <!-- User Info -->
            <div class="p-6 flex flex-col items-center border-b border-gray-800">
                <div class="relative mb-4">
                    <img src="assets/profile-icon.png" alt="Profile" class="w-24 h-24 rounded-full border-4 border-pro-green object-cover shadow-lg shadow-pro-green/20">
                    <div class="absolute bottom-1 right-1 w-5 h-5 bg-pro-green rounded-full border-4 border-pro-dark"></div>
                </div>
                <h4 class="text-xl font-bold text-white mb-1">${user.name || 'User'}</h4>
                <p class="text-gray-400 text-sm">${user.email}</p>
                <span class="mt-3 px-3 py-1 bg-pro-green/10 text-pro-green text-xs font-bold rounded-full border border-pro-green/20">
                    ${user.isAdmin ? 'ADMINISTRATOR' : 'MEMBER'}
                </span>
            </div>

            <!-- Menu Items -->
            <div class="flex-1 overflow-y-auto py-4">
                <nav class="space-y-1 px-4">
                    <a href="#" class="flex items-center px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors group">
                        <i class="fa-solid fa-user w-6 text-gray-500 group-hover:text-pro-green transition-colors"></i>
                        <span class="font-medium">Account Settings</span>
                    </a>
                    <a href="rewards.html" class="flex items-center px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors group">
                        <i class="fa-solid fa-gift w-6 text-gray-500 group-hover:text-pro-green transition-colors"></i>
                        <span class="font-medium">My Rewards</span>
                    </a>
                    <a href="#" class="flex items-center px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors group">
                        <i class="fa-solid fa-clock-rotate-left w-6 text-gray-500 group-hover:text-pro-green transition-colors"></i>
                        <span class="font-medium">Workout History</span>
                    </a>
                    ${user.isAdmin ? `
                    <a href="admin-coupons.html" class="flex items-center px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors group">
                        <i class="fa-solid fa-shield-halved w-6 text-gray-500 group-hover:text-pro-green transition-colors"></i>
                        <span class="font-medium">Admin Dashboard</span>
                    </a>
                    ` : ''}
                </nav>
            </div>

            <!-- Footer -->
            <div class="p-6 border-t border-gray-800 bg-pro-gray/30">
                <button onclick="logout()" class="w-full py-3 rounded-lg font-bold bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    Sign Out
                </button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', sidebarHTML);
}

function toggleSidebar() {
    const sidebar = document.getElementById('profile-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (!sidebar || !overlay) return;

    const isOpen = !sidebar.classList.contains('translate-x-full');

    if (isOpen) {
        // Close
        sidebar.classList.add('translate-x-full');
        overlay.classList.remove('opacity-100');
        overlay.classList.add('opacity-0');
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 300);
    } else {
        // Open
        overlay.classList.remove('hidden');
        // Force reflow
        overlay.offsetHeight;
        overlay.classList.remove('opacity-0');
        overlay.classList.add('opacity-100');
        sidebar.classList.remove('translate-x-full');
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}
